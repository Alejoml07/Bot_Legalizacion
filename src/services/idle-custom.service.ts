import * as fs from 'fs';

import { EVENTS, addKeyword } from '@builderbot/bot'
import { BotContext, BotStateStandAlone, TFlow } from '@builderbot/bot/dist/types';
import { TIMEOUT_PROCESS_MESSAGE } from '~/constants/timer.constant';


const timers = {};


const idleFlow = addKeyword(EVENTS.ACTION).addAction(

    async (_, { state, endFlow }) => {

        return endFlow(TIMEOUT_PROCESS_MESSAGE);
    }

);


const start = (ctx: BotContext, gotoFlow: (a: TFlow) => Promise<void>, ms: number, state: BotStateStandAlone, index: number) => {

    timers[ctx.from] = setTimeout(() => {

        let currentPath = "";

        switch (index) {
            case 1:

                currentPath = state.get("deleteCurrentImage")

                break;

            case 2:

                currentPath = state.get("deleteCurrentAudio");

                break;
        }

        if(currentPath !== "") {
            
            fs.unlinkSync(currentPath);

        }


        return gotoFlow(idleFlow);

    }, ms);

}


const reset = (ctx: BotContext, gotoFlow: (a: TFlow) => Promise<void>, ms: number, state: BotStateStandAlone, index: number) => {

    stop(ctx);

    if (timers[ctx.from]) {

        clearTimeout(timers[ctx.from]);

    }

    start(ctx, gotoFlow, ms, state, index);

}


const stop = (ctx: BotContext) => {

    if (timers[ctx.from]) {

        clearTimeout(timers[ctx.from]);

    }

}

export {
    start,
    reset,
    stop,
    idleFlow,
}