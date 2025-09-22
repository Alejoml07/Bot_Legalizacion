
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import { MysqlAdapter as Database } from '@builderbot/database-mysql';
import { addKeyword, EVENTS } from '@builderbot/bot';
import { AFFIRMATIVE_RESPONSES, ERROR_RESPONSE_S_N_MESSAGE, MANUAL_DATA_MESSAGE, NEGATIVE_RESPONSES } from '~/constants/general-responses.constant';
import { reset, start, stop } from '~/services/idle-custom.service';
import { TIMER_END_PROCESS } from '~/constants/timer.constant';

import * as fs from 'fs';
import { oneOptionTravelFlow } from './one-option-travel-flow';
import { processEditedImageFlow } from './process-edited-image-flow';

export const editImageDataFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS, state, 1))
    .addAnswer(MANUAL_DATA_MESSAGE,
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

                return gotoFlow(processEditedImageFlow);

            } else if (negativeResponses.includes(response)) {

                stop(context);

                const imagePath = state.get("deleteCurrentImage");

                fs.unlinkSync(imagePath);

                return gotoFlow(oneOptionTravelFlow);

            } else {

                return fallBack(ERROR_RESPONSE_S_N_MESSAGE);

            }

        }
    );