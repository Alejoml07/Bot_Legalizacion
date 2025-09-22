export const TIPS_DATA_KEYWORDS: string | [string, ...string[]] = ["propina", "Propinas"];

export const INIT_TIP_PROCESS_MESSAGES = [
    'Esperando datos de la propina⏳...'
];

export const MAIN_TIP_PROCESS_PROMPT = "Vas a recibir un mensaje, este mensaje esta asociado al concepto de una propina, como por ejemplo: propina restaurante por $6,000, Debes extraer el valor sin simbolos '$', ',' y '.' y la intencion de ese valor tal como 'propina botones', 'propina restaurante'; el texto puede venir sin la palabra propina, lo importante es que traiga un concepto asociado y un valor: {\"code\": 1,\"message\":\"Consulta exitosa\",\"titulo\":\"string\",\"valor\":\"number\"} para el caso exitoso el titulo es la intencion y el valor es el valor de la propina, Si no hay valor o el mensaje no coincide con lo estipulado retornar: {\"code\": 0,\"message\":\"Consulta fallida\"} para el caso fallido";

export const INVITATION_TIP_PROCESS_MESSAGE = [
    '✏️ Para realizar un registro de propina, debes ingresar los siguientes datos: *Concepto* y *valor*',
    '',
    '(Por ejemplo: Propina botones hotel por $6,000...):'
].join('\n');

export const RESPONSE_TIP_DATA_ADDED_MESSAGE = [
    '🔍 Los datos ingresados son:'
];

export const VALIDATE_TIP_DATA_MESSAGE = [
    '¿Están correctos los datos?',
    '',
    'Responde: ✅Si o ❌No'

];

export const EDIT_TIP_PROCESS_PROMPT = "Vas a recibir un mensaje, este mensaje esta asociado al concepto de una propina, como por ejemplo: propina restaurante por $6,000, Debes extraer el valor sin simbolos '$', ',' y '.' y la intencion de ese valor tal como 'propina botones', 'propina restaurante'; el texto puede venir sin la palabra propina, lo importante es que traiga un concepto asociado y un valor: {\"code\": 1,\"message\":\"Consulta exitosa\",\"titulo\":\"string\",\"valor\":\"number\"} para el caso exitoso el titulo es la intencion y el valor es el valor de la propina, Si no hay valor o el mensaje no coincide con lo estipulado retornar: {\"code\": 0,\"message\":\"Consulta fallida\"} para el caso fallido";

