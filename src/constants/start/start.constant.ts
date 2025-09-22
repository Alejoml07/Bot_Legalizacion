import { getFormattedDate } from "~/services/general.service";

export const START_FLOW = [
    `🙌 Este es el asistente virtual de la app de legalizaciones de Leonisa.`,
    '',
    'Para el viaje actual, ¿Qué actividad deseas registrar?',
    '',
    '(🍔) Envía una foto de la factura de alimentación.',
    '',
    `(🚕) Envía un audio con los detalles del transporte.`,
    `Por ejemplo: "Hoy ${getFormattedDate()} me transporté en taxi de la sede la 33 hasta la tienda el tesoro por un valor de $15,000."`,
    '',
    '(🪙) Envía los datos de la propina.',
    `Por ejemplo: "Propina botones hotel por $6,000"`,
    '',
    '(📝) Envía la palabra *Reporte* para obtener informe final.',
];