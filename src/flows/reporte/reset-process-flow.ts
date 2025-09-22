import { addKeyword, EVENTS } from "@builderbot/bot";
import { RESET_REPORT_MESSAGE } from "~/constants/travels/report.constant";

import * as fs from 'fs';

export const resetProcessFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(RESET_REPORT_MESSAGE,
        null,
        async (context, { state }) => {

            const paths = [

                state.get("folderImagePath"),

                state.get("folderAudioPath"),

                state.get("folderExcelLegalizationPath"),

                state.get("folderExcelTransportPath"),

                state.get("folderPdfImagesFeedingPath"),

                state.get("folderJsonDataPath")
            ]

            paths.forEach(path => fs.rmSync(path, { recursive: true, force: true }));

        }
    )