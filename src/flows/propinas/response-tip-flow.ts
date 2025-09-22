import { addKeyword, EVENTS } from "@builderbot/bot";
import { RESPONSE_TIP_DATA_ADDED_MESSAGE } from "~/constants/travels/tip.constant";
import { formatNumberWithCommas } from "~/services/general.service";
import { tipFlowValidation } from "./tip-validation-flow";

export const responseTipFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(RESPONSE_TIP_DATA_ADDED_MESSAGE,
        null,
        async (context, { state, flowDynamic, gotoFlow }) => {

            const tipValue = state.get('tipValue');

            const tipValueFormatted = formatNumberWithCommas(tipValue);

            const tipTitle = state.get('tipTitle');

            await flowDynamic([
                `✅ Concepto: ${tipTitle}`,
                `✅ Valor: $ ${tipValueFormatted}`
            ].join('\n'));

            return gotoFlow(tipFlowValidation);


        }
    );