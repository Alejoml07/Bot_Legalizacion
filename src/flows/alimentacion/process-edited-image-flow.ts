import { addKeyword, EVENTS } from "@builderbot/bot";
import { CUT_EDIT_SEND_DATA_MESSAGE, GENERAL_ERROR_MESSAGE } from "~/constants/general-responses.constant";
import { TIMER_END_PROCESS, TIMER_END_PROCESS_AI } from "~/constants/timer.constant";
import { EDIT_PROMPT_FEEDING } from "~/constants/travels/feeding.constant";
import { reset, start, stop } from "~/services/idle-custom.service";


import axios from 'axios';
import { API_KEY_OPENAI, URL_OPENAI } from "~/constants/ai-access.constant";
import { imageFlowValidation } from "./image-flow-validation";

export const processEditedImageFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS, state, 1))
    .addAnswer(CUT_EDIT_SEND_DATA_MESSAGE,
        {
            capture: true
        },
        async (context, { state, gotoFlow, fallBack }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS_AI, state, 1);

            const response = context.body;

            const payload = {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "assistant",
                        content: EDIT_PROMPT_FEEDING
                    },
                    {
                        role: "user",
                        content: ""
                    }
                ]
            };

            payload.messages[1].content = response;

            const responsex = await axios.post(`${URL_OPENAI}chat/completions`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY_OPENAI}`
                }
            });



            const data = responsex.data;

            const choices = data.choices;

            const responseMessage = choices[0].message;

            const responseAnalisis = JSON.parse(responseMessage.content);

            if (responseAnalisis.establecimiento !== undefined) {

                await state.update(
                    {
                        alimento: {
                            establecimiento: responseAnalisis.establecimiento,
                            nit: responseAnalisis.nitEstablecimiento,
                            subtotal: responseAnalisis.subTotal,
                            iva: responseAnalisis.impuestosIva,
                            ipoconsumo: responseAnalisis.impuestosImpoconsumo,
                            propina: responseAnalisis.propina,
                            total: (responseAnalisis.totalFactura - responseAnalisis.propina),
                            anotacion: ""
                        }
                    }
                );

                stop(context);

                return gotoFlow(imageFlowValidation);

            } else {

                return fallBack(GENERAL_ERROR_MESSAGE);

            }



        }
    );