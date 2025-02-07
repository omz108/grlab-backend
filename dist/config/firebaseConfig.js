"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const serviceAccount = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, "../config/uparkom-grlab-firebase-adminsdk-fbsvc-d637029fb3.json"), "utf-8"));
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    storageBucket: "gs://uparkom-grlab.firebasestorage.app",
});
const bucket = firebase_admin_1.default.storage().bucket();
exports.bucket = bucket;
