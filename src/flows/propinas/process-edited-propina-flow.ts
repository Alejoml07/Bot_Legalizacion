import { addKeyword, EVENTS } from "@builderbot/bot";
import { CUT_EDIT_SEND_DATA_MESSAGE } from "~/constants/general-responses.constant";
import { TIMER_END_PROCESS_AI } from "~/constants/timer.constant";
import { EDIT_TIP_PROCESS_PROMPT, INVITATION_TIP_PROCESS_MESSAGE } from "~/constants/travels/tip.constant";
import { reset, start, stop } from "~/services/idle-custom.service";


import axios from 'axios';
import { API_KEY_OPENAI, URL_OPENAI } from "~/constants/ai-access.constant";
import { responseTipFlow } from "./response-tip-flow";

export const processEditedPropinaFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS_AI, state, 0))
    .addAnswer(CUT_EDIT_SEND_DATA_MESSAGE,
        {
            capture: true
        },
        async (context, { state, gotoFlow, flowDynamic }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS_AI, state, 0);

            const response = context.body;

            const payload = {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "assistant",
                        content: EDIT_TIP_PROCESS_PROMPT
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

            const jsonData = JSON.parse(responseMessage.content);

            stop(context);

            if (jsonData.code) {

                await state.update({ tipTitle: jsonData.titulo });

                await state.update({ tipValue: jsonData.valor });

                return gotoFlow(responseTipFlow);

            } else {

                await flowDynamic(INVITATION_TIP_PROCESS_MESSAGE);

            }


        }
    );