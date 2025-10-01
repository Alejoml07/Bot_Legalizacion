import admin from 'firebase-admin';
import { db } from './firebase.service';

export type HistoryRecord = {
  ref?: string;
  keyword?: string;
  answer?: any; // can be string or object
  refSerialize?: string;
  phone?: string;
  options?: any;
  provider?: string;
  raw?: any;
  createdAt?: FirebaseFirestore.Timestamp | Date;
};

export const saveHistory = async (record: HistoryRecord) => {
  try {
    const docRef = await db.collection('history').add({
      ...record,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('[history.service] saved history id=', docRef.id);

    return { ok: true, id: docRef.id };
  } catch (error) {
    console.error('[history.service] saveHistory error:', error);
    return { ok: false, error };
  }
};

export const batchSaveHistory = async (records: HistoryRecord[]) => {
  try {
    const batch = db.batch();
    const col = db.collection('history');

    records.forEach((rec) => {
      const docRef = col.doc();
      batch.set(docRef, {
        ...rec,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    console.log('[history.service] batch saved', records.length, 'records');

    return { ok: true };
  } catch (error) {
    console.error('[history.service] batchSaveHistory error:', error);
    return { ok: false, error };
  }
};
