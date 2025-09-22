export const MOCK_JSON_LEGALIZATION = {
  "compania": "DISSEN S.A.S.",
  "nombreViajero": "Alejandro Muñoz",
  "dependencia": "Finanzas",
  "cedula": 3137229034,
  "fechaElaboracion": "23/04/2025",
  "ciudadViaje": "Medellín",
  "motivoViaje": "Reunión regional",


  "totalAnticipos": {
    "anticiposRecibidos": { "pesos": 500000, "dolares": 200, "euros": 150 },
    "totalGastos": { "pesos": 450000, "dolares": 180, "euros": 130 },
    "gastosTarjetaCredito": { "pesos": 300000, "dolares": 0, "euros": 0 },
    "totalCostoViaje": { "pesos": 800000, "dolares": 200, "euros": 150 }
  },


  "tipoCambio": {
    "dolar": 3900,
    "otraMoneda": 4200,
    "sufijo": "COP",
    "cCostos": 123456
  },

  "horaViaje": {
    "salida": "08:00",
    "regreso": "18:00",
    "desde": "20/04/2025",
    "hasta": "25/04/2025"
  },


  "totalDineros": {
    "favorEmpleado": { "pesos": 50000, "dolares": 20, "euros": 15 },
    "cargoEmpleado": { "pesos": 10, "dolares": 10, "euros": 10 }
  },


  "totalDias": 5,

  "detalleGastosA": [
    {
      "descripcion": "Almuerzo",
      "cuenta": 559510,
      "proveedor": "Restaurante XYZ",
      "nit": 800123456,
      "valorBrutoFacturaSinInva": 100000,
      "iva": 19000,
      "impuestoConsumo": 8000,
      "totalPesos": 127000
    }
  ],


  "detalleGastosB": [
    {
      "descripcion": "Hospedaje",
      "cuenta": 559520,
      "proveedor": "Hotel ABC",
      "nit": 900123456,
      "tipoMoneda": "USD",
      "valorMonedaExtranjera": 150,
      "totalDolares": 150,
      "totalPesos": 585000
    }
  ],


  "detalleGastosC": [
    {
      "descripcion": "Vuelo Medellín - Bogotá",
      "cuenta": 559530,
      "proveedor": "Avianca",
      "nit": 901234567,
      "tipoMoneda": "USD",
      "valorMonedaExtranjera": 300,
      "totalDolares": 300,
      "totalPesos": 1170000
    }
  ],


  "detalleGastosD": [
    {
      "descripcion": "Cena con cliente",
      "cuenta": 559540,
      "proveedor": "Restaurante GHI",
      "nit": 830123789,
      "valorBrutoFacturaSinInva": 90000,
      "iva": 17100,
      "impuestoConsumo": 7200,
      "totalPesos": 114300
    }
  ],


  "detalleGastosE": [
    {
      "descripcion": "Publicidad impresa",
      "cuenta": 559550,
      "proveedor": "Publicidad JKL",
      "nit": 890123321,
      "valorBrutoFacturaSinInva": 200000,
      "iva": 38000,
      "impuestoConsumo": 16000,
      "totalPesos": 254000
    }
  ],


  "detalleGastosF": {
    "descripcion": "Gasolina",
    "cuenta": "552005",
    "lugar": "Estación Centro",
    "nit": 890123987,
    "kilometraje": 100,
    "valorGalon": 12000,
    "totalGalones": 10,
    "total": 120000
  },


  "propinas": {
    "proveedor": "Varios",
    "total": 0
  },

  
  "transporteUrbanoComunicaciones": [
    {
      "tipo": "Taxis",
      "proveedor": "",
      "nit": 0,
      "tipoMoneda": "",
      "valorMoneda": 0,
      "totalDolares": 0,
      "totalPesos": 0
    },
    {
      "tipo": "Alquiler de vehículo",
      "proveedor": "",
      "nit": 0,
      "tipoMoneda": "",
      "valorMoneda": 0,
      "totalDolares": 0,
      "totalPesos": 0
    },
    {
      "tipo": "Parqueadero",
      "proveedor": "",
      "nit": 0,
      "tipoMoneda": "",
      "valorMoneda": 0,
      "totalDolares": 0,
      "totalPesos": 0
    },
    {
      "tipo": "Peajes",
      "proveedor": "",
      "nit": 0,
      "tipoMoneda": "",
      "valorMoneda": 0,
      "totalDolares": 0,
      "totalPesos": 0
    },
    {
      "tipo": "Tarjeta telefónica",
      "proveedor": "",
      "nit": 0,
      "tipoMoneda": "",
      "valorMoneda": 0,
      "totalDolares": 0,
      "totalPesos": 0
    }
  ]
}