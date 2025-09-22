import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function createLegalizationExcel(json_legalizacion: any, folderPath: string, fileName: string): Promise<any> {

    const __filename = fileURLToPath(import.meta.url);

    const __dirname = path.dirname(__filename);

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Legalizacion gastos');



    // === Estilos de color y formato ===
    const azulOscuro = '002060';
    const grisClaro = 'D9D9D9';
    const blanco = 'FFFFFF';
    const negro = '000000';

    const boldWhiteFont = { bold: true, color: { argb: blanco } };
    const normalBlackFont = { color: { argb: negro } };

    const blueFill: ExcelJS.FillPattern = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: azulOscuro }
    };

    const grayFill: ExcelJS.FillPattern = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: grisClaro }
    };

    const blueStrongFill: ExcelJS.Fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002060' } // Azul fuerte para encabezados
    };

    const border = {
        top: { style: 'thin' as const, color: { argb: negro } },
        left: { style: 'thin' as const, color: { argb: negro } },
        bottom: { style: 'thin' as const, color: { argb: negro } },
        right: { style: 'thin' as const, color: { argb: negro } }
    };

    const alignCenter: Partial<ExcelJS.Alignment> = {
        horizontal: 'center', vertical: 'middle', wrapText: true
    };

    const alignLeft: Partial<ExcelJS.Alignment> = {
        horizontal: 'left', vertical: 'middle', wrapText: true
    };

    // === Ajustes de columnas ===
    worksheet.columns = [
        { width: 22 }, { width: 30 }, { width: 16 }, { width: 16 },
        { width: 5 }, { width: 20 }, { width: 18 }, { width: 18 }, { width: 18 }
    ];

    // === TÍTULO PRINCIPAL ===
    worksheet.mergeCells('A1:I1');
    const titulo = worksheet.getCell('A1');
    titulo.value = 'LEGALIZACIÓN ANTICIPOS DE GASTOS DE VIAJE NACIONAL E INTERNACIONAL';
    titulo.font = { ...boldWhiteFont, size: 12 };
    titulo.fill = blueFill;
    titulo.alignment = alignCenter;
    titulo.border = border;

    // === CABECERA DE DATOS BÁSICOS ===
    const campos = [
        { label: 'COMPAÑÍA', labelCell: 'A3', value: json_legalizacion.compania, valueCell: 'B3', merge: 'B3:E3' },
        { label: 'NOMBRE DEL VIAJERO', labelCell: 'F3', value: json_legalizacion.nombreViajero, valueCell: 'G3', merge: 'G3:I3' },
        { label: 'DEPENDENCIA', labelCell: 'A4', value: json_legalizacion.dependencia, valueCell: 'B4', merge: 'B4:E4' },
        { label: 'CÉDULA', labelCell: 'F4', value: json_legalizacion.cedula, valueCell: 'G4', merge: 'G4:H4' },
        { label: 'FECHA DE ELABORACIÓN', labelCell: 'I4', value: json_legalizacion.fechaElaboracion, valueCell: 'I4' },
        { label: 'CIUDAD DE VIAJE', labelCell: 'A5', value: json_legalizacion.ciudadViaje, valueCell: 'B5', merge: 'B5:I5' },
        { label: 'MOTIVO DEL VIAJE', labelCell: 'A6', value: json_legalizacion.motivoViaje, valueCell: 'B6', merge: 'B6:I6' }
    ];

    campos.forEach(({ label, labelCell, value, valueCell, merge }) => {
        const labelC = worksheet.getCell(labelCell);
        labelC.value = label;
        labelC.font = { bold: true };
        labelC.alignment = alignLeft;

        const valueC = worksheet.getCell(valueCell);
        valueC.value = value;
        valueC.font = normalBlackFont;
        valueC.fill = grayFill;
        valueC.border = border;
        valueC.alignment = alignLeft;

        if (merge) worksheet.mergeCells(merge);
    });



    // === TOTAL ANTICIPOS ===
    const anticiposStartRow = 8;

    // Encabezado TOTAL ANTICIPOS
    worksheet.getCell(`A${anticiposStartRow}`).value = 'TOTAL ANTICIPOS';
    worksheet.getCell(`A${anticiposStartRow}`).fill = blueFill;
    worksheet.getCell(`A${anticiposStartRow}`).font = boldWhiteFont;
    worksheet.getCell(`A${anticiposStartRow}`).alignment = alignCenter;
    worksheet.getCell(`A${anticiposStartRow}`).border = border;

    // Encabezados de moneda
    const monedas = ['PESOS', 'DÓLARES', 'EUROS'];
    ['B', 'C', 'D'].forEach((col, index) => {
        const cell = worksheet.getCell(`${col}${anticiposStartRow}`);
        cell.value = monedas[index];
        cell.fill = blueFill;
        cell.font = boldWhiteFont;
        cell.alignment = alignCenter;
        cell.border = border;
    });

    // === Fila ANTICIPOS RECIBIDOS (A9) ===
    worksheet.getCell('A9').value = 'ANTICIPOS RECIBIDOS';
    worksheet.getCell('A9').alignment = alignLeft;
    worksheet.getCell('A9').border = border;
    worksheet.getCell('A9').fill = grayFill;

    const anticiposRecibidos = json_legalizacion.totalAnticipos.anticiposRecibidos;
    ['B9', 'C9', 'D9'].forEach((cell, i) => {
        worksheet.getCell(cell).value = [
            anticiposRecibidos.pesos,
            anticiposRecibidos.dolares,
            anticiposRecibidos.euros
        ][i];
        worksheet.getCell(cell).alignment = alignCenter;
        worksheet.getCell(cell).border = border;
        worksheet.getCell(cell).fill = grayFill;
    });

    // === Fila TOTAL GASTOS (A10) ===
    worksheet.getCell('A10').value = 'TOTAL GASTOS';
    worksheet.getCell('A10').font = { bold: true };
    worksheet.getCell('A10').alignment = alignLeft;
    worksheet.getCell('A10').border = border;

    const totalGastos = json_legalizacion.totalAnticipos.totalGastos;
    ['B10', 'C10', 'D10'].forEach((cell, i) => {
        worksheet.getCell(cell).value = [
            totalGastos.pesos,
            totalGastos.dolares,
            totalGastos.euros
        ][i];
        worksheet.getCell(cell).alignment = alignCenter;
        worksheet.getCell(cell).border = border;
    });

    // === Fila GASTOS TARJETA CRÉDITO (A11) ===
    worksheet.getCell('A11').value = 'GASTOS TARJETA CRÉDITO';
    worksheet.getCell('A11').alignment = alignLeft;
    worksheet.getCell('A11').border = border;
    worksheet.getCell('A11').fill = grayFill;

    const tarjeta = json_legalizacion.totalAnticipos.gastosTarjetaCredito;
    ['B11'].forEach((cell, i) => {
        worksheet.getCell(cell).value = tarjeta.pesos;
        worksheet.getCell(cell).alignment = alignCenter;
        worksheet.getCell(cell).border = border;
        worksheet.getCell(cell).fill = grayFill;
    });

    // === Fila TOTAL COSTO VIAJE (A12) ===
    worksheet.getCell('A12').value = 'TOTAL COSTO VIAJE';
    worksheet.getCell('A12').font = { bold: true };
    worksheet.getCell('A12').alignment = alignLeft;
    worksheet.getCell('A12').border = border;
    worksheet.getCell('A12').fill = grayFill;

    const totalViaje = json_legalizacion.totalAnticipos.totalCostoViaje;
    ['B12'].forEach((cell, i) => {
        worksheet.getCell(cell).value = totalViaje.pesos;
        worksheet.getCell(cell).alignment = alignCenter;
        worksheet.getCell(cell).border = border;
        worksheet.getCell(cell).fill = grayFill;
    });


    // === TIPO DE CAMBIO ===
    worksheet.mergeCells('F8:I8');
    const tc = worksheet.getCell('F8');
    tc.value = 'TIPO DE CAMBIO';
    tc.fill = blueFill;
    tc.font = boldWhiteFont;
    tc.alignment = alignCenter;
    tc.border = border;

    ['F9', 'G9', 'H9', 'I9'].forEach((cell, i) => {
        const subtitle = ['DÓLAR', 'OTRA MONEDA', 'SUFIJO', 'C. COSTOS'][i];
        const c = worksheet.getCell(cell);
        c.value = subtitle;
        c.fill = blueFill;
        c.font = boldWhiteFont;
        c.alignment = alignCenter;
        c.border = border;
    });

    const tipoCambio = json_legalizacion.tipoCambio;
    const valoresTipoCambio = [
        tipoCambio.dolar,
        tipoCambio.otraMoneda,
        tipoCambio.sufijo,
        tipoCambio.cCostos
    ];

    ['F10', 'G10', 'H10', 'I10'].forEach((cell, i) => {
        const c = worksheet.getCell(cell);
        c.value = valoresTipoCambio[i];
        c.fill = grayFill;
        c.font = normalBlackFont;
        c.alignment = alignCenter;
        c.border = border;
    });

    // === HORA Y FECHA DE VIAJE ===
    worksheet.mergeCells('F12:G12');
    worksheet.mergeCells('H12:I12');
    worksheet.getCell('F12').value = 'HORA DE VIAJE';
    worksheet.getCell('F12').fill = blueFill;
    worksheet.getCell('F12').font = boldWhiteFont;
    worksheet.getCell('F12').alignment = alignCenter;
    worksheet.getCell('F12').border = border;

    worksheet.getCell('H12').value = 'FECHA DEL VIAJE';
    worksheet.getCell('H12').fill = blueFill;
    worksheet.getCell('H12').font = boldWhiteFont;
    worksheet.getCell('H12').alignment = alignCenter;
    worksheet.getCell('H12').border = border;

    ['F13', 'G13', 'H13', 'I13'].forEach((cell, i) => {
        const subtitle = ['SALIDA', 'REGRESO', 'DESDE', 'HASTA'][i];
        const c = worksheet.getCell(cell);
        c.value = subtitle;
        c.fill = blueFill;
        c.font = boldWhiteFont;
        c.alignment = alignCenter;
        c.border = border;
    });

    const horaViaje = json_legalizacion.horaViaje;
    const valoresHoraViaje = [
        horaViaje.salida,
        horaViaje.regreso,
        horaViaje.desde,
        horaViaje.hasta
    ];

    ['F14', 'G14', 'H14', 'I14'].forEach((cell, i) => {
        const c = worksheet.getCell(cell);
        c.value = valoresHoraViaje[i];
        c.fill = grayFill;
        c.font = normalBlackFont;
        c.alignment = alignCenter;
        c.border = border;
    });

    // === # DÍAS ===
    worksheet.getCell('G16').value = '# DÍAS';
    worksheet.getCell('G16').fill = blueFill;
    worksheet.getCell('G16').font = boldWhiteFont;
    worksheet.getCell('G16').alignment = alignCenter;
    worksheet.getCell('G16').border = border;
    worksheet.getCell('H16').value = json_legalizacion.totalDias;
    worksheet.getCell('H16').fill = grayFill;
    worksheet.getCell('H16').font = normalBlackFont;
    worksheet.getCell('H16').alignment = alignCenter;
    worksheet.getCell('H16').border = border;


    // === TOTAL DINEROS ===
    const totalDinerosRow = 16;

    // Encabezado TOTAL DINEROS
    worksheet.getCell(`A${totalDinerosRow}`).value = 'TOTAL DINEROS';
    worksheet.getCell(`A${totalDinerosRow}`).fill = blueFill;
    worksheet.getCell(`A${totalDinerosRow}`).font = boldWhiteFont;
    worksheet.getCell(`A${totalDinerosRow}`).alignment = alignCenter;
    worksheet.getCell(`A${totalDinerosRow}`).border = border;

    // Encabezados de moneda
    const monedasDineros = ['PESOS', 'DÓLARES', 'EUROS'];
    ['B', 'C', 'D'].forEach((col, i) => {
        const cell = worksheet.getCell(`${col}${totalDinerosRow}`);
        cell.value = monedasDineros[i];
        cell.fill = blueFill;
        cell.font = boldWhiteFont;
        cell.alignment = alignCenter;
        cell.border = border;
    });

    // Filas de detalle
    const dineroLabels = ['A FAVOR DEL EMPLEADO', 'A CARGO DEL EMPLEADO'];
    const dineroValores = [
        [
            json_legalizacion.totalDineros.favorEmpleado.pesos,
            json_legalizacion.totalDineros.favorEmpleado.dolares,
            json_legalizacion.totalDineros.favorEmpleado.euros
        ],
        [
            json_legalizacion.totalDineros.cargoEmpleado.pesos,
            json_legalizacion.totalDineros.cargoEmpleado.dolares,
            json_legalizacion.totalDineros.cargoEmpleado.euros
        ]
    ];

    dineroLabels.forEach((label, i) => {
        const row = totalDinerosRow + 1 + i;

        const cellLabel = worksheet.getCell(`A${row}`);
        cellLabel.value = label;
        cellLabel.alignment = alignLeft;
        cellLabel.border = border;

        ['B', 'C', 'D'].forEach((col, j) => {
            const cell = worksheet.getCell(`${col}${row}`);
            cell.value = dineroValores[i][j];
            cell.alignment = alignCenter;
            cell.border = border;
            if (row % 2 === 0) cell.fill = grayFill;
        });

        if (row % 2 === 0) cellLabel.fill = grayFill;
    });


    // === DETALLE DE GASTOS ===
    const detalleStartRow = 21;
    worksheet.mergeCells(`A${detalleStartRow}:H${detalleStartRow}`);
    const tituloDetalle = worksheet.getCell(`A${detalleStartRow}`);
    tituloDetalle.value = 'DETALLE DE GASTOS';
    tituloDetalle.font = boldWhiteFont;
    tituloDetalle.fill = blueFill;
    tituloDetalle.alignment = alignCenter;
    tituloDetalle.border = border;

    // Encabezados
    const headers = [
        { label: 'DESCRIPCIÓN', width: 25 },
        { label: 'CUENTA', width: 12 },
        { label: 'PROVEEDOR', width: 20 },
        { label: 'NIT', width: 15 },
        { label: 'VALOR BRUTO FACT SIN IVA', width: 25 },
        { label: 'IVA\n24080505', width: 15 },
        { label: 'Impuesto al consumo 8%\n559510', width: 22 },
        { label: 'TOTAL PESOS', width: 18 }
    ];

    headers.forEach((h, i) => {
        worksheet.getColumn(i + 1).width = h.width;
        const cell = worksheet.getCell(`${String.fromCharCode(65 + i)}${detalleStartRow + 1}`);
        cell.value = h.label;
        cell.font = boldWhiteFont;
        cell.fill = blueFill;
        cell.alignment = alignCenter;
        cell.border = border;
    });

    // === Bloque 1: Logística Comercial NACIONAL ===
    const detallesA = json_legalizacion.detalleGastosA;
    const detalleRowStart1 = detalleStartRow + 2;

    // Combinar celdas para DESCRIPCIÓN y CUENTA si hay registros
    if (detallesA.length > 0) {
        worksheet.mergeCells(`A${detalleRowStart1}:A${detalleRowStart1 + detallesA.length - 1}`);
        worksheet.mergeCells(`B${detalleRowStart1}:B${detalleRowStart1 + detallesA.length - 1}`);

        const cellDesc1 = worksheet.getCell(`A${detalleRowStart1}`);
        cellDesc1.value = 'Logistica Comercial NACIONAL';
        cellDesc1.alignment = alignLeft;
        cellDesc1.border = border;

        const cellCuenta1 = worksheet.getCell(`B${detalleRowStart1}`);
        cellCuenta1.value = '559510';
        cellCuenta1.alignment = alignCenter;
        cellCuenta1.border = border;
    }

    // Insertar filas dinámicamente
    detallesA.forEach((item: any, index: number) => {
        const row = detalleRowStart1 + index;
        const valores = [
            item.proveedor,
            item.nit,
            item.valorBrutoFacturaSinInva,
            item.iva,
            item.impuestoConsumo,
            item.totalPesos
        ];

        ['C', 'D', 'E', 'F', 'G', 'H'].forEach((col, i) => {
            const cell = worksheet.getCell(`${col}${row}`);
            cell.value = valores[i];
            cell.alignment = alignCenter;
            cell.border = border;
            if (row % 2 === 0) cell.fill = grayFill;
        });
    });


    // === Bloque 2: Herramientas e implementos ===
    const descripcion2 = 'Herramientas e implementos de trabajo: Grupo primario, apoyo,\nconferencias y plan guías';
    const cuenta2 = '959535';
    const detalleRowStart2 = detalleRowStart1 + detallesA.length;
    const detalleRowEnd2 = detalleRowStart2 + 19;

    worksheet.mergeCells(`A${detalleRowStart2}:A${detalleRowEnd2}`);
    worksheet.mergeCells(`B${detalleRowStart2}:B${detalleRowEnd2}`);

    const cellDesc2 = worksheet.getCell(`A${detalleRowStart2}`);
    cellDesc2.value = descripcion2;
    cellDesc2.alignment = alignLeft;
    cellDesc2.border = border;

    const cellCuenta2 = worksheet.getCell(`B${detalleRowStart2}`);
    cellCuenta2.value = cuenta2;
    cellCuenta2.alignment = alignCenter;
    cellCuenta2.border = border;

    for (let row = detalleRowStart2; row <= detalleRowEnd2; row++) {
        for (let col = 3; col <= 8; col++) {
            const colLetter = String.fromCharCode(64 + col);
            const cell = worksheet.getCell(`${colLetter}${row}`);
            cell.value = '-';
            cell.alignment = alignCenter;
            cell.border = border;
            if (row % 2 === 0) cell.fill = grayFill;
        }
    }


    // === Bloque 3: TARJETA DE CRÉDITO Logística Comercial NACIONAL ===
    const descripcion3 = 'TARJETA DE CRÉDITO Logística Comercial NACIONAL';
    const cuenta3 = '559510';
    const detalleRowStart3 = detalleRowEnd2 + 1;
    const detalleRowEnd3 = detalleRowStart3 + 19;

    worksheet.mergeCells(`A${detalleRowStart3}:A${detalleRowEnd3}`);
    worksheet.mergeCells(`B${detalleRowStart3}:B${detalleRowEnd3}`);

    const cellDesc3 = worksheet.getCell(`A${detalleRowStart3}`);
    cellDesc3.value = descripcion3;
    cellDesc3.alignment = alignLeft;
    cellDesc3.border = border;

    const cellCuenta3 = worksheet.getCell(`B${detalleRowStart3}`);
    cellCuenta3.value = cuenta3;
    cellCuenta3.alignment = alignCenter;
    cellCuenta3.border = border;

    for (let row = detalleRowStart3; row <= detalleRowEnd3; row++) {
        for (let col = 3; col <= 8; col++) {
            const colLetter = String.fromCharCode(64 + col);
            const cell = worksheet.getCell(`${colLetter}${row}`);
            cell.value = '-';
            if (row % 2 === 0) cell.fill = grayFill;
            cell.alignment = alignCenter;
            cell.border = border;
        }
    }

    // === Bloque 4: TARJETA DE CRÉDITO Logística Comercial INTERNACIONAL ===
    const descripcion4 = 'TARJETA DE CRÉDITO Logística Comercial INTERNACIONAL';
    const cuenta4 = '559515';
    const detalleRowStart4 = detalleRowEnd3 + 1;
    const detalleRowEnd4 = detalleRowStart4 + 19;

    worksheet.mergeCells(`A${detalleRowStart4}:A${detalleRowEnd4}`);
    worksheet.mergeCells(`B${detalleRowStart4}:B${detalleRowEnd4}`);

    const cellDesc4 = worksheet.getCell(`A${detalleRowStart4}`);
    cellDesc4.value = descripcion4;
    cellDesc4.alignment = alignLeft;
    cellDesc4.border = border;

    const cellCuenta4 = worksheet.getCell(`B${detalleRowStart4}`);
    cellCuenta4.value = cuenta4;
    cellCuenta4.alignment = alignCenter;
    cellCuenta4.border = border;

    for (let row = detalleRowStart4; row <= detalleRowEnd4; row++) {
        for (let col = 3; col <= 8; col++) {
            const colLetter = String.fromCharCode(64 + col);
            const cell = worksheet.getCell(`${colLetter}${row}`);
            cell.value = '-';
            if (row % 2 === 0) cell.fill = grayFill;
            cell.alignment = alignCenter;
            cell.border = border;
        }
    }

    /// === Bloque 5: Propinas ===
    const detalleRowStart5 = detalleRowEnd4 + 1;

    const propinas = json_legalizacion.propinas;

    // Filas tal como aparecen visualmente
    const filasFinales = [
        {
            descripcion: 'PROPINAS',
            cuenta: '',
            proveedor: propinas?.proveedor || 'Varios',
            valor: propinas?.total ?? ''
        },
        { descripcion: 'PENALIDADES', cuenta: '', proveedor: '', valor: '' },
        { descripcion: 'TKT DIFERENTE DE AVIATUR', cuenta: '', proveedor: '', valor: '' },
        { descripcion: 'COMUNICACIONES', cuenta: '552005', proveedor: 'Tarjeta telefónica', valor: '' }
    ];

    // Combinar la cuenta 559510 en las primeras tres filas
    worksheet.mergeCells(`B${detalleRowStart5}:B${detalleRowStart5 + 2}`);
    const cuentaUnificada = worksheet.getCell(`B${detalleRowStart5}`);
    cuentaUnificada.value = '559510';
    cuentaUnificada.alignment = alignCenter;
    cuentaUnificada.border = border;
    cuentaUnificada.fill = grayFill;

    // Renderizar todas las filas
    filasFinales.forEach((item, i) => {
        const row = detalleRowStart5 + i;

        const cells = [
            { col: 'A', value: item.descripcion, align: alignLeft },
            { col: 'C', value: item.proveedor, align: alignLeft },
            { col: 'D', value: '', align: alignCenter },
            { col: 'E', value: '', align: alignCenter },
            { col: 'F', value: '', align: alignCenter },
            { col: 'G', value: '', align: alignCenter },
            { col: 'H', value: item.valor, align: alignCenter }
        ];

        cells.forEach(cellInfo => {
            const cell = worksheet.getCell(`${cellInfo.col}${row}`);
            cell.value = cellInfo.value;
            cell.alignment = cellInfo.align;
            cell.border = border;
            if (row % 2 === 0) cell.fill = grayFill;
        });

        // Aplica gris también a la celda combinada de la cuenta
        if (i !== 0 && i <= 2) {
            const cuentaMergedCell = worksheet.getCell(`B${row}`);
            cuentaMergedCell.border = border;
            if (row % 2 === 0) cuentaMergedCell.fill = grayFill;
        }

        // Celda de cuenta individual para la fila de comunicaciones
        if (i === 3) {
            const cellCuenta = worksheet.getCell(`B${row}`);
            cellCuenta.value = filasFinales[i].cuenta;
            cellCuenta.alignment = alignCenter;
            cellCuenta.border = border;
            if (row % 2 === 0) cellCuenta.fill = grayFill;
        }
    });


    // === Bloque 6: Transporte urbano y comunicaciones ===
    const transporteData = json_legalizacion.transporteUrbanoComunicaciones;
    const detalleRowStart6 = detalleRowStart5 + filasFinales.length + 1;

    // Encabezados
    const transporteHeaders = [
        'DESCRIPCIÓN', 'CUENTA', 'PROVEEDOR', '', 'NIT',
        'SELECCIONE TIPO MONEDA', 'VALOR PESOS O MONEDA EXTRANJERA',
        'TOTAL DÓLARES', 'TOTAL PESOS'
    ];

    // Encabezados de columnas (C y D unificadas visualmente)
    transporteHeaders.forEach((header, i) => {
        const col = String.fromCharCode(65 + i);
        const cell = worksheet.getCell(`${col}${detalleRowStart6}`);
        cell.value = header;
        cell.font = boldWhiteFont;
        cell.fill = blueFill;
        cell.alignment = alignCenter;
        cell.border = border;
    });

    // Combinar encabezado "PROVEEDOR" entre columnas C y D
    worksheet.mergeCells(`C${detalleRowStart6}:D${detalleRowStart6}`);

    const detalleRowStartData6 = detalleRowStart6 + 1;
    let currentRow = detalleRowStartData6;
    const detalleRowEnd6 = currentRow + transporteData.length - 1;

    // Combinar celdas de DESCRIPCIÓN y CUENTA
    worksheet.mergeCells(`A${currentRow}:A${detalleRowEnd6}`);
    worksheet.mergeCells(`B${currentRow}:B${detalleRowEnd6}`);

    worksheet.getCell(`A${currentRow}`).value = 'Transporte urbano y\ncomunicaciones';
    worksheet.getCell(`A${currentRow}`).alignment = alignLeft;
    worksheet.getCell(`A${currentRow}`).border = border;

    worksheet.getCell(`B${currentRow}`).value = '552005';
    worksheet.getCell(`B${currentRow}`).alignment = alignCenter;
    worksheet.getCell(`B${currentRow}`).border = border;

    // Rellenar datos desde JSON
    transporteData.forEach((item: any, index: number) => {
        const row = detalleRowStartData6 + index;

        // TIPO en columna C
        const cellTipo = worksheet.getCell(`C${row}`);
        cellTipo.value = item.tipo;
        cellTipo.alignment = alignLeft;
        cellTipo.border = border;

        // PROVEEDOR en columna D
        const cellProveedor = worksheet.getCell(`D${row}`);
        cellProveedor.value = item.proveedor;
        cellProveedor.alignment = alignLeft;
        cellProveedor.border = border;

        // Columnas E a I
        const values = [
            item.nit,
            item.tipoMoneda,
            item.valorMoneda,
            item.totalDolares,
            item.totalPesos
        ];

        ['E', 'F', 'G', 'H', 'I'].forEach((col, i) => {
            const cell = worksheet.getCell(`${col}${row}`);
            cell.value = values[i];
            cell.alignment = alignCenter;
            cell.border = border;
        });

        // Estilo gris alternado
        if (row % 2 === 0) {
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(col => {
                worksheet.getCell(`${col}${row}`).fill = grayFill;
            });
        }
    });



    // === Bloque 7: Otros gastos (representación, impuestos, trámites) ===
    const detalleRowStart7 = detalleRowEnd6 + 1;

    // Encabezado
    const headers7 = [
        'DESCRIPCIÓN', 'CUENTA', 'PROVEEDOR', 'NIT',
        'VALOR BRUTO FACT SIN IVA', 'IVA 24080505',
        'Impuesto al consumo 8% 559510', 'TOTAL PESOS'
    ];

    headers7.forEach((header, i) => {
        const cell = worksheet.getCell(`${String.fromCharCode(65 + i)}${detalleRowStart7}`);
        cell.value = header;
        cell.font = boldWhiteFont;
        cell.fill = blueFill;
        cell.alignment = alignCenter;
        cell.border = border;
    });

    const rowDataStart = detalleRowStart7 + 1;
    const filasRepresentacion = 5;

    worksheet.mergeCells(`A${rowDataStart}:A${rowDataStart + filasRepresentacion - 1}`);
    worksheet.mergeCells(`B${rowDataStart}:B${rowDataStart + filasRepresentacion - 1}`);

    worksheet.getCell(`A${rowDataStart}`).value = 'Gastos de representación';
    worksheet.getCell(`A${rowDataStart}`).alignment = alignLeft;
    worksheet.getCell(`A${rowDataStart}`).border = border;

    worksheet.getCell(`B${rowDataStart}`).value = '9520';
    worksheet.getCell(`B${rowDataStart}`).alignment = alignCenter;
    worksheet.getCell(`B${rowDataStart}`).border = border;

    // Llenar columnas C-H
    for (let i = 0; i < filasRepresentacion; i++) {
        const row = rowDataStart + i;
        for (let col = 3; col <= 8; col++) {
            const colLetter = String.fromCharCode(64 + col);
            const cell = worksheet.getCell(`${colLetter}${row}`);
            cell.value = col === 8 ? '-' : '';
            cell.alignment = alignCenter;
            cell.border = border;
            if (row % 2 === 0) cell.fill = grayFill;
        }
        if (row % 2 === 0) {
            worksheet.getCell(`A${row}`).fill = grayFill;
            worksheet.getCell(`B${row}`).fill = grayFill;
        }
    }

    // Impuestos y tasas aeroportuarias
    const rowImpuestos = rowDataStart + filasRepresentacion;
    worksheet.getCell(`A${rowImpuestos}`).value = 'Impuestos y tasas aeroportuarias';
    worksheet.getCell(`A${rowImpuestos}`).alignment = alignLeft;
    worksheet.getCell(`A${rowImpuestos}`).border = border;

    worksheet.getCell(`B${rowImpuestos}`).value = '1530';
    worksheet.getCell(`B${rowImpuestos}`).alignment = alignCenter;
    worksheet.getCell(`B${rowImpuestos}`).border = border;

    for (let col = 3; col <= 8; col++) {
        const cell = worksheet.getCell(`${String.fromCharCode(64 + col)}${rowImpuestos}`);
        cell.value = col === 8 ? '-' : '';
        cell.alignment = alignCenter;
        cell.border = border;
        if (rowImpuestos % 2 === 0) cell.fill = grayFill;
    }

    // Trámites consulares
    const rowTramites = rowImpuestos + 1;
    worksheet.getCell(`A${rowTramites}`).value = 'Trámites consulares';
    worksheet.getCell(`A${rowTramites}`).alignment = alignLeft;
    worksheet.getCell(`A${rowTramites}`).border = border;

    worksheet.getCell(`B${rowTramites}`).value = '4025';
    worksheet.getCell(`B${rowTramites}`).alignment = alignCenter;
    worksheet.getCell(`B${rowTramites}`).border = border;

    for (let col = 3; col <= 8; col++) {
        const cell = worksheet.getCell(`${String.fromCharCode(64 + col)}${rowTramites}`);
        cell.value = col === 8 ? '-' : '';
        cell.alignment = alignCenter;
        cell.border = border;
        if (rowTramites % 2 === 0) cell.fill = grayFill;
    }

    currentRow = rowTramites + 1;

    // === Bloque 8: Transporte terrestre y combustible (unido al bloque anterior) ===
    const rowStart8 = currentRow;

    // === TÍTULO TRANSPORTE TERRESTRE ===
    worksheet.mergeCells(`A${rowStart8}:H${rowStart8}`);
    const titleTT = worksheet.getCell(`A${rowStart8}`);
    titleTT.value = 'TRANSPORTE TERRESTRE';
    titleTT.font = boldWhiteFont;
    titleTT.fill = blueStrongFill;
    titleTT.alignment = alignCenter;
    titleTT.border = border;

    // === TRANSPORTE INTERMUNICIPAL (5 filas) ===
    const rowsIntermunicipal = 5;
    const rowTIStart = rowStart8 + 1;
    const rowTIEnd = rowTIStart + rowsIntermunicipal - 1;

    worksheet.mergeCells(`A${rowTIStart}:A${rowTIEnd}`);
    worksheet.mergeCells(`B${rowTIStart}:B${rowTIEnd}`);

    worksheet.getCell(`A${rowTIStart}`).value = 'Transporte intermunicipal';
    worksheet.getCell(`A${rowTIStart}`).alignment = alignLeft;
    worksheet.getCell(`A${rowTIStart}`).border = border;

    worksheet.getCell(`B${rowTIStart}`).value = '552010';
    worksheet.getCell(`B${rowTIStart}`).alignment = alignCenter;
    worksheet.getCell(`B${rowTIStart}`).border = border;

    for (let i = 0; i < rowsIntermunicipal; i++) {
        const row = rowTIStart + i;
        for (let col = 3; col <= 8; col++) {
            const cell = worksheet.getCell(`${String.fromCharCode(64 + col)}${row}`);
            cell.value = col === 8 ? '-' : '';
            cell.alignment = alignCenter;
            cell.border = border;
            if (row % 2 === 0) cell.fill = grayFill;
        }
        if (row % 2 === 0) {
            worksheet.getCell(`A${row}`).fill = grayFill;
            worksheet.getCell(`B${row}`).fill = grayFill;
        }
    }

    // === SUBENCABEZADOS COMBUSTIBLE (sin título superior) ===
    const rowSubHeader = rowTIEnd + 1;
    const subHeaders = [
        'COMBUSTIBLE', '', 'LUGAR', 'NIT', 'KILOMETRAJE',
        'VLOR/ GALÓN', '# GALONES', 'TOTAL'
    ];

    subHeaders.forEach((text, i) => {
        const cell = worksheet.getCell(`${String.fromCharCode(65 + i)}${rowSubHeader}`);
        cell.value = text;
        cell.font = boldWhiteFont;
        cell.fill = blueStrongFill;
        cell.alignment = alignCenter;
        cell.border = border;
    });

    // === FILAS DE COMBUSTIBLE ===
    const rowCombStart = rowSubHeader + 1;
    const rowCombEnd = rowCombStart + rowsIntermunicipal - 1;

    worksheet.mergeCells(`A${rowCombStart}:A${rowCombEnd}`);
    worksheet.mergeCells(`B${rowCombStart}:B${rowCombEnd}`);

    worksheet.getCell(`A${rowCombStart}`).value = 'Transporte intermunicipal';
    worksheet.getCell(`A${rowCombStart}`).alignment = alignLeft;
    worksheet.getCell(`A${rowCombStart}`).border = border;

    worksheet.getCell(`B${rowCombStart}`).value = '552010';
    worksheet.getCell(`B${rowCombStart}`).alignment = alignCenter;
    worksheet.getCell(`B${rowCombStart}`).border = border;

    for (let i = 0; i < rowsIntermunicipal; i++) {
        const row = rowCombStart + i;
        for (let col = 3; col <= 8; col++) {
            const cell = worksheet.getCell(`${String.fromCharCode(64 + col)}${row}`);
            cell.value = col === 8 ? '-' : '';
            cell.alignment = alignCenter;
            cell.border = border;
            if (row % 2 === 0) cell.fill = grayFill;
        }

        if (row % 2 === 0) {
            worksheet.getCell(`A${row}`).fill = grayFill;
            worksheet.getCell(`B${row}`).fill = grayFill;
        }
    }

    // === PLACA VEHÍCULO + TOTAL GASTOS GASOLINA ===
    const rowFinalComb = rowCombEnd + 1;

    worksheet.mergeCells(`A${rowFinalComb}:B${rowFinalComb}`);
    const cellPlaca = worksheet.getCell(`A${rowFinalComb}`);
    cellPlaca.value = 'PLACA VEHÍCULO';
    cellPlaca.font = boldWhiteFont;
    cellPlaca.fill = blueStrongFill;
    cellPlaca.alignment = alignCenter;
    cellPlaca.border = border;

    worksheet.mergeCells(`F${rowFinalComb}:G${rowFinalComb}`);
    const cellTotalText = worksheet.getCell(`F${rowFinalComb}`);
    cellTotalText.value = 'TOTAL GASTOS GASOLINA';
    cellTotalText.font = boldWhiteFont;
    cellTotalText.fill = blueStrongFill;
    cellTotalText.alignment = alignCenter;
    cellTotalText.border = border;

    const cellTotalValor = worksheet.getCell(`H${rowFinalComb}`);
    cellTotalValor.value = 0;
    cellTotalValor.alignment = alignCenter;
    cellTotalValor.border = border;

    // === Actualizar fila actual ===
    currentRow = rowFinalComb + 1;

    // === BLOQUE FINAL: TOTAL GASTOS, OBSERVACIONES Y FIRMAS ===
    const rowTotalGastos = currentRow;

    // === TÍTULO TOTAL GASTOS (col A) ===
    worksheet.mergeCells(`A${rowTotalGastos}:B${rowTotalGastos + 3}`);
    const cellTotalGastos = worksheet.getCell(`A${rowTotalGastos}`);
    cellTotalGastos.value = 'TOTAL GASTOS';
    cellTotalGastos.font = boldWhiteFont;
    cellTotalGastos.fill = blueStrongFill;
    cellTotalGastos.alignment = alignCenter;
    cellTotalGastos.border = border;

    // === SUBTABLA CRÉDITO (C to F) ===
    worksheet.getCell(`C${rowTotalGastos}`).value = 'CRÉDITO';
    worksheet.getCell(`D${rowTotalGastos}`).value = 'TOTAL EUROS';
    worksheet.getCell(`E${rowTotalGastos}`).value = 'TOTAL DÓLARES';
    worksheet.getCell(`F${rowTotalGastos}`).value = 'TOTAL PESOS';

    ['C', 'D', 'E', 'F'].forEach(col => {
        const cell = worksheet.getCell(`${col}${rowTotalGastos}`);
        cell.font = boldWhiteFont;
        cell.fill = blueStrongFill;
        cell.alignment = alignCenter;
        cell.border = border;
    });

    const creditos = [
        { credito: '13301510', euros: '', dolares: '', pesos: '-' },
        { credito: '13301515', euros: '', dolares: 'USD 0.00', pesos: '-' },
        { credito: '13301520', euros: '€', dolares: '-', pesos: '-' },
        { credito: '23356005', euros: '', dolares: '', pesos: '-' }
    ];

    creditos.forEach((cred, i) => {
        const row = rowTotalGastos + 1 + i;
        worksheet.getCell(`C${row}`).value = cred.credito;
        worksheet.getCell(`D${row}`).value = cred.euros;
        worksheet.getCell(`E${row}`).value = cred.dolares;
        worksheet.getCell(`F${row}`).value = cred.pesos;

        ['C', 'D', 'E', 'F'].forEach(col => {
            const cell = worksheet.getCell(`${col}${row}`);
            cell.alignment = alignCenter;
            cell.border = border;
        });
    });

    // === OBSERVACIONES ===
    const rowObservacionesTitle = rowTotalGastos + 5;
    const rowObservacionesEnd = rowObservacionesTitle + 2;
    worksheet.mergeCells(`A${rowObservacionesTitle}:H${rowObservacionesEnd}`);

    const obsCell = worksheet.getCell(`A${rowObservacionesTitle}`);
    obsCell.value = 'OBSERVACIONES';
    obsCell.font = boldWhiteFont;
    obsCell.alignment = alignLeft;
    obsCell.border = border;

    // === FIRMAS ===
    const rowFirmas = rowObservacionesEnd + 1;
    const firmas = [
        { colStart: 'A', colEnd: 'B', label: 'N° RECIBO DE CAJA Y VALOR' },
        { colStart: 'C', colEnd: 'D', label: 'Firma EMPLEADO' },
        { colStart: 'E', colEnd: 'F', label: 'Firma JEFE INMEDIATO' },
        { colStart: 'G', colEnd: 'H', label: 'Firma AUDITORIA' },
        { colStart: 'I', colEnd: 'J', label: 'Firma VICEPRESIDENCIA' }
    ];

    firmas.forEach(f => {
        worksheet.mergeCells(`${f.colStart}${rowFirmas}:${f.colEnd}${rowFirmas}`);
        const cell = worksheet.getCell(`${f.colStart}${rowFirmas}`);
        cell.value = f.label;
        cell.font = boldWhiteFont;
        cell.fill = blueStrongFill;
        cell.alignment = alignCenter;
        cell.border = border;

        // Segunda fila vacía para firma
        const rowFirmaLine = rowFirmas + 1;
        worksheet.mergeCells(`${f.colStart}${rowFirmaLine}:${f.colEnd}${rowFirmaLine}`);
        worksheet.getCell(`${f.colStart}${rowFirmaLine}`).border = border;
    });

    currentRow = rowFirmas + 2;

    // Ensure folder exists
    const fullFolderPath = path.resolve(__dirname, folderPath);
    fs.mkdirSync(fullFolderPath, { recursive: true });

    // Save Excel file
    const excelPath = path.join(fullFolderPath, fileName);
    await workbook.xlsx.writeFile(excelPath);

    return excelPath;
}