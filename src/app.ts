process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// ==== Diagnostic Handlers (temporales) ====
process.on('uncaughtException', (err) => {
    console.error('[Diag] uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('[Diag] unhandledRejection:', reason);
});
process.on('beforeExit', (code) => {
    console.log('[Diag] beforeExit code:', code);
});
process.on('exit', (code) => {
    console.log('[Diag] exit code:', code);
});

import { createBot, createProvider, createFlow } from '@builderbot/bot';
import { MysqlAdapter as Database } from '@builderbot/database-mysql'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';

import { idleFlow } from './services/idle-custom.service'
import { authFlow, startFlow, tripSelectFlow, tripSelectWaitFlow } from './flows/start';

import dotenv from 'dotenv';

import { imageFlow } from './flows/alimentacion/image-flow';
import { imageFlowValidation } from './flows/alimentacion/image-flow-validation';
import { editImageDataFlow } from './flows/alimentacion/edit-image-data-flow';
import { imageDataExtraFlow } from './flows/alimentacion/image-data-extra-flow';
import { processEditedImageFlow } from './flows/alimentacion/process-edited-image-flow';
import { oneOptionTravelFlow } from './flows/alimentacion/one-option-travel-flow';

import { threeOptionTipFlow } from './flows/propinas/three-option-tip-flow';
import { tipFlowValidation } from './flows/propinas/tip-validation-flow';
import { responseTipFlow } from './flows/propinas/response-tip-flow';
import { processEditedPropinaFlow } from './flows/propinas/process-edited-propina-flow';

import { twoOptionTransportFlow } from './flows/transporte/two-option-transport-flow';
import { audioFlow } from './flows/transporte/audio-flow';
import { audioFlowValidation } from './flows/transporte/audio-validation-flow';
import { alternativeAudioValidationFlow } from './flows/transporte/alternative-audio-validation-flow';
import { manualAudioValidationFlow } from './flows/transporte/manual-audio-validation-flow';

import { generateReportFlow } from './flows/reporte/generate-report-flow';
import { reportFlow } from './flows/reporte/report-flow';
import { editReportDataFlow } from './flows/reporte/edit-report-data-flow';
import { createReportDataFlow } from './flows/reporte/create-report-data-flow';
import { resetProcessFlow } from './flows/reporte/reset-process-flow';
import { reportPreviousDataFlow } from './flows/reporte/report-previous-data-flow';
import { validatePreviousDataFlow } from './flows/reporte/validate-previous-data-flow';

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { onSendImageAudioDataCloud } from './services/firebase-generals.service';
import { generateRandomCode } from './services/general.service';


dotenv.config();


const PORT = process.env.PORT ?? 3008;

const CHECK_INTERVAL_MS = 50_000;

const FILE_NAME = 'bot.qr.png';

const FILE_PATH = path.resolve(process.cwd(), FILE_NAME);

const WEB_SERVICE_URL = 'https://your-api.com/upload';



const watchDir = process.cwd();



// fs.watch(watchDir, async (eventType, filename) => {

//     if (filename === FILE_NAME && eventType === 'rename') {

//         if (fs.existsSync(FILE_PATH)) {

//             const publicUrl = await onSendImageAudioDataCloud(FILE_PATH, `legalizaciones/qr/init-qr.png`, 'image/png');

//             console.log("Public url", publicUrl)

//             console.log(`[✔] Sent ${FILE_NAME} successfully.`);

//             fs.unlinkSync(FILE_PATH);

//             console.log(`[🗑] Removed ${FILE_NAME}.`);

//         }else {

//             console.log(`[⏳] File ${FILE_NAME} not found, nothing to do.`);

//         }

//     }

// });


// const validateQrImage = async() => {

//     try {

//     await fs.access(FILE_PATH);


//     const fileBuffer = await fs.readFile(FILE_PATH);

//     const randomName = generateRandomCode();

//     const publicUrl = await onSendImageAudioDataCloud(FILE_PATH, `legalizaciones/qr/${randomName}.png`, 'image/png');

//     console.log("Public url", publicUrl)

//     console.log(`[✔] Sent ${FILE_NAME} successfully.`);


//     await fs.unlink(FILE_PATH);

//     console.log(`[🗑] Removed ${FILE_NAME}.`);

//   } catch (err: any) {

//     if (err.code === 'ENOENT') {


//       console.log(`[⏳] File ${FILE_NAME} not found, nothing to do.`);

//     } else {

//       console.error('[❌] Error during file check/send:', err.message);

//     }

//   }


// }

const main = async () => {
    const adapterFlow = createFlow([

        idleFlow,

        authFlow,

        tripSelectFlow,
        tripSelectWaitFlow,

        startFlow,

        imageFlow,
        imageFlowValidation,
        editImageDataFlow,
        imageDataExtraFlow,
        processEditedImageFlow,
        oneOptionTravelFlow,

        threeOptionTipFlow,
        tipFlowValidation,
        responseTipFlow,
        processEditedPropinaFlow,

        twoOptionTransportFlow,
        audioFlow,
        audioFlowValidation,
        alternativeAudioValidationFlow,
        manualAudioValidationFlow,

        generateReportFlow,
        reportFlow,
        editReportDataFlow,
        createReportDataFlow,
        resetProcessFlow,
        reportPreviousDataFlow,
        validatePreviousDataFlow


    ])

    const adapterProvider = createProvider(Provider, {
        headless: true,
        browserArgs: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
        logQR: true
    })

    //const adapterDB = new Database()

    const adapterDB = new Database({
        host: process.env.MYSQL_DB_HOST,
        user: process.env.MYSQL_DB_USER,
        database: process.env.MYSQL_DB_NAME,
        password: process.env.MYSQL_DB_PASSWORD,
        port: parseInt(process.env.MYSQL_DB_PORT)
    })

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)

    //setInterval(validateQrImage, CHECK_INTERVAL_MS);

}

main().catch(err => {
    console.error('[Diag] main() rejected:', err);
});
