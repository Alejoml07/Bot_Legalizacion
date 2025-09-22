import { addKeyword, EVENTS } from "@builderbot/bot";
import { AFFIRMATIVE_RESPONSES, END_PROCESS_MESSAGE, ERROR_RESPONSE_S_N_MESSAGE, NEGATIVE_RESPONSES } from "~/constants/general-responses.constant";
import { LEGALIZATIONTYPES } from "~/constants/legalization-types.constant";
import { TIMER_END_PROCESS } from "~/constants/timer.constant";
import { VALIDATION_AUDIO_PROCESS } from "~/constants/travels/transport.constant";
import { upsertJsonDataFile } from "~/services/data-json.service";
import { onSendImageAudioDataCloud, onUpdateDataTravel } from "~/services/firebase-generals.service";
import { generateRandomCode } from "~/services/general.service";
import { reset, start, stop } from "~/services/idle-custom.service";
import { alternativeAudioValidationFlow } from "./alternative-audio-validation-flow";
import { apiConfig } from "~/config/api.config";
import { httpClient } from "~/services/http-client.service";
import { AxiosError } from "axios";

interface UpsertTransportPayload {
    user_id: number;
    active: number;
    daysWeekId: number;
    destination: string;
    imagePath: string;
    origin: string;
    total: number;
    translateDetail: string;
    id_solicitud: string;
    transportTypeId: number;
}

async function postUpsertTransport(payload: UpsertTransportPayload) {
    const url = apiConfig.upsertTransportUrl;
    try {
        console.log('[transportFlow] POST:', url, '| payload:', payload);
        const resp = await httpClient.post(url, payload);
        console.log('[transportFlow] HTTPS status:', resp.status, '| data:', resp.data);
        return { ok: true, status: resp.status, data: resp.data };
    } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
            console.error('[transportFlow] HTTPS response status:', err.response.status, '| data:', err.response.data);
            return { ok: false, status: err.response.status, data: err.response.data };
        }
        console.error('[transportFlow] HTTPS error:', err.code, err.message);
        return { ok: false, status: 0, data: null };
    }
}

export const audioFlowValidation = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS, state, 2))
    .addAnswer(VALIDATION_AUDIO_PROCESS,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow, fallBack }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 2);

            const response = context.body.toLowerCase().trim();

            const affirmativeResponses = AFFIRMATIVE_RESPONSES;

            const negativeResponses = NEGATIVE_RESPONSES;

            if (affirmativeResponses.includes(response)) {


                stop(context);
                const userPhone = context.from;
                const transporteData = state.get("transporte");
                const jsonDataPath = state.get("folderJsonDataPath");
                const audioPath = state.get("deleteCurrentAudio");
                const activeDocument = state.get("documentReference");
                const randomName = generateRandomCode();
                const publicUrl = await onSendImageAudioDataCloud(audioPath, `legalizaciones/${userPhone}/${LEGALIZATIONTYPES.travel}/${activeDocument}/${randomName}.ogg`, 'audio/ogg');
                transporteData.audioPath = publicUrl;
                await onUpdateDataTravel(1, userPhone, LEGALIZATIONTYPES.travel, activeDocument, 'transportRecord', transporteData, state);
                await upsertJsonDataFile(jsonDataPath, transporteData, 2);
                // Enviar a API externa transporte
                const selectedUserId = state.get('selectedUserId') as number | undefined;
                const selectedTripId = state.get('selectedTripId') as string | number | undefined;
                if (selectedUserId && selectedTripId) {

                    const rawTipo = (transporteData.tipoTransporte || '').toString().toLowerCase();

                    let transportTypeId = 1; 

                    if (rawTipo.includes('taxi')) transportTypeId = 1;

                    else if (rawTipo.includes('bus')) transportTypeId = 2;

                    else if (rawTipo.includes('metro')) transportTypeId = 3;

                    const payload: UpsertTransportPayload = {

                        user_id: Number(selectedUserId),
                        active: 1,
                        daysWeekId: 2, 
                        destination: transporteData.destino || transporteData.motivo ,
                        imagePath: publicUrl || '',
                        origin: transporteData.origen ,
                        total: Number(transporteData.valor || 0),
                        translateDetail: transporteData.motivo || 'Varios',
                        id_solicitud: String(selectedTripId),
                        transportTypeId
                        
                    };
                    const apiResp = await postUpsertTransport(payload);
                    if (!apiResp.ok) {
                        console.warn('[transportFlow] Registro transporte API falló, se continúa flujo local.');
                    }
                } else {
                    console.warn('[transportFlow] No se envió transporte a API: falta selectedUserId o selectedTripId.');
                }
                // Limpiar solo selección de viaje, NO authUser
                await state.update({
                    selectedTrip: undefined,
                    selectedTripId: undefined,
                    __currentFlow: undefined,
                    __awaitingTripSelect: false
                });
                await flowDynamic(END_PROCESS_MESSAGE);



            } else if (negativeResponses.includes(response)) {

                stop(context);

                return gotoFlow(alternativeAudioValidationFlow);

            } else {

                return fallBack(ERROR_RESPONSE_S_N_MESSAGE);

            }



        }
    );