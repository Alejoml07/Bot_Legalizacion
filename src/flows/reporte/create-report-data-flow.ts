import { addKeyword, EVENTS } from "@builderbot/bot";
import { ERROR_REPORT_MESSAGE, LETTERS_PROMPT_TRANSPORT, PROCESING_REPORT_MESSAGE } from "~/constants/travels/report.constant";
import { setBotDataInit } from "~/services/start-bot.service";

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

import { readDataJson } from "~/services/data-json.service";
import { onUpdateDataTravel } from "~/services/firebase-generals.service";
import { LEGALIZATIONTYPES } from "~/constants/legalization-types.constant";
import { generatePdfFromImages } from "~/helpers/pdf-generator";
import { PayloadCurrencyAnticipos, PayloadDetalleGastosADE, PayloadDetalleGastosBC, PayloadDetalleGastosF, PayloadHoraViaje, PayloadLegalization, PayloadPropinas, PayloadTipoCambio, PayloadTotalAnticipos, PayloadTotalDineros, PayloadTransporteUrbanoComunicaciones } from "~/interfaces/legalization.interface";
import { DetailDataTransport, PayloadDataTransport } from "~/interfaces/transport.interface";
import { getDayOfWeek, getFormattedDate } from "~/services/general.service";
import { createLegalizationExcel } from "~/helpers/legalization-generator";
import { API_KEY_OPENAI, URL_OPENAI } from "~/constants/ai-access.constant";
import { createTransportExcel } from "~/helpers/transport-generator";
import { reportFlow } from "./report-flow";

