import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

const serviceAccount = JSON.parse(
  readFileSync(path.join(__dirname, "firebaseServiceAccount.json"), "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://uparkom-grlab.firebasestorage.app",
});

const bucket = admin.storage().bucket();

export { bucket };
