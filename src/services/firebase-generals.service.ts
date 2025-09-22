import { BotStateStandAlone } from "@builderbot/bot/dist/types";

import { bucket, db } from './firebase.service';
import { StartObjectTravel } from "./start-travel.service";

const onValidateDataCollectionDocumentActive = async (state: BotStateStandAlone, userPhone: string): Promise<boolean> => {

    const activeDocument = await state.get("documentReference");

    console.log("[onValidateDataCollectionDocumentActive] documentReference:", activeDocument);
    
    return typeof activeDocument === 'string' && activeDocument.length > 0;

};

const onSetDataCollectionDocuments = async (userPhone: string, typeLegalizacion: string, state: BotStateStandAlone, data: any, docId: string) => {

    const documentReference = onGetDataBaseReference(userPhone, typeLegalizacion, docId);

    const docId2 = documentReference.id;

    console.log("[onSetDataCollectionDocuments] Guardando documentReference:", docId2);

    await state.update({ documentReference: docId2 });

    await documentReference.set(data);
    
    return docId2;
}

const onGetDataBaseReference = (userPhone: string, typeLegalizacion: string, docId: string) => {

    const reference = db
        .collection('legalizacion')
        .doc(userPhone)
        .collection(typeLegalizacion);

    if (docId !== "") {

        return reference.doc(docId);

    }

    return reference.doc();

}

const onSendImageAudioDataCloud = async (imagePath: string, destination: string, contentType: string): Promise<string> => {

    await bucket.upload(imagePath, {
        destination,
        metadata: {
            contentType
        }
    });

    const file = bucket.file(destination);

    await file.makePublic();

    console.log(`[onSendImageAudioDataCloud] File ${destination} is now public.`);
    console.log(`[onSendImageAudioDataCloud] Access it at: https://storage.googleapis.com/${bucket.name}/${destination}`);
    console.log(`[onSendImageAudioDataCloud] bucket.name: ${bucket}`);

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

    return publicUrl;


};


const onUpdateDataTravel = async (isList: number, userPhone: string, typeLegalizacion: string, docId: string, field: string, data: any, state: BotStateStandAlone) => {

    const documentReference = onGetDataBaseReference(userPhone, typeLegalizacion, docId);

    const docSnap = await documentReference.get();

    if (!docSnap.exists) {

        console.log('Document does not exist');

        return;
    }

    const fieldMap = {
        feedingRecord: 'feedingRecord',
        tipsRecord: 'tipsRecord',
        transportRecord: 'transportRecord',
        processStatus: 'processStatus'
    };

    const targetField = fieldMap[field] || 'personalData';

    const currentData = docSnap.data();

    currentData[targetField] = currentData[targetField] ?? StartObjectTravel;

    if (isList) {

        currentData[targetField].push(data);

    } else {

        currentData[targetField] = data;

    }



    await onSetDataCollectionDocuments(userPhone, typeLegalizacion, state, currentData, docId);

}

const onGetDataCollectionDocuments = async (userPhone: string) => {

    db.collection(`legalizacion/${userPhone}/01`)
        .onSnapshot(snapshot => {

            snapshot.docChanges().forEach(change => {

                const changeType = change.type; //added, removed, modified

                const data = change.doc.data();

                const id = change.doc.id;

            });


        });

}

export {
    onValidateDataCollectionDocumentActive,
    onSetDataCollectionDocuments,
    onGetDataBaseReference,
    onSendImageAudioDataCloud,
    onUpdateDataTravel,
    onGetDataCollectionDocuments
}