import { addKeyword, EVENTS } from "@builderbot/bot";
import { CUT_EDIT_SEND_DATA_MESSAGE } from "~/constants/general-responses.constant";
import { TIMER_END_PROCESS } from "~/constants/timer.constant";
import { EDIT_PROMPT_REPORT, GENERAL_ERROR_REPORT_MESSAGE } from "~/constants/travels/report.constant";
import { reset, start, stop } from "~/services/idle-custom.service";

import axios from 'axios';
import { API_KEY_OPENAI, URL_OPENAI } from "~/constants/ai-access.constant";
import { createReportDataFlow } from "./create-report-data-flow";

export const editReportDataFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS, state, 0))
    .addAnswer(CUT_EDIT_SEND_DATA_MESSAGE,
        {
            capture: true
        },
        async (context, { state, gotoFlow, flowDynamic }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const response = context.body;

            const payload = {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "assistant",
                        content: EDIT_PROMPT_REPORT
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

                const { compania,
                    dependencia,
                    centroCosto,
                    nombre,
                    documento,
                    ciudad,
                    motivo,
                    fechaIda,
                    fechaRegreso,
                    anticipo
                } = jsonData;

                await state.update(
                    {
                        datosUser: {
                            compania,
                            dependencia,
                            centroCosto,
                            nombre,
                            documento,
                            ciudad,
                            motivo,
                            fechaIda,
                            fechaRegreso,
                            anticipo
                        }
                    }
                );

                return gotoFlow(createReportDataFlow);

            } else {

                await flowDynamic(GENERAL_ERROR_REPORT_MESSAGE);

                return gotoFlow(editReportDataFlow);

            }


        }
    );