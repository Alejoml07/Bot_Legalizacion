import { addKeyword, EVENTS } from "@builderbot/bot";
import { AFFIRMATIVE_RESPONSES, ERROR_RESPONSE_S_N_MESSAGE, NEGATIVE_RESPONSES } from "~/constants/general-responses.constant";
import { TIMER_END_PROCESS } from "~/constants/timer.constant";
import { VALIDATE_REPORT_FINAL_DATA_MESSAGE } from "~/constants/travels/report.constant";
import { reset, start, stop } from "~/services/idle-custom.service";
import { createReportDataFlow } from "./create-report-data-flow";
import { generateReportFlow } from "./generate-report-flow";

export const validatePreviousDataFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS, state, 0))
    .addAnswer(VALIDATE_REPORT_FINAL_DATA_MESSAGE,
        {
            capture: true
        },
        async (context, { state, gotoFlow, fallBack }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const response = context.body.toLowerCase().trim();

            const affirmativeResponses = AFFIRMATIVE_RESPONSES;

            const negativeResponses = NEGATIVE_RESPONSES;

            if (affirmativeResponses.includes(response)) {

                stop(context);

                return gotoFlow(createReportDataFlow);

            } else if (negativeResponses.includes(response)) {

                stop(context);

                return gotoFlow(generateReportFlow);

            } else {

                return fallBack(ERROR_RESPONSE_S_N_MESSAGE);

            }




        }
    );