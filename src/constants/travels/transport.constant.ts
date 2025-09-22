import { getFormattedDate } from "~/services/general.service";

export const INIT_TRANSPORT_PROCESS_MESSAGE = [
    'Procesando datos del audio ⏳...'
];

export const INVITATION_TRANSPORT_PROCESS_MESSAGE = [
    '📍 Envía un *audio* con los siguientes datos para registrar el transporte: Fecha, origen, destino, valor y tipo de transporte.',
    '',
    '🔊 Por ejemplo:',
    '',
    `"Hoy *${getFormattedDate()}* me transporté en *Taxi* de la *sede la 33* hasta *la tienda el tesoro* por un valor de *$ 15,000*."`
];

export const MAIN_AUDIO_PROCESS_PROMPT = "Analyze the given text, it is an spanish audio, I need to extract four items with their respective value: the date returned as 'dd-mm-yyyy', the 'dd' values goes from 1 to 30 or 31 depending of the month, the 'mm' month values goes from 1 that is january to 12 that is december, remember yyyy is the current year 2025, if the text does not contain a date associated or exist the 'hoy' word in spanish return empty value '', transport type is mandatory returned as a number associated with transport type (One of this options: taxi = 1, bus = 2, metro = 3, other = 4) by default return 1 if you can not deduct, if the transport is different from taxi, metro or bus, validate if the \"DIDI\", \"INDRIVE\" or \"UBER\" word exist and return 4 that correspond to property 'other', where is the person going to go: the origin and the destination, the cost of this trip only the number associated without '$' simbol or letters and the reason for the trip (it is optional), it is mandatory a json response, if all items exist in the text return: please do not add this: '```json\n' to the beggining of the response and this in the final ''\n```, the response must be a json scaped is mandatory, the response: {\"code\": 0, \"message\": \"succesfully processed\", \"response\" :{\"fechaSemana\": \"...\", \"tipoTransporte\": \"...\", \"origen\": \"...\", \"destino\": \"...\", \"valor\": \"...\", \"motivo\": \"...\"}}, if at least one of this are missing return {\"code\": 1, \"message\": \"Failure in the process\", \"response\": {}}, if there is not reason for the trip present in the text response in the field 'motivo': 'Actividad empresarial' ";

export const GENERAL_AUDIO_ERROR_MESSAGE = '❌ Error en el procesamiento del audio, intente nuevamente.';

export const VALIDATION_AUDIO_PROCESS = [
    '¿Están correctos los datos?',
    '',
    'Responde: ✅Si o ❌No'
];

export const EDIT_AUDIO_PROCESS_PROMPT = "Analyze the given text, I need to extract four items with their respective value: the date returned as 'dd-mm-yyyy', the 'dd' values goes from 1 to 30 or 31 depending of the month, the 'mm' month values goes from 1 that is january to 12 that is december, remember yyyy is the current year 2025, if the text does not contain a date associated or exist the 'hoy' word in spanish set the current date and return the respective value 'dd-mm-yyyy', transport type is mandatory returned as a number associated with transport type (One of this options: taxi = 1, bus = 2, metro = 3, other = 4) by default return 1 if you can not deduct, if the transport is different from taxi, metro or bus return 4 that correspond to property 'other', where is the person going to go: the origin and the destination, the cost of this trip only the number associated without '$' simbol or letters and the reason for the trip (it is optional), it is mandatory a json response, if all items exist in the text return: please do not add this: '```json\n' to the beggining of the response and this in the final ''\n```, the response must be a json scaped is mandatory, the response: {\"code\": 0, \"message\": \"succesfully processed\", \"response\" :{\"fechaSemana\": \"...\", \"tipoTransporte\": \"...\", \"origen\": \"...\", \"destino\": \"...\", \"valor\": \"...\", \"motivo\": \"...\"}}, if at least one of this are missing return {\"code\": 1, \"message\": \"Failure in the process\", \"response\": {}}, if there is not reason for the trip present in the text response in the fiel 'motivo': 'Actividad empresarial' ";
