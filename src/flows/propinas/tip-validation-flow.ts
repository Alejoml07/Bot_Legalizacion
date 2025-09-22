import { addKeyword, EVENTS } from "@builderbot/bot";
import { AFFIRMATIVE_RESPONSES, END_PROCESS_MESSAGE, ERROR_RESPONSE_S_N_MESSAGE, NEGATIVE_RESPONSES } from "~/constants/general-responses.constant";
import { LEGALIZATIONTYPES } from "~/constants/legalization-types.constant";
import { TIMER_END_PROCESS } from "~/constants/timer.constant";
import { VALIDATE_TIP_DATA_MESSAGE } from "~/constants/travels/tip.constant";
import { upsertJsonDataFile } from "~/services/data-json.service";
import { onUpdateDataTravel } from "~/services/firebase-generals.service";
import { reset, start, stop } from "~/services/idle-custom.service";
import axios, { AxiosError } from "axios";
import { apiConfig } from "~/config/api.config";
import { httpClient } from "~/services/http-client.service";

import { processEditedPropinaFlow } from "./process-edited-propina-flow";

// =========================
// Endpoint registro propinas
// =========================
const ADD_TIPS_URL = process.env.ADD_TIPS_URL ?? apiConfig.addTipsUrl;

interface AddTipPayload {
    descripcion: string;
    account: string; // Código contable fijo (asunción)
    userId: number;
    supplier: string;
    totalTip: number;
    idSolicitud: string;
    active: number;
}

async function postAddTip(payload: AddTipPayload) {
  try {
    console.log("[tipsFlow] POST:", ADD_TIPS_URL, "| payload:", payload);
    const resp = await httpClient.post(ADD_TIPS_URL, payload);
    return { ok: true, status: resp.status, data: resp.data };
  } catch (e) {
    const err = e as AxiosError;
    if (err.response) {
      console.error("[tipsFlow] HTTPS response status:", err.response.status, "| data:", err.response.data);
      return { ok: false, status: err.response.status, data: err.response.data };
    }
    console.error("[tipsFlow] HTTPS error:", err.code, err.message);
    return { ok: false, status: 0, data: null };
  }
}

export const tipFlowValidation = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS, state, 0))
    .addAnswer(VALIDATE_TIP_DATA_MESSAGE,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow, fallBack }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const response = context.body.toLowerCase().trim();

            const affirmativeResponses = AFFIRMATIVE_RESPONSES;

            const negativeResponses = NEGATIVE_RESPONSES;

            if (affirmativeResponses.includes(response)) {


                stop(context);
                const userPhone = context.from;
                const tipValue = state.get('tipValue');
                const tipTitle = state.get('tipTitle');
                const selectedUserId = state.get('selectedUserId') as number | undefined;
                const selectedTripId = state.get('selectedTripId') as string | number | undefined;
                const selectedTrip = state.get('selectedTrip') as any | undefined;

                const propina = { titulo: tipTitle, valor: tipValue };

                // Persistencia previa existente
                const jsonDataPath = state.get("folderJsonDataPath");
                const activeDocument = state.get("documentReference");
                await onUpdateDataTravel(1, userPhone, LEGALIZATIONTYPES.travel, activeDocument, 'tipsRecord', propina, state);
                await upsertJsonDataFile(jsonDataPath, propina, 3);

                // =========================
                // Envío a API externa add-tips
                // =========================
                if (selectedUserId && (selectedTripId || selectedTrip)) {
                    const supplier = "Varios";
                    const idSolicitud = String(selectedTripId ?? selectedTrip?.id ?? "");
                    const payload: AddTipPayload = {
                        descripcion: `Propina: ${tipTitle}`,
                        account: "552010",
                        userId: Number(selectedUserId),
                        supplier,
                        totalTip: Number(tipValue),
                        idSolicitud,
                        active: 1
                    };
                    const apiResp = await postAddTip(payload);
                    if (!apiResp.ok) {
                        console.warn("[tipsFlow] Registro de propina en API falló, se continúa flujo local.");
                    }
                } else {
                    console.warn("[tipsFlow] No se pudo enviar propina a API: falta selectedUserId o idSolicitud.");
                }
                await state.update({
                    selectedTrip: undefined,
                    selectedTripId: undefined,
                    __currentFlow: undefined,
                    __awaitingTripSelect: false
                });

                await flowDynamic(END_PROCESS_MESSAGE);

            } else if (negativeResponses.includes(response)) {

                stop(context);

                return gotoFlow(processEditedPropinaFlow);

            } else {

                return fallBack(ERROR_RESPONSE_S_N_MESSAGE);


            }



        }
    );