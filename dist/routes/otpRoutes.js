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
//  function to generate otp
// function generateOTP(): string {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }
// function to send OTP
// async function sendOTP(mobileNumber:string, otp: string): Promise<void> {
//     await client.messages.create({
//         body: `Your verification code is ${otp}`,
//         from: twilioPhoneNumber,
//         to: mobileNumber
//     })
// }
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
    }
    catch (err) {
        console.log('Error sending OTP: ', err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
    // const otp = generateOTP();
    // const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    //     try {
    //         const existingRecord = await prisma.oTP.findUnique({
    //             where: { mobileNumber }
    //         })
    //         if ( existingRecord ) {
    //         await prisma.oTP.update({
    //             where: {
    //                 mobileNumber
    //             }, data: {
    //                 otp,
    //                 expiry
    //             }
    //         })
    //         } else {
    //             await prisma.oTP.create({
    //                 data: {
    //                     mobileNumber,
    //                     otp,
    //                     expiry
    //                 }
    //             })
    //         }
    //         // Send OTP via SMS
    //         await sendOTP(mobileNumber, otp);
    //         res.status(200).json({ message: 'OTP sent successfully' });
    //         return;
    //     } catch (error) {
    //         console.log('error while sending: ',error);
    //         res.json({error: 'Failed to send OTP'});
    //         return;
    //     }
}));
exports.default = router;
