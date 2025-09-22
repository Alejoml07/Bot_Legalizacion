import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generatePdfFromImages(imagePaths: string[], anotations: string[], outputPath: string): Promise<void> {

  const pdfDoc = await PDFDocument.create();

  imagePaths.forEach(async (imagePath: any, index: number) => {

    const imageBytes = fs.readFileSync(imagePath);

    const ext = path.extname(imagePath).toLowerCase();

    let image;

    if (ext === '.jpg' || ext === '.jpeg') {

      image = await pdfDoc.embedJpg(imageBytes);

    } else if (ext === '.png') {

      image = await pdfDoc.embedPng(imageBytes);

    } else {

      throw new Error(`Unsupported image format: ${ext}`);

    }

    const page = pdfDoc.addPage();

    const { width, height } = page.getSize();

    const imgWidth = 300;

    const imgHeight = (image.height / image.width) * imgWidth;

    const x = (width - imgWidth) / 2;
    const y = (height - imgHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: imgWidth,
      height: imgHeight,
    });

    const anotation = anotations[index];

    if (anotation !== undefined && anotation !== '') {

      const fontSize = 15;

      const text = `Nota: ${anotation}`;

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const textWidth = font.widthOfTextAtSize(text, fontSize);

      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: y - fontSize - 10, // 10px below image
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

    }

  });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync(outputPath, pdfBytes);

}
