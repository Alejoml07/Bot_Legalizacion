import { addKeyword, EVENTS } from "@builderbot/bot";
import { INVITATION_TRANSPORT_PROCESS_MESSAGE } from "~/constants/travels/transport.constant";

export const twoOptionTransportFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(INVITATION_TRANSPORT_PROCESS_MESSAGE);