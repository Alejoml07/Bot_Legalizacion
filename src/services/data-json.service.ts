import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const readDataJson = (folderPath: string): any => {

    const __filename = fileURLToPath(import.meta.url);

    const __dirname = path.dirname(__filename);

    const jsonFilePath = path.resolve(__dirname, folderPath, 'data.json');

    if (!fs.existsSync(jsonFilePath)) {

        return undefined;

    }

    const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');

    return JSON.parse(jsonData);

}

const createJsonDataFile = async (folderPath: string) => {

    const filePath = path.join(folderPath, 'data.json');

    if (!fs.existsSync(filePath)) {

        const payload = {
            alimentacion: [],
            transporte: [],
            propinas: []
        }

        fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    }


}

const upsertJsonDataFile = async (folderPath: string, newData: any, index: number) => {

    try {

        const filePath = path.join(folderPath, 'data.json');

        let currentData: any = {};

        let newDatas = [];

        if (fs.existsSync(filePath)) {

            currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        }

        switch (index) {

            case 1:

                newDatas = currentData.alimentacion;

                newDatas.push(newData)

                currentData.alimentacion = newDatas;

                break;

            case 2:

                newDatas = currentData.transporte;

                newDatas.push(newData);

                currentData.transporte = newDatas;

                break;

            case 3:

                newDatas = currentData.propinas;

                newDatas.push(newData);

                currentData.propinas = newDatas;

                break;

        }


        fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf-8');

    } catch (error) {
        console.error('upsertJsonDataFile error:', error);
    }

}

const folderPath = (path: string) => {

    const pathStructured = `./dist/${path}`;

    if (!fs.existsSync(pathStructured)) {

        fs.mkdirSync(pathStructured, { recursive: true });

    }

    return pathStructured;

};

export {
    readDataJson,
    createJsonDataFile,
    upsertJsonDataFile,
    folderPath
}