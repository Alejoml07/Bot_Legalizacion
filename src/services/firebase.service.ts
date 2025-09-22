import admin from 'firebase-admin';
import serviceAccount from '../constants/firebase/serviceAccountKey.json'; // Import your service account key

import { getFirestore } from 'firebase-admin/firestore';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),  
  databaseURL: "https://apileonisa-rfid-default-rtdb.firebaseio.com",
  storageBucket: "gs://apileonisa-rfid.appspot.com"
});


const db = getFirestore('legalizacion');

const bucket = admin.storage().bucket();

export { db, bucket };