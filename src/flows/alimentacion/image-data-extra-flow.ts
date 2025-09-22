import { addKeyword, EVENTS } from "@builderbot/bot";
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import { MysqlAdapter as Database } from '@builderbot/database-mysql';
import { reset, start, stop } from "~/services/idle-custom.service";
import { TIMER_END_PROCESS } from "~/constants/timer.constant";
import { CONTINUE_EXTRA_IMAGE_PROCESS_MESSAGE, EXTRAINFO_IMAGE_PROCESS_MESSAGE } from "~/constants/travels/feeding.constant";
import { AFFIRMATIVE_RESPONSES, END_PROCESS_MESSAGE, ERROR_RESPONSE_S_N_MESSAGE, NEGATIVE_RESPONSES } from "~/constants/general-responses.constant";
import { generateRandomCode } from "~/services/general.service";
import { onSendImageAudioDataCloud, onUpdateDataTravel } from "~/services/firebase-generals.service";
import { upsertJsonDataFile } from "~/services/data-json.service";
import { LEGALIZATIONTYPES } from "~/constants/legalization-types.constant";
import { apiConfig } from "~/config/api.config";
import { httpClient } from "~/services/http-client.service";
import axios, { AxiosError } from 'axios';

// Endpoint para registrar alimentación tomado del config central
const UPSERT_LEGALIZATION_URL = apiConfig.upsertLegalizationUrl;

interface UpsertLegalizationPayload {
    legalizationId: number;
    id_solicitud: string;
    account: string;
    description: string;
    nit: string;
    supplier: string;
    total: number;
    totalIpo: number;
    totalIva: number;
    totalNotIva: number;
    userId: number;
    image: string;
    active: number;
}

async function postUpsertLegalization(payload: UpsertLegalizationPayload) {
    try {

        console.log('[feedingFlow] POST:', UPSERT_LEGALIZATION_URL, '| payload:', payload);

        const resp = await httpClient.post(UPSERT_LEGALIZATION_URL, payload);

        console.log('[feedingFlow] HTTPS status:', resp.status, '| data:', resp.data);

        return { ok: true, status: resp.status, data: resp.data };

    } catch (e) {

        const err = e as AxiosError;

        if (err.response) {

            console.error('[feedingFlow] HTTPS response status:', err.response.status, '| data:', err.response.data);

            return { ok: false, status: err.response.status, data: err.response.data };

        }
        
        console.error('[feedingFlow] HTTPS error:', err.code, err.message);

        return { ok: false, status: 0, data: null };
    }
}

