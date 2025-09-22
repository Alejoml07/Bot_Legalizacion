import { addKeyword, EVENTS } from "@builderbot/bot";
import { AFFIRMATIVE_RESPONSES, ERROR_RESPONSE_S_N_MESSAGE, NEGATIVE_RESPONSES } from "~/constants/general-responses.constant";
import { TIMER_END_PROCESS } from "~/constants/timer.constant";
import { VALIDATION_IMAGE_PROCESS_MESSAGE } from "~/constants/travels/feeding.constant";
import { reset, start,stop } from "~/services/idle-custom.service";
import { imageDataExtraFlow } from "./image-data-extra-flow";
import { editImageDataFlow } from "./edit-image-data-flow";

export const imageFlowValidation = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS, state, 1))
    .addAnswer(VALIDATION_IMAGE_PROCESS_MESSAGE,
        {
            capture: true
        },
        async (context, { state, gotoFlow, fallBack }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 1);

            const response = context.body.toLowerCase().trim();

            const affirmativeResponses = AFFIRMATIVE_RESPONSES;

            const negativeResponses = NEGATIVE_RESPONSES;

            if (affirmativeResponses.includes(response)) {

                stop(context);

                return gotoFlow(imageDataExtraFlow);


            } else if (negativeResponses.includes(response)) {

                stop(context);

                return gotoFlow(editImageDataFlow);

            } else {

                return fallBack(ERROR_RESPONSE_S_N_MESSAGE);

            }



        }
    );