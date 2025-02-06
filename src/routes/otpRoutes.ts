import { Router } from "express";
import twilio from 'twilio';
import { prisma } from "../config/database";

const router = Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

if (!accountSid || !authToken || !serviceSid) {
    throw new Error("Twilio credentials or service SID are missing.");
  }

const client = twilio(accountSid, authToken);


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

router.post('/generate', async (req, res) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
        res.status(400).json({error: 'Mobile number is required'});
        return;
    }

    try {
        const verification = await client.verify.v2.services(serviceSid)
        .verifications
        .create({ to: mobileNumber, channel: 'sms'});
        res.status(200).json({ message: 'OTP sent successfully'});
    } catch (err) {
        console.log('Error sending OTP: ',err);
        res.status(500).json({ error: 'Failed to send OTP'});
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
})

export default router;