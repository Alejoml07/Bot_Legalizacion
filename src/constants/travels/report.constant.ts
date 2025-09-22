export const REPORT_KEY_WORDS: string | [string, ...string[]] = ["reporte", "Reporte"];

export const INIT_REPORT_PROCESS_MESSAGE = [
    'Cargando ⚙️...'
];

export const VALIDATE_REPORT_FINAL_DATA_MESSAGE = [
    '¿Están correctos estos datos?',
    '',
    'Responde: ✅Si o ❌No'
];

export const EDIT_PREVIOUS_DATA_MESSAGE = [
    '¿Deseas editar los datos y reutilizarlos de nuevo?',
    '',
    'Responde: ✅Si o ❌No'
];

export const GENERATE_REPORT_DATA_MESSAGE = [
    '🔤 Para entregarte un *reporte completo*, es necesario que por favor ingreses los siguientes datos:',
    '',
    '🚫 Puedes enviar la palabra *cancelar* en cualquier momento para detener el reporte.'
];

export const CANCEL_DATA = ["cancelar", "parar", "detener"];

export const STOPPED_REPORT_PROCESS = [
    '🟢 Se ha detenido el proceso con éxito.'
].join("\n");


export const VALIDATION_DATA_REPORT_MESSAGE = [
    '⚠️ ¿Los datos anteriores están correctos?'
];


export const GENERAL_ERROR_REPORT_MESSAGE = [
    '❌ Atención, Ocurrió un error intenta nuevamente'
].join("\n");


export const PROCESING_REPORT_MESSAGE = [
    'Creando los archivos ⏳...'
];


export const GENERATING_REPORT_MESSAGE = [
    'Preparando los archivos ⌛...'
];


export const RESET_REPORT_MESSAGE = [
    'La legalización del viaje ha finalizado, 🔎 verifica los archivos por favor 👀...'
];


export const LETTERS_PROMPT_TRANSPORT = "Vas a recibir un texto que corresponde a un valor numerico, es obligatorio devolver el valor de forma escrita, por ejemplo: si el texto viene con un valor igual a \"1000\", devolver la respuesta \"mil\", bajo el formato json, en la propiedad message agregar la respuesta obtenida: {\"code\": 1,\"message\":\"...\"}, si ocurre un error de cualquier tipo deolver el json {\"code\": 0,\"message\":\"Ocurrio un error\"}";



export const EDIT_PROMPT_REPORT = "Vas a recibir unos datos que deben tener los siguientes datos: Compañía, Dependencia, Centro de costo, Nombre, Documento, Ciudad del viaje, Motivo del viaje, Fecha de ida, Fecha de regreso y Total anticipo, lo que primero debe validar es que todos estos datos anteriores si esten todos presentes en el mensaje, en caso de exito devolver una respuesta en formato string json {\"code\": 1, \"message\":\"Resultado exitoso\", \"compania\":\"...\",\"dependencia\":\"...\",\"centroCosto\":\"...\",\"nombre\":\"...\",\"documento\":\"...\",\"ciudad\":\"...\",\"motivo\":\"...\",\"fechaIda\":\"...\",\"fechaRegreso\":\"...\",\"anticipo\":\"...\"}, en caso de falla devolver: {\"code\": 0, \"message\":\"Resultado fallido\"}";


export const COMPANY_MESSAGE = [
    'Compañía a la que perteneces (Por ejm: Lingerie, Votre, Dissen.):'
];

export const DEPENDENCY_MESSAGE = [
    'Dependencia (Por ejem: Retail.):'
];

export const COST_CENTER_MESSAGE = [
    'Número del centro de costo (Por ejm: *2247* corresponde "RETAIL DIGITAL LEONISA (RDL)"):'
];

export const NAME_MESSAGE = [
    'Ingresa tu nombre:'
];

export const DOCUMENT_MESSAGE = [
    'Ingresa tu nro. de documento:'
];

export const CITY_MESSAGE = [
    'Ciudad del viaje:'
];

export const MOTIVATION_MESSAGE = [
    'Motivo del viaje:'
];

export const ORIGIN_DATE_MESSAGE = [
    'Fecha de ida (Por ejem: 12-05-2025):'
];

export const RETURN_DATE_MESSAGE = [
    'Fecha de regreso (Por ejem: 16-05-2025):'
];

export const ADVANCE_MESSAGE = [
    'Total anticipo:'
];

export const RESUMEN_MESSAGE = [
    '✅ Los datos ingresados son los siguientes:'
];

export const ERROR_REPORT_MESSAGE = [
    '⚠️ Actualmente no has registrados datos, no se puede generar un informe.'
].join("\n")