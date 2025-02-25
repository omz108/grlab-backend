"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// import { readFileSync } from "fs";
// import path from "path";
// const serviceAccount = JSON.parse(
//   readFileSync(path.join(__dirname, "../config/uparkom-grlab-firebase-adminsdk-fbsvc-d637029fb3.json"), "utf-8")
// );
const serviceAccountString = process.env.FIREBASE_CREDENTIALS;
if (!serviceAccountString) {
    throw new Error("Missing FIREBASE_CREDENTIALS env variable");
}
const serviceAccount = JSON.parse(Buffer.from(serviceAccountString, "base64").toString("utf-8"));
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    storageBucket: "uparkom-grlab.firebasestorage.app",
});
const bucket = firebase_admin_1.default.storage().bucket();
exports.bucket = bucket;
