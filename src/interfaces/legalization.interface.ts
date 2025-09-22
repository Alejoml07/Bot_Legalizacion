export interface PayloadLegalization {
    compania: string;
    nombreViajero: string;
    dependencia: string;
    cedula: number;
    fechaElaboracion: string;
    ciudadViaje: string;
    motivoViaje: string;
    totalAnticipos: PayloadTotalAnticipos;
    tipoCambio: PayloadTipoCambio;
    horaViaje: PayloadHoraViaje;
    totalDineros: PayloadTotalDineros;
    totalDias: number;
    detalleGastosA: PayloadDetalleGastosADE[];
    detalleGastosB: PayloadDetalleGastosBC[];
    detalleGastosC: PayloadDetalleGastosBC[];
    detalleGastosD: PayloadDetalleGastosADE[];
    detalleGastosE: PayloadDetalleGastosADE[];
    detalleGastosF: PayloadDetalleGastosF[];
    propinas: PayloadPropinas;
    transporteUrbanoComunicaciones: PayloadTransporteUrbanoComunicaciones[];

}

export interface PayloadTotalAnticipos {
    anticiposRecibidos:   PayloadCurrencyAnticipos;
    totalGastos:          PayloadCurrencyAnticipos;
    gastosTarjetaCredito: PayloadCurrencyAnticipos;
    totalCostoViaje:      PayloadCurrencyAnticipos;
}

export interface PayloadCurrencyAnticipos {
    pesos:   number;
    dolares: number;
    euros:   number;
}


export interface PayloadTipoCambio {
    dolar:      number;
    otraMoneda: number;
    sufijo:     string;
    cCostos:    number;
}

export interface PayloadHoraViaje {
    salida:  string;
    regreso: string;
    desde:   string;
    hasta:   string;
}

export interface PayloadTotalDineros {
    favorEmpleado: PayloadCurrencyAnticipos;
    cargoEmpleado: PayloadCurrencyAnticipos;
}

export interface PayloadDetalleGastosADE {
    descripcion:              string;
    cuenta:                   number;
    proveedor:                string;
    nit:                      number;
    valorBrutoFacturaSinInva: number;
    iva:                      number;
    impuestoConsumo:          number;
    totalPesos:               number;
}

export interface PayloadDetalleGastosBC {
    descripcion:           string;
    cuenta:                number;
    proveedor:             string;
    nit:                   number;
    tipoMoneda:            string;
    valorMonedaExtranjera: number;
    totalDolares:          number;
    totalPesos:            number;
}

export interface PayloadDetalleGastosF {
    descripcion:  string;
    cuenta:       string;
    lugar:        string;
    nit:          number;
    kilometraje:  number;
    valorGalon:   number;
    totalGalones: number;
    total:        number;
}

export interface PayloadPropinas {
    proveedor: string;
    total:     number;
}


export interface PayloadTransporteUrbanoComunicaciones {
    tipo:         string;
    proveedor:    string;
    nit:          number;
    tipoMoneda:   string;
    valorMoneda:  number;
    totalDolares: number;
    totalPesos:   number;
}