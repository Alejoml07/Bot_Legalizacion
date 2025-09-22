export interface PayloadDataTravelLegalization {
    feedingRecord: FeedingRecord[];
    personalData: PersonalData;
    tipsRecord: TipsRecord[];
    transportRecord: TransportRecord[];
    processStatus: ProcessStatus;
}

export interface FeedingRecord {
    anotacion: string;
    establecimiento: string;
    imagePath: string;
    ipoconsumo: string;
    iva: number;
    nit: string;
    propina: number;
    subtotal: number;
    total: number;
}

export interface PersonalData {
    company: string;
    costCenter: string;
    dependency: string;
    document: string;
    name: string;
    originDate: string;
    returnDate: string;
    totalAdvance: number;
    travelCity: string;
    travelJustification: string;
}

export interface TipsRecord {
    titulo: string;
    valor: number;
}

export interface TransportRecord {
    destino: string;
    fecha: string;
    motivo: string;
    origen: string;
    tipoTransporte: string;
    valor: number;
    audioPath: string;
}

export interface ProcessStatus {
    state: number;
}