import { BotStateStandAlone, TFlow } from "@builderbot/bot/dist/types";
import { CANCEL_DATA, STOPPED_REPORT_PROCESS } from "~/constants/travels/report.constant";

export const cancelReportFlow = async (field:string, data: string, flowDynamic: Function, gotoFlow: Function, state: BotStateStandAlone, flow: TFlow) => {

    const responses = CANCEL_DATA;

    if (responses.includes(data)) {

        await flowDynamic(STOPPED_REPORT_PROCESS);

        return gotoFlow(flow);

    }

    await state.update(
        {
            [field]: data
        }
    );

};