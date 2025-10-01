import admin from 'firebase-admin';
import serviceAccount from '../constants/firebase/serviceAccountKey.json';
import { getFirestore } from 'firebase-admin/firestore';

const app = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: (serviceAccount as any).project_id,
      databaseURL: 'https://apileonisa-rfid-default-rtdb.firebaseio.com',
      storageBucket: 'apileonisa-rfid.appspot.com',
    });

const db = getFirestore(app);
const bucket = admin.storage().bucket();

export { db, bucket };