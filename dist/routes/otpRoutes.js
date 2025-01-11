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
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = (0, twilio_1.default)(accountSid, authToken);
//  function to generate otp
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// function to send OTP
function sendOTP(mobileNumber, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.messages.create({
            body: `Your verification code is ${otp}`,
            from: twilioPhoneNumber,
            to: mobileNumber
        });
    });
}
router.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
        res.status(400).json({ error: 'Mobile number is required' });
        return;
    }
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    try {
        const existingRecord = yield database_1.prisma.oTP.findUnique({
            where: { mobileNumber }
        });
        if (existingRecord) {
            yield database_1.prisma.oTP.update({
                where: {
                    mobileNumber
                }, data: {
                    otp,
                    expiry
                }
            });
        }
        else {
            yield database_1.prisma.oTP.create({
                data: {
                    mobileNumber,
                    otp,
                    expiry
                }
            });
        }
        // Send OTP via SMS
        yield sendOTP(mobileNumber, otp);
        res.status(200).json({ message: 'OTP sent successfully' });
        return;
    }
    catch (error) {
        console.log('error while sending: ', error);
        res.json({ error: 'Failed to send OTP' });
        return;
    }
}));
exports.default = router;
