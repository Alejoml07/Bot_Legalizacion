import { addKeyword } from "@builderbot/bot";
import { ERROR_REPORT_MESSAGE, INIT_REPORT_PROCESS_MESSAGE, REPORT_KEY_WORDS } from "~/constants/travels/report.constant";
import { readDataJson } from "~/services/data-json.service";
import { validatePreviousDataFlow } from "./validate-previous-data-flow";
import { generateReportFlow } from "./generate-report-flow";

export const reportPreviousDataFlow = addKeyword(REPORT_KEY_WORDS)
    .addAnswer(INIT_REPORT_PROCESS_MESSAGE,
        null,
        async (context, { state, gotoFlow, flowDynamic }) => {

            const phoneNumberUser = context.from;

            const jsonData = readDataJson(`downloads/datas/${phoneNumberUser}`);

            if (jsonData === undefined) {

                await flowDynamic(ERROR_REPORT_MESSAGE);

                return;

            }

            const { alimentacion, transporte, propinas } = jsonData;

            if (alimentacion.length === 0 && transporte.length === 0 && propinas.length === 0) {

                await flowDynamic(ERROR_REPORT_MESSAGE);

                return;

            }


            const dataUser = state.get("datosUser");


            if (dataUser === undefined) {

                return gotoFlow(generateReportFlow);

            }

            const {
                compania,
                dependencia,
                nombre,
                documento,
                ciudad,
                motivo,
                fechaIda,
                fechaRegreso,
                anticipo
            } = dataUser;

            await flowDynamic([
                'Datos del usuario:',
                '',
                `Compañía: ${compania}`,
                `Dependencia: ${dependencia}`,
                '',
                `Nombre: ${nombre}`,
                `Documento: ${documento}`,
                '',
                `Ciudad del viaje: ${ciudad}`,
                `Motivo del viaje: ${motivo}`,
                '',
                `Fecha de ida: ${fechaIda}`,
                `Fecha de regreso: ${fechaRegreso}`,
                '',
                `Total anticipo: ${anticipo}`,
            ].join("\n"));

            return gotoFlow(validatePreviousDataFlow);


        }
    );