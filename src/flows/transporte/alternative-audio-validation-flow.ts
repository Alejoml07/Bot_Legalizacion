import { addKeyword, EVENTS } from "@builderbot/bot";
import { AFFIRMATIVE_RESPONSES, ERROR_RESPONSE_S_N_MESSAGE, MANUAL_DATA_MESSAGE, NEGATIVE_RESPONSES } from "~/constants/general-responses.constant";
import { TIMER_END_PROCESS } from "~/constants/timer.constant";
import { reset, start, stop } from "~/services/idle-custom.service";
import { twoOptionTransportFlow } from "./two-option-transport-flow";

import * as fs from 'fs';
import { manualAudioValidationFlow } from "./manual-audio-validation-flow";

export const alternativeAudioValidationFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS, state, 2))
    .addAnswer(MANUAL_DATA_MESSAGE,
        {
            capture: true
        },
        async (context, { state, gotoFlow, fallBack }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 2);

            const response = context.body.toLowerCase().trim();

            const affirmativeResponses = AFFIRMATIVE_RESPONSES;

            const negativeResponses = NEGATIVE_RESPONSES;

            if (affirmativeResponses.includes(response)) {

                stop(context);

                return gotoFlow(manualAudioValidationFlow);

            } else if (negativeResponses.includes(response)) {

                stop(context);

                const audioPath = state.get("deleteCurrentAudio");

                fs.unlinkSync(audioPath);

                return gotoFlow(twoOptionTransportFlow);

            } else {

                return fallBack(ERROR_RESPONSE_S_N_MESSAGE);

            }

        }
    );