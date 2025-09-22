import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DetailDataTransport, PayloadDataTransport } from '~/interfaces/transport.interface';

export async function createTransportExcel(transportData: PayloadDataTransport, folderPath: string, fileName: string): Promise<any> {

    const __filename = fileURLToPath(import.meta.url);

    const __dirname = path.dirname(__filename);

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Legalizacion transporte');

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
      fgColor: { argb: '002060' }
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
      { width: 4 },

      { width: 11 },
      { width: 20 },

      { width: 6 },
      { width: 6 },
      { width: 6 },
      { width: 6 },

      { width: 20 },

      { width: 30 },
      { width: 11 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 }


    ];

    worksheet.mergeCells(1, 1, 40, 1);

    worksheet.mergeCells(1, 15, 40, 15);



    // === TÍTULO PRINCIPAL ===
    worksheet.mergeCells('B1:N1');
    const titulo = worksheet.getCell('B1');
    titulo.value = 'RELACIÓN DE TRANSPORTE ANEXO A JUSTIFICACIÓN DE ANTICIPOS VARIOS';
    titulo.font = { ...boldWhiteFont, size: 12 };
    titulo.fill = blueFill;
    titulo.alignment = alignCenter;
    titulo.border = border;



    worksheet.mergeCells('B2:N2');
    worksheet.mergeCells('B3:N3');
    worksheet.getRow(2).height = 5;
    worksheet.getRow(3).height = 5;



    worksheet.mergeCells(4, 2, 5, 2);

    const cellB4 = worksheet.getCell('B4');

    cellB4.value = 'FECHA';
    cellB4.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cellB4.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };




    const cellC4 = worksheet.getCell('C4');

    cellC4.value = 'DIA SEMANA';
    cellC4.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cellC4.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };



    const cellC5 = worksheet.getCell('C5');

    cellC5.value = 'L-M-W-J-V-S-D';
    cellC5.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cellC5.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };





    worksheet.mergeCells('D4:G4');
    const cellD4 = worksheet.getCell('D4');

    cellD4.value = 'TIPO DE TRANSPORTE';
    cellD4.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cellD4.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };




    const transportCells: object[] = [
      {
        value: 'TAXI',
        cell: 'D5'
      },
      {
        value: 'BUS',
        cell: 'E5'
      },
      {
        value: 'METRO',
        cell: 'F5'
      },
      {
        value: 'OTRO',
        cell: 'G5'
      }
    ];

    transportCells.forEach((transportCell: any) => {

      const { value, cell } = transportCell;

      const item = worksheet.getCell(cell);

      item.value = value;
      item.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };

      item.font = {
        size: 8,
        name: 'Arial',
        bold: true
      };

    });



    worksheet.mergeCells(4, 8, 5, 8);

    const cellH4 = worksheet.getCell('H4');

    cellH4.value = 'CÉDULA DEL\nVIAJERO';
    cellH4.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };

    cellH4.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };




    worksheet.mergeCells(4, 9, 5, 9);

    const cellI4 = worksheet.getCell('I4');

    cellI4.value = 'NOMBRE VIAJERO';
    cellI4.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cellI4.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };



    worksheet.mergeCells(4, 10, 5, 10);

    const cellJ4 = worksheet.getCell('J4');

    cellJ4.value = 'CENTRO\nCOSTO';
    cellJ4.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };

    cellJ4.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };



    worksheet.mergeCells(4, 11, 5, 11);

    const cellK4 = worksheet.getCell('K4');

    cellK4.value = 'MOTIVO DEL TRASLADO';
    cellK4.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cellK4.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };





    worksheet.mergeCells('L4:M4');
    const cellL4 = worksheet.getCell('L4');

    cellL4.value = 'DETALLE POR TRAYECTO';
    cellL4.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cellL4.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };

    const originDestinyCells: object[] = [
      {
        value: 'ORIGEN',
        cell: 'L5'
      },
      {
        value: 'DESTINO',
        cell: 'M5'
      },
    ];

    originDestinyCells.forEach((originDestinyCell: any) => {

      const { value, cell } = originDestinyCell;

      const item = worksheet.getCell(cell);

      item.value = value;
      item.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };

      item.font = {
        size: 8,
        name: 'Arial',
        bold: true
      };

    });






    const cellN4 = worksheet.getCell('N4');

    cellN4.value = 'VALOR\nTRAYECTO';
    cellN4.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };

    cellN4.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };






    worksheet.mergeCells('B30:I30');
    const cellB30 = worksheet.getCell('B30');

    cellB30.value = 'TOTAL EN LETRAS';
    cellB30.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    };

    cellB30.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };


    worksheet.mergeCells('J30:L30');


    const cellM30 = worksheet.getCell('M30');

    cellM30.value = 'TOTAL';
    cellM30.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    };

    cellM30.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };






    worksheet.mergeCells(32, 2, 36, 9);




    worksheet.mergeCells('B31:I31');

    const cellB31 = worksheet.getCell('B31');

    cellB31.value = 'Observaciones:';
    cellB31.alignment = {
      horizontal: 'left',
      vertical: 'top'
    };

    cellB31.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };



    worksheet.mergeCells(32, 10, 36, 14);

    worksheet.mergeCells('J31:N31');
    const cellJ31 = worksheet.getCell('J31');

    cellJ31.value = 'FIRMA EMPLEADO';
    cellJ31.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cellJ31.font = {
      size: 8,
      name: 'Arial',
      bold: true
    };

    cellJ31.fill = blueFill;

    cellJ31.alignment = alignCenter;

    cellJ31.border = border;



    const colums: string[] = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

    for (let index = 1; index <= 36; index++) {


      colums.forEach(column => {

        const item = worksheet.getCell(`${column}${index}`);

        item.border = border;

      });

    }


    /*DATOS DE TRANSPORTE*/


    const cella = worksheet.getCell(`J30`);

    cella.value = transportData.totalLetters

    cella.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cella.font = {
      size: 8,
      name: 'Arial'
    };

    const cellb = worksheet.getCell(`N30`);

    cellb.value = transportData.total

    cellb.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cellb.font = {
      size: 8,
      name: 'Arial'
    };


    const cellc = worksheet.getCell(`B32`);

    cellc.value = `${transportData.observaciones}`

    cellc.alignment = {
      horizontal: 'left',
      vertical: 'middle'
    };

    cellc.font = {
      size: 8,
      name: 'Arial'
    };

    const celld = worksheet.getCell(`J32`);

    celld.value = transportData.firmaEmpleado

    celld.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    celld.font = {
      size: 8,
      name: 'Arial'
    };


    transportData.datos.forEach((data: DetailDataTransport, index: number) => {

      const rowIndex = index + 6;

      const fieldMap: { [key: string]: any } = {
        B: data.fecha,
        C: data.diaSemana,
        D: data.tipoTransporte.taxi,
        E: data.tipoTransporte.bus,
        F: data.tipoTransporte.metro,
        G: data.tipoTransporte.otro,
        H: data.cedula,
        I: data.nombre,
        J: data.centroCosto,
        K: data.motivo,
        L: data.detalle.origen,
        M: data.detalle.destino,
        N: data.valor,
      };

      for (const [column, value] of Object.entries(fieldMap)) {

        const cell = worksheet.getCell(`${column}${rowIndex}`);

        cell.value = value

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };

        cell.font = {
          size: 8,
          name: 'Arial'
        };


      }

    });  


    // Ensure folder exists
    const fullFolderPath = path.resolve(__dirname, folderPath);
    fs.mkdirSync(fullFolderPath, { recursive: true });

    // Save Excel file
    const excelPath = path.join(fullFolderPath, fileName);
    await workbook.xlsx.writeFile(excelPath);

    return excelPath;

}