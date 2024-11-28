import admin from "firebase-admin";
import { readFileSync } from "node:fs";

const serviceAccount = JSON.parse(readFileSync('./firestoreServiceAccount.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { auth, db, admin };