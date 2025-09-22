export interface PayloadDataTransport {
    datos: DetailDataTransport[],
    totalLetters: string,
    total: number,
    observaciones: string,
    firmaEmpleado: string
}

export interface DetailDataTransport {
    fecha: string,
    diaSemana: string,
    tipoTransporte: {
        taxi: string,
        bus: string,
        metro: string,
        otro: string
    },
    cedula: string,
    nombre: string,
    centroCosto: string,
    motivo: string,
    detalle: {
        origen: string,
        destino: string
    },
    valor: number
}


