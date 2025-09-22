import { addKeyword, EVENTS } from "@builderbot/bot";
import { BaileysProvider } from "@builderbot/provider-baileys";
import { MysqlAdapter as Database } from '@builderbot/database-mysql'
import { GENERAL_AUDIO_ERROR_MESSAGE, INIT_TRANSPORT_PROCESS_MESSAGE, MAIN_AUDIO_PROCESS_PROMPT } from "~/constants/travels/transport.constant";
import { setBotDataInit } from "~/services/start-bot.service";

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import FormData from 'form-data';

import { onSetDataCollectionDocuments, onValidateDataCollectionDocumentActive } from "~/services/firebase-generals.service";
import { LEGALIZATIONTYPES } from "~/constants/legalization-types.constant";
import { StartObjectTravel } from "~/services/start-travel.service";
import { API_KEY_OPENAI, URL_OPENAI } from "~/constants/ai-access.constant";
import { formatNumberWithCommas, getCurrentDate, transportType } from "~/services/general.service";
import { twoOptionTransportFlow } from "./two-option-transport-flow";
import { audioFlowValidation } from "./audio-validation-flow";

export const audioFlow = addKeyword<BaileysProvider, Database>(EVENTS.VOICE_NOTE)
    .addAnswer(INIT_TRANSPORT_PROCESS_MESSAGE,
        null,
        async (context, { provider, state, flowDynamic, gotoFlow }) => {

            try {
                console.log('[audioFlow] Paso 1: Iniciando flujo de audio');
                await setBotDataInit(context, state);

                const folderAudioPath = state.get("folderAudioPath");
                console.log('[audioFlow] Paso 2: folderAudioPath', folderAudioPath);

                const localPath = await provider.saveFile(context, { path: folderAudioPath });
                console.log('[audioFlow] Paso 3: Archivo guardado en', localPath);


                const filenName = path.basename(localPath);
                const phoneNumberUser = state.get('phoneNumber');
                console.log('[audioFlow] Paso 4: phoneNumberUser', phoneNumberUser);

                const sesionActive = await onValidateDataCollectionDocumentActive(state, phoneNumberUser);
                console.log('[audioFlow] Paso 5: sesionActive', sesionActive);

                if (sesionActive) {
                    console.log('[audioFlow] Paso 6: Sesión activa, actualizando data collection');
                    await onSetDataCollectionDocuments(phoneNumberUser, LEGALIZATIONTYPES.travel, state, StartObjectTravel, '');
                }

                // Usar la ruta real devuelta por provider.saveFile
                const audioPath = localPath;
                console.log('[audioFlow] Paso 7: audioPath (real)', audioPath);

                await state.update(
                    {
                        deleteCurrentAudio: audioPath
                    }
                );
                console.log('[audioFlow] Paso 8: Estado actualizado con deleteCurrentAudio');

                const form = new FormData();
                form.append('file', fs.createReadStream(audioPath), {
                    filename: filenName,
                    contentType: 'audio/ogg'
                });
                form.append('model', 'whisper-1');
                console.log('[audioFlow] Paso 9: Formulario preparado para Whisper');

                const audioSpeech = await axios.post(`${URL_OPENAI}audio/transcriptions`, form, {
                    headers: {
                        Authorization: `Bearer ${API_KEY_OPENAI}`
                    }
                });
                console.log('[audioFlow] Paso 10: Transcripción recibida', audioSpeech.data);

                const payload = {
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "assistant",
                            content: MAIN_AUDIO_PROCESS_PROMPT
                        },
                        {
                            role: "user",
                            content: ""
                        }
                    ]
                };

                payload.messages[1].content = audioSpeech.data.text;
                console.log('[audioFlow] Paso 11: Payload para chat completions', payload);

                const responsex = await axios.post(`${URL_OPENAI}chat/completions`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_KEY_OPENAI}`
                    }
                });
                console.log('[audioFlow] Paso 12: Respuesta de chat completions', responsex.data);

                const data = responsex.data;
                const choices = data.choices;
                const responseMessage = choices[0].message;
                const jsonAudio = responseMessage.content;
                console.log('[audioFlow] Paso 13: Contenido JSON del audio', jsonAudio);

                const { code, response } = JSON.parse(jsonAudio);
                console.log('[audioFlow] Paso 14: code y response', code, response);

                if (code) {
                    console.log('[audioFlow] Paso 15: Error en audio, eliminando archivo y mostrando mensaje de error');
                    fs.unlinkSync(audioPath);
                    await flowDynamic(GENERAL_AUDIO_ERROR_MESSAGE);
                    console.log('[audioFlow] Paso 16: Transición a twoOptionTransportFlow');
                    return gotoFlow(twoOptionTransportFlow);
                } else {
                    const { tipoTransporte, origen, destino, valor, motivo } = response;
                    let { fechaSemana } = response;
                    if (fechaSemana === '') {
                        fechaSemana = getCurrentDate();
                    }
                    console.log('[audioFlow] Paso 17: Datos extraídos', { tipoTransporte, origen, destino, valor, motivo, fechaSemana });
                    await flowDynamic([
                        '✅ Los datos obtenidos son:',
                        '',
                        `*Fecha:* ${fechaSemana}`,
                        `*Origen:* ${origen}`,
                        `*Destino:* ${destino}`,
                        `*Tipo de transporte:* ${transportType(tipoTransporte)}`,
                        `*Motivo:* ${motivo}`,
                        `*Valor:* ${formatNumberWithCommas(valor)}`,
                    ].join('\n'));
                    await state.update(
                        {
                            transporte: {
                                fecha: fechaSemana,
                                origen,
                                destino,
                                tipoTransporte,
                                motivo,
                                valor
                            }
                        }
                    );
                    console.log('[audioFlow] Paso 18: Estado actualizado con datos de transporte');
                    console.log('[audioFlow] Paso 19: Transición a audioFlowValidation');
                    return gotoFlow(audioFlowValidation);
                }
            } catch (error) {
                console.error('[audioFlow] ERROR:', error);
            }
        }
    );