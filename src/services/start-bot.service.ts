import { BotContext, BotStateStandAlone } from "@builderbot/bot/dist/types";
import { createJsonDataFile, folderPath } from "./data-json.service";

const setBotDataInit = async (context: BotContext, state: BotStateStandAlone) => {

    const phoneNumberUser = context.from;

    await state.update({ phoneNumber: phoneNumberUser });

    const paths: any = {
        folderImagePath: `downloads/images/${phoneNumberUser}`,
        folderAudioPath: `downloads/audios/${phoneNumberUser}`,
        folderExcelLegalizationPath: `downloads/excels/legalizations/${phoneNumberUser}`,
        folderExcelTransportPath: `downloads/excels/transports/${phoneNumberUser}`,
        folderPdfImagesFeedingPath: `downloads/pdfs/${phoneNumberUser}`,
        folderJsonDataPath: `downloads/datas/${phoneNumberUser}`
    };

    const folderImagePath = folderPath(paths.folderImagePath);

    const folderAudioPath = folderPath(paths.folderAudioPath);

    const folderExcelLegalizationPath = folderPath(paths.folderExcelLegalizationPath);

    const folderExcelTransportPath = folderPath(paths.folderExcelTransportPath);

    const folderPdfImagesFeedingPath = folderPath(paths.folderPdfImagesFeedingPath);

    const folderJsonDataPath = folderPath(paths.folderJsonDataPath);

    await createJsonDataFile(folderJsonDataPath);


    await state.update({ folderImagePath });

    await state.update({ folderAudioPath });

    await state.update({ folderExcelLegalizationPath });

    await state.update({ folderExcelTransportPath });

    await state.update({ folderPdfImagesFeedingPath });

    await state.update({ folderJsonDataPath });

}

export {
    setBotDataInit
}