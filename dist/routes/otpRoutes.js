"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const twilio_1 = __importDefault(require("twilio"));
const router = (0, express_1.Router)();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
if (!accountSid || !authToken || !serviceSid) {
    throw new Error("Twilio credentials or service SID are missing.");
}
const client = (0, twilio_1.default)(accountSid, authToken);
router.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
        res.status(400).json({ error: 'Mobile number is required' });
        return;
    }
    try {
        const verification = yield client.verify.v2.services(serviceSid)
            .verifications
            .create({ to: mobileNumber, channel: 'sms' });
        res.status(200).json({ message: 'OTP sent successfully' });
        return;
    }
    catch (err) {
        console.log('Error sending OTP: ', err);
        res.status(500).json({ error: 'Failed to send OTP' });
        return;
    }
}));
router.post('/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mobileNumber, otp } = req.body;
    if (!mobileNumber || !otp) {
        res.status(400).json({ error: 'Mobile number and OTP are required' });
        return;
    }
    try {
        // verify otp
        const verificationCheck = yield client.verify.v2.services(serviceSid)
            .verificationChecks
            .create({ to: mobileNumber, code: otp });
        if (!verificationCheck.valid) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }
        res.status(200).json({ message: 'OTP verified' });
        return;
    }
    catch (err) {
        console.log('Error sending OTP: ', err);
        res.status(500).json({ error: 'Failed to verify OTP' });
        return;
    }
}));
exports.default = router;
