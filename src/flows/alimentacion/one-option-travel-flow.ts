import { addKeyword, EVENTS } from "@builderbot/bot";
import { MysqlAdapter as Database } from '@builderbot/database-mysql'
import { INVITATION_IMAGE_PROCESS } from "~/constants/travels/feeding.constant";
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';

export const oneOptionTravelFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
    .addAnswer(INVITATION_IMAGE_PROCESS);