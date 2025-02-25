import admin from "firebase-admin";
// import { readFileSync } from "fs";
// import path from "path";

// const serviceAccount = JSON.parse(
//   readFileSync(path.join(__dirname, "../config/uparkom-grlab-firebase-adminsdk-fbsvc-d637029fb3.json"), "utf-8")
// );

const serviceAccountString = process.env.FIREBASE_CREDENTIALS;
if (!serviceAccountString) {
  throw new Error("Missing FIREBASE_CREDENTIALS env variable");
}

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountString, "base64").toString("utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "uparkom-grlab.firebasestorage.app",
});

const bucket = admin.storage().bucket();

export { bucket };
