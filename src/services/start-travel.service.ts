import { PayloadDataTravelLegalization } from "~/interfaces/data-firebase.interface";

export const StartObjectTravel: PayloadDataTravelLegalization = {
    feedingRecord: [],
    personalData: {
        company: "",
        costCenter: "",
        dependency: "",
        document: "",
        name: "",
        originDate: "",
        returnDate: "",
        totalAdvance: 0,
        travelCity: "",
        travelJustification: "",
    },
    tipsRecord: [],
    transportRecord: [],
    processStatus: {
        state: 0
    }
}