import { addKeyword, EVENTS } from "@builderbot/bot";
import { CUT_EDIT_SEND_DATA_MESSAGE } from "~/constants/general-responses.constant";
import { TIMER_END_PROCESS_AI } from "~/constants/timer.constant";
import { EDIT_AUDIO_PROCESS_PROMPT, GENERAL_AUDIO_ERROR_MESSAGE } from "~/constants/travels/transport.constant";
import { start, reset, stop } from "~/services/idle-custom.service";


import axios from 'axios';
import { API_KEY_OPENAI, URL_OPENAI } from "~/constants/ai-access.constant";
import { formatNumberWithCommas, transportType } from "~/services/general.service";
import { audioFlowValidation } from "./audio-validation-flow";


export const manualAudioValidationFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS_AI, state, 2))
    .addAnswer(CUT_EDIT_SEND_DATA_MESSAGE,
        {
            capture: true
        },
        async (context, { state, gotoFlow, flowDynamic }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS_AI, state, 2);

            try {

                const transportData = context.body;

                const payload = {
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "assistant",
                            content: EDIT_AUDIO_PROCESS_PROMPT
                        },
                        {
                            role: "user",
                            content: ""
                        }
                    ]
                };

                payload.messages[1].content = transportData;

                const responsex = await axios.post(`${URL_OPENAI}chat/completions`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_KEY_OPENAI}`
                    }
                });

                const data = responsex.data;

                const choices = data.choices;

                const responseMessage = choices[0].message;

                const jsonData = responseMessage.content;

                const { code, response } = JSON.parse(jsonData);

                stop(context);

                if (code) {

                    await flowDynamic(GENERAL_AUDIO_ERROR_MESSAGE);

                    return gotoFlow(manualAudioValidationFlow);

                } else {

                    const { fechaSemana, tipoTransporte, origen, destino, valor, motivo } = response;

                    await flowDynamic([
                        '✅ Los datos obtenidos son:',
                        '',
                        `*Fecha:* ${fechaSemana}`,
                        `*Origen:* ${origen}`,
                        `*Destino:* ${destino}`,
                        `*Tipo de transporte:* ${transportType(tipoTransporte)}`,
                        `*Motivo:* ${motivo}`,
                        `*Valor:* ${formatNumberWithCommas(valor)}`,

                    ].join('\n'));


                    await state.update(
                        {
                            transporte: {
                                fecha: fechaSemana,
                                origen,
                                destino,
                                tipoTransporte,
                                motivo,
                                valor
                            }
                        }
                    );

                    return gotoFlow(audioFlowValidation);

                }

            } catch (error) {
                console.error('manualAudioValidationFlow error:', error);
            }


        }
    );