export const imageDataExtraFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS, state, 1))
    .addAnswer(EXTRAINFO_IMAGE_PROCESS_MESSAGE,
        {
            capture: true
        },
        async (context, { state, endFlow, fallBack, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 1);

            const response = context.body.toLowerCase().trim();

            const affirmativeResponses = AFFIRMATIVE_RESPONSES;

            const negativeResponses = NEGATIVE_RESPONSES;

            if (negativeResponses.includes(response)) {


                stop(context);
                const alimentoData = state.get("alimento");
                const jsonDataPath = state.get("folderJsonDataPath");
                const userPhone = context.from;
                const imagePath = state.get("deleteCurrentImage");
                const activeDocument = state.get("documentReference");
                const randomName = generateRandomCode();
                const publicUrl = await onSendImageAudioDataCloud(imagePath, `legalizaciones/${userPhone}/${LEGALIZATIONTYPES.travel}/${activeDocument}/${randomName}.jpeg`, 'image/jpeg');
                alimentoData.imagePath = publicUrl;
                await onUpdateDataTravel(1, userPhone, LEGALIZATIONTYPES.travel, activeDocument, 'feedingRecord', alimentoData, state);
                await upsertJsonDataFile(jsonDataPath, alimentoData, 1);

                const selectedUserId = state.get('selectedUserId') as number | undefined;
                const selectedTripId = state.get('selectedTripId') as string | number | undefined;
                if (selectedUserId && selectedTripId) {
                    const payload: UpsertLegalizationPayload = {
                        legalizationId: 1,
                        id_solicitud: String(selectedTripId),
                        account: '559510', 
                        description: alimentoData.establecimiento ? alimentoData.establecimiento : 'Alimentacion nacional',
                        nit: alimentoData.nit,
                        supplier: alimentoData.establecimiento || 'Proveedor alimentación',
                        total: Number(alimentoData.total || alimentoData.subtotal || 0),
                        totalIpo: Number(alimentoData.ipoconsumo || 0),
                        totalIva: Number(alimentoData.iva || 0),
                        totalNotIva: Number(alimentoData.total || alimentoData.subtotal || 0),
                        userId: Number(selectedUserId),
                        image: publicUrl,
                        active: 1
                    };
                    const apiResp = await postUpsertLegalization(payload);
                    if (!apiResp.ok) {
                        console.warn('[feedingFlow] Registro alimentación API falló, se continúa flujo local.');
                    }
                } else {
                    console.warn('[feedingFlow] No se envió alimentación a API: falta selectedUserId o selectedTripId.');
                }
                await state.update({
                    selectedTrip: undefined,
                    selectedTripId: undefined,
                    __currentFlow: undefined,
                    __awaitingTripSelect: false
                });
                return endFlow(END_PROCESS_MESSAGE);

            }

            if (!affirmativeResponses.includes(response)) {

                return fallBack(ERROR_RESPONSE_S_N_MESSAGE);

            }


        }
    )
    .addAnswer(CONTINUE_EXTRA_IMAGE_PROCESS_MESSAGE,
        {
            capture: true
        },
        async (context, { state, endFlow, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 1);
            const response = context.body;
            const userPhone = context.from;
            const alimentoData = state.get("alimento");
            const jsonDataPath = state.get("folderJsonDataPath");
            const imagePath = state.get("deleteCurrentImage");
            const activeDocument = state.get("documentReference");
            const randomName = generateRandomCode();
            const publicUrl = await onSendImageAudioDataCloud(imagePath, `legalizaciones/${userPhone}/${LEGALIZATIONTYPES.travel}/${activeDocument}/${randomName}.jpeg`, 'image/jpeg');
            alimentoData.anotacion = response;
            alimentoData.imagePath = publicUrl;
            await onUpdateDataTravel(1, userPhone, LEGALIZATIONTYPES.travel, activeDocument, 'feedingRecord', alimentoData, state);
            await state.update({ alimento: alimentoData });
            await upsertJsonDataFile(jsonDataPath, alimentoData, 1);
            const selectedUserId = state.get('selectedUserId') as number | undefined;
            const selectedTripId = state.get('selectedTripId') as string | number | undefined;
            if (selectedUserId && selectedTripId) {
                const payload: UpsertLegalizationPayload = {
                    legalizationId: 1,
                    id_solicitud: String(selectedTripId),
                    account: '559510',
                    description: alimentoData.anotacion || 'Alimentacion nacional',
                    nit: alimentoData.nit || '900.121.964-3',
                    supplier: alimentoData.establecimiento || 'Proveedor alimentación',
                    total: Number(alimentoData.total || alimentoData.subtotal || 0),
                    totalIpo: Number(alimentoData.ipoconsumo || 0),
                    totalIva: Number(alimentoData.iva || 0),
                    totalNotIva: Number(alimentoData.total || alimentoData.subtotal || 0),
                    userId: Number(selectedUserId),
                    image: publicUrl,
                    active: 1
                };
                const apiResp = await postUpsertLegalization(payload);
                if (!apiResp.ok) {
                    console.warn('[feedingFlow] Registro alimentación API falló (con anotación), se continúa.');
                }
            } else {
                console.warn('[feedingFlow] No se envió alimentación a API (con anotación): falta selectedUserId o selectedTripId.');
            }
            stop(context);
            // Limpiar solo selección de viaje, NO authUser
            await state.update({
                selectedTrip: undefined,
                selectedTripId: undefined,
                __currentFlow: undefined,
                __awaitingTripSelect: false
            });
            return endFlow(END_PROCESS_MESSAGE);

        }
    );