export const createReportDataFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(PROCESING_REPORT_MESSAGE,
        null,
        async (context, { state, gotoFlow, flowDynamic }) => {



            try {

                await setBotDataInit(context, state);

                const __filename = fileURLToPath(import.meta.url);

                const __dirname = path.dirname(__filename);


                const phoneNumberUser = state.get('phoneNumber');

                const activeDocument = state.get("documentReference");

                const datosUser = state.get("datosUser");


                const jsonData = readDataJson(`downloads/datas/${phoneNumberUser}`);

                const { alimentacion, transporte, propinas } = jsonData;


                if (alimentacion.length === 0 && transporte.length === 0 && propinas.length === 0) {

                    await flowDynamic(ERROR_REPORT_MESSAGE);

                    return;

                }






                await onUpdateDataTravel(0, phoneNumberUser, LEGALIZATIONTYPES.travel, activeDocument, 'personalData', datosUser, state);


                await onUpdateDataTravel(0, phoneNumberUser, LEGALIZATIONTYPES.travel, activeDocument, 'processStatus', { state: 1 }, state);



                const folderImagesPath = path.resolve(__dirname, `downloads/images/${phoneNumberUser}`);

                const outputPdfPath = path.resolve(__dirname, `downloads/pdfs/${phoneNumberUser}`, 'respaldo-facturas.pdf');

                const allFiles = fs.readdirSync(folderImagesPath);

                const pdfFiles = allFiles
                    .filter((file) => file.endsWith('.jpeg') || file.endsWith('.jpg'))
                    .map((file) => path.join(folderImagesPath, file));


                const anotations = jsonData.alimentacion.map((data: any) => data.anotacion);


                if (alimentacion.length !== 0) {

                    await generatePdfFromImages(pdfFiles, anotations, outputPdfPath);

                }








                const {
                    compania,
                    dependencia,
                    centroCosto,
                    nombre,
                    documento,
                    ciudad,
                    motivo,
                    fechaIda,
                    fechaRegreso,
                    anticipo
                } = state.get("datosUser");



                let jsonDataPath = state.get("folderJsonDataPath");

                const parts = jsonDataPath.split("/");

                parts.shift();

                parts.shift();

                jsonDataPath = parts.join("/");

                const dataTravel = readDataJson(jsonDataPath);



                let _totalGastosViaje: number = 0;

                const _totalGastosTCViaje: number = 0;

                let _totalCostoViaje: number = 0;

                let _dineroFavorEmpleado: number = 0;

                let _dineroCargoEmpleado: number = 0;






                const tipoCambio: PayloadTipoCambio = {
                    cCostos: centroCosto,
                    dolar: 0,
                    otraMoneda: 0,
                    sufijo: ""
                }




                const detailDataTransport: DetailDataTransport[] = [];

                let totalCostoTransporte = 0;

                dataTravel.transporte.forEach(transport => {

                    const { destino, origen, fecha, motivo, tipoTransporte, valor } = transport;

                    let bus = "";

                    let metro = "";

                    let otro = "";

                    let taxi = "";

                    switch (tipoTransporte) {

                        case "1":

                            taxi = "X";

                            break;

                        case "2":

                            bus = "X";

                            break;

                        case "3":

                            metro = "X";

                            break;

                        case "4":

                            otro = "X";

                            break;

                    }

                    const itemTransport: DetailDataTransport = {
                        cedula: documento,
                        centroCosto: tipoCambio.cCostos.toString(),
                        detalle: {
                            destino,
                            origen
                        },
                        diaSemana: getDayOfWeek(fecha),
                        fecha,
                        motivo,
                        nombre,
                        tipoTransporte: {
                            bus,
                            metro,
                            otro,
                            taxi
                        },
                        valor
                    };

                    detailDataTransport.push(itemTransport);

                    totalCostoTransporte += parseFloat(valor);

                    _totalGastosViaje += parseFloat(valor);

                });






                const alimentaciones = dataTravel.alimentacion.map(item => {

                    const alimento: PayloadDetalleGastosADE = {
                        cuenta: 559510,
                        descripcion: "Logistica Comercial Nacional",
                        impuestoConsumo: item.ipoconsumo,
                        iva: item.iva,
                        nit: item.nit,
                        proveedor: item.establecimiento,
                        totalPesos: (item.total-item.propina),
                        valorBrutoFacturaSinInva: (item.subtotal+item.propina)
                    }

                    _totalGastosViaje += parseFloat(item.total);

                    return alimento;

                });


                const totalPropinas = dataTravel.propinas.reduce((accumulator: number, currentValue: any) => accumulator + currentValue.valor, 0);

                _totalGastosViaje += totalPropinas;

                _totalCostoViaje = _totalGastosViaje + _totalGastosTCViaje;


                const cargoFavorEmpleado = anticipo - _totalCostoViaje;


                if (cargoFavorEmpleado > 0) {

                    _dineroCargoEmpleado = cargoFavorEmpleado;

                } else {

                    _dineroFavorEmpleado = -1 * cargoFavorEmpleado;

                }



                const detalleGastosA: PayloadDetalleGastosADE[] = alimentaciones;

                const detalleGastosB: PayloadDetalleGastosBC[] = [];

                const detalleGastosC: PayloadDetalleGastosBC[] = [];

                const detalleGastosD: PayloadDetalleGastosADE[] = [];

                const detalleGastosE: PayloadDetalleGastosADE[] = [];

                const detalleGastosF: PayloadDetalleGastosF[] = [];





                const horaViaje: PayloadHoraViaje = {
                    desde: fechaIda,
                    hasta: fechaRegreso,
                    regreso: "",
                    salida: ""
                }

                const propinasx: PayloadPropinas = {
                    proveedor: "Varios",
                    total: totalPropinas
                }


                const anticiposRecibidos: PayloadCurrencyAnticipos = {
                    dolares: 0,
                    euros: 0,
                    pesos: anticipo
                }

                const gastosTarjetaCredito: PayloadCurrencyAnticipos = {
                    dolares: 0,
                    euros: 0,
                    pesos: _totalGastosTCViaje
                }

                const totalCostoViaje: PayloadCurrencyAnticipos = {
                    dolares: 0,
                    euros: 0,
                    pesos: _totalCostoViaje
                }

                const totalGastos: PayloadCurrencyAnticipos = {
                    dolares: 0,
                    euros: 0,
                    pesos: _totalGastosViaje
                }

                const totalAnticipos: PayloadTotalAnticipos = {
                    anticiposRecibidos,
                    gastosTarjetaCredito,
                    totalCostoViaje,
                    totalGastos
                }

                const cargoEmpleado: PayloadCurrencyAnticipos = {
                    dolares: 0,
                    euros: 0,
                    pesos: _dineroCargoEmpleado
                }

                const favorEmpleado: PayloadCurrencyAnticipos = {
                    dolares: 0,
                    euros: 0,
                    pesos: _dineroFavorEmpleado
                }

                const totalDineros: PayloadTotalDineros = {
                    cargoEmpleado,
                    favorEmpleado
                }

                const transporteUrbanoComunicaciones: PayloadTransporteUrbanoComunicaciones[] = [
                    {
                        nit: 2222222,
                        proveedor: "Taxis",
                        tipo: "",
                        tipoMoneda: "Peso",
                        totalDolares: 0,
                        totalPesos: totalCostoTransporte,
                        valorMoneda: 0,
                    }
                ];

                const payloadLegalization: PayloadLegalization = {
                    cedula: documento,
                    ciudadViaje: ciudad,
                    compania: compania,
                    dependencia: dependencia,
                    detalleGastosA,
                    detalleGastosB,
                    detalleGastosC,
                    detalleGastosD,
                    detalleGastosE,
                    detalleGastosF,
                    fechaElaboracion: getFormattedDate(),
                    horaViaje,
                    motivoViaje: motivo,
                    nombreViajero: nombre,
                    propinas: propinasx,
                    tipoCambio,
                    totalAnticipos,
                    totalDias: 0,
                    totalDineros,
                    transporteUrbanoComunicaciones
                };



                if (alimentacion.length !== 0 || transporte.length !== 0 || propinas.length !== 0) {

                    const outputExcelLegalizationPath = path.resolve(__dirname, `downloads/excels/legalizations/${phoneNumberUser}`);

                    await createLegalizationExcel(payloadLegalization, outputExcelLegalizationPath, 'legalizacion.xlsx');

                }












                let totalLetters = '';

                const payload = {
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "assistant",
                            content: LETTERS_PROMPT_TRANSPORT
                        },
                        {
                            role: "user",
                            content: totalCostoTransporte.toString()
                        }
                    ]
                };

                const responsex = await axios.post(`${URL_OPENAI}chat/completions`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_KEY_OPENAI}`
                    }
                });

                const data = responsex.data;

                const choices = data.choices;

                const responseMessage = choices[0].message;

                const jsonDatax = JSON.parse(responseMessage.content);

                if (jsonDatax.code) {

                    totalLetters = jsonDatax.message;

                }


                const dataTransport: PayloadDataTransport = {
                    datos: detailDataTransport,
                    firmaEmpleado: nombre,
                    observaciones: 'Sin observaciones',
                    total: totalCostoTransporte,
                    totalLetters
                };




                if (transporte.length !== 0) {

                    const outputExcelTransportPath = path.resolve(__dirname, `downloads/excels/transports/${phoneNumberUser}`);

                    await createTransportExcel(dataTransport, outputExcelTransportPath, 'transporte.xlsx');

                }







                return gotoFlow(reportFlow);

            } catch (error) {
                console.error('createReportDataFlow error:', error);
            }


        }
    );