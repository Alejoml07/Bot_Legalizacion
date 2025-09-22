import { addKeyword } from "@builderbot/bot";
import { API_KEY_OPENAI, URL_OPENAI } from "~/constants/ai-access.constant";
import { LEGALIZATIONTYPES } from "~/constants/legalization-types.constant";
import { INIT_TIP_PROCESS_MESSAGES, INVITATION_TIP_PROCESS_MESSAGE, MAIN_TIP_PROCESS_PROMPT, TIPS_DATA_KEYWORDS } from "~/constants/travels/tip.constant";
import { onSetDataCollectionDocuments, onValidateDataCollectionDocumentActive } from "~/services/firebase-generals.service";
import { setBotDataInit } from "~/services/start-bot.service";
import { StartObjectTravel } from "~/services/start-travel.service";
import { MysqlAdapter as Database } from '@builderbot/database-mysql'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';


import axios from 'axios';
import { responseTipFlow } from "./response-tip-flow";


export const threeOptionTipFlow = addKeyword<Provider, Database>(TIPS_DATA_KEYWORDS)
    .addAnswer(INIT_TIP_PROCESS_MESSAGES,
        null,
        async (context, { state, gotoFlow, flowDynamic }) => {

            await setBotDataInit(context, state);

            const response = context.body;

            const phoneNumberUser = context.from;


            const sesionActive = await onValidateDataCollectionDocumentActive(state, phoneNumberUser);

            if (sesionActive) {

                await onSetDataCollectionDocuments(phoneNumberUser, LEGALIZATIONTYPES.travel, state, StartObjectTravel, '');

            }



            const payload = {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "assistant",
                        content: MAIN_TIP_PROCESS_PROMPT
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


            if (jsonData.code) {


                await state.update({ tipTitle: jsonData.titulo });

                await state.update({ tipValue: jsonData.valor });

                return gotoFlow(responseTipFlow);

            } else {


                await flowDynamic(INVITATION_TIP_PROCESS_MESSAGE);

            }


        }
    );