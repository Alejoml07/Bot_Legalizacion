import { addKeyword, EVENTS } from "@builderbot/bot";
import { GENERATING_REPORT_MESSAGE } from "~/constants/travels/report.constant";


import * as path from 'path';
import { fileURLToPath } from 'url';
import { readDataJson } from "~/services/data-json.service";
import { resetProcessFlow } from "./reset-process-flow";

export const reportFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(GENERATING_REPORT_MESSAGE,
        {
            delay: 2500
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            const __filename = fileURLToPath(import.meta.url);

            const __dirname = path.dirname(__filename);


            const phoneNumberUser = state.get("phoneNumber");


            const jsonData = readDataJson(`downloads/datas/${phoneNumberUser}`);

            const { alimentacion, transporte, propinas } = jsonData;


            if (alimentacion.length !== 0) {


                const pdfPath = path.resolve(__dirname, `downloads/pdfs/${phoneNumberUser}`, 'respaldo-facturas.pdf');

                await flowDynamic([
                    {
                        body: '🔴 A continuación te compartimos el pdf con la imagenes de las facturas de alimentación.',
                        media: pdfPath
                    }
                ]);

            }


            if (alimentacion.length !== 0 || transporte.length !== 0 || propinas.length !== 0) {


                const excelLegalizationPath = path.resolve(__dirname, `downloads/excels/legalizations/${phoneNumberUser}`, 'legalizacion.xlsx');

                await flowDynamic([
                    {
                        body: '🟢 A continuación te compartimos el excel con los datos de legalización del viaje.',
                        media: excelLegalizationPath
                    }
                ]);

            }


            if (transporte.length !== 0) {


                const excelTransportPath = path.resolve(__dirname, `downloads/excels/transports/${phoneNumberUser}`, 'transporte.xlsx');

                await flowDynamic([
                    {
                        body: '🟢 A continuación te compartimos el excel con los datos de transporte.',
                        media: excelTransportPath
                    }
                ]);

            }


            return gotoFlow(resetProcessFlow);


        }
    );