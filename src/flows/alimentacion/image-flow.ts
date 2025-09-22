import { addKeyword, EVENTS } from "@builderbot/bot";
import { BaileysProvider } from "@builderbot/provider-baileys";
import { MysqlAdapter as Database } from '@builderbot/database-mysql'
import { LEGALIZATIONTYPES } from "~/constants/legalization-types.constant";
import { INIT_IMAGE_PROCESS_MESSAGE, MAIN_PROMPT_FEEDING } from "~/constants/travels/feeding.constant";
import { onSetDataCollectionDocuments, onValidateDataCollectionDocumentActive } from "~/services/firebase-generals.service";
import { setBotDataInit } from "~/services/start-bot.service";
import { StartObjectTravel } from "~/services/start-travel.service";

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import axios from 'axios';
import { API_KEY_OPENAI, URL_OPENAI } from "~/constants/ai-access.constant";
import { formatNumberWithCommas } from "~/services/general.service";
import { imageFlowValidation } from "./image-flow-validation";
import { oneOptionTravelFlow } from "./one-option-travel-flow";


export const imageFlow = addKeyword<BaileysProvider, Database>(EVENTS.MEDIA)
    .addAnswer(INIT_IMAGE_PROCESS_MESSAGE,
        null,
        async (context, { provider, state, flowDynamic, gotoFlow }) => {
            try {
                console.log('[imageFlow] Paso 1: Iniciando flujo de imagen');
                await setBotDataInit(context, state);

                const folderImagePath = state.get("folderImagePath");
                console.log('[imageFlow] Paso 2: folderImagePath', folderImagePath);

                const phoneNumberUser = state.get('phoneNumber');
                console.log('[imageFlow] Paso 3: phoneNumberUser', phoneNumberUser);

                const sesionActive = await onValidateDataCollectionDocumentActive(state, phoneNumberUser);
                console.log('[imageFlow] Paso 4: sesionActive', sesionActive);

                if (sesionActive) {
                    console.log('[imageFlow] Paso 5: Sesión activa, actualizando data collection');
                    await onSetDataCollectionDocuments(phoneNumberUser, LEGALIZATIONTYPES.travel, state, StartObjectTravel, '');
                }

                const localPath = await provider.saveFile(context, { path: folderImagePath });
                console.log('[imageFlow] Paso 6: Imagen guardada en', localPath);

                const fileName = path.basename(localPath);

                // Usar la ruta real devuelta por provider.saveFile
                const imagePath = localPath;
                console.log('[imageFlow] Paso 7: imagePath (real)', imagePath);

                await state.update(
                    {
                        deleteCurrentImage: imagePath
                    }
                );
                console.log('[imageFlow] Paso 8: Estado actualizado con deleteCurrentImage');


                if (!fs.existsSync(imagePath)) {
                    console.error('[imageFlow] ERROR: El archivo de imagen no existe en', imagePath);
                    await flowDynamic('❌ Ocurrió un error al procesar la imagen. El archivo no se encontró. Intenta de nuevo.');
                    return gotoFlow(oneOptionTravelFlow);
                }

                const imageBuffer = fs.readFileSync(imagePath);
                console.log('[imageFlow] Paso 9: Imagen leída correctamente');

                const base64Image = imageBuffer.toString('base64');
                console.log('[imageFlow] Paso 10: Imagen convertida a base64');

                const payload = {
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: MAIN_PROMPT_FEEDING
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 3200
                };
                console.log('[imageFlow] Paso 11: Payload preparado para OpenAI', payload);

                const response = await axios.post(`${URL_OPENAI}chat/completions`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_KEY_OPENAI}`
                    }
                });
                console.log('[imageFlow] Paso 12: Respuesta de OpenAI recibida', response.data);

                const data = response.data;
                const choices = data.choices;
                const responseMessage = choices[0].message;
                const jsonAnalisis = responseMessage.content;
                console.log('[imageFlow] Paso 13: Contenido de análisis', jsonAnalisis);

                const jsonCleaned = jsonAnalisis.replace(/```json/, '').replace(/```/, '').trim();
                const responseAnalisis = JSON.parse(jsonCleaned);
                console.log('[imageFlow] Paso 14: JSON parseado', responseAnalisis);

                if (responseAnalisis.establecimiento !== undefined) {
                    console.log('[imageFlow] Paso 15: Datos válidos detectados');
                    const subtotalFormatted = formatNumberWithCommas(responseAnalisis.subTotal);
                    const ivaFormatted = formatNumberWithCommas(responseAnalisis.impuestosIva);
                    const ipoConsumoFormatted = formatNumberWithCommas(responseAnalisis.impuestosImpoconsumo);
                    const propinaFormatted = formatNumberWithCommas(responseAnalisis.propina);
                    const totalFormatted = formatNumberWithCommas(responseAnalisis.totalFactura);
                    await flowDynamic([
                        '✅ Los datos obtenidos son:',
                        '',
                        `*Establecimiento:* ${responseAnalisis.establecimiento}`,
                        `*Nit:* ${responseAnalisis.nitEstablecimiento}`,
                        '',
                        `*Subtotal:* $ ${subtotalFormatted}`,
                        `*Iva:* $ ${ivaFormatted}`,
                        `*Ipoconsumo:* $ ${ipoConsumoFormatted}`,
                        `*Propina:* $ ${propinaFormatted}`,
                        '',
                        `*Total:* $ ${totalFormatted}`
                    ].join('\n'));
                    await state.update(
                        {
                            alimento: {
                                establecimiento: responseAnalisis.establecimiento,
                                nit: responseAnalisis.nitEstablecimiento,
                                subtotal: responseAnalisis.subTotal,
                                iva: responseAnalisis.impuestosIva,
                                ipoconsumo: responseAnalisis.impuestosImpoconsumo,
                                total: (responseAnalisis.totalFactura - responseAnalisis.propina),
                                propina: responseAnalisis.propina,
                                anotacion: "",
                                imagePath: ""
                            }
                        }
                    );
                    console.log('[imageFlow] Paso 16: Estado actualizado con datos de alimento');
                } else {
                    console.log('[imageFlow] Paso 17: Datos inválidos, eliminando imagen y mostrando mensaje de error');
                    fs.unlinkSync(imagePath);
                    await flowDynamic(`🔔 *Atención:* ${responseAnalisis.message} ❗`);
                    console.log('[imageFlow] Paso 18: Transición a oneOptionTravelFlow');
                    return gotoFlow(oneOptionTravelFlow);
                }
                console.log('[imageFlow] Paso 19: Transición a imageFlowValidation');
                return gotoFlow(imageFlowValidation);
            } catch (error) {
                console.error('[imageFlow] ERROR:', error);
            }
        }
    );