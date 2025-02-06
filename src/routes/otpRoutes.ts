import { Router } from "express";
import twilio from 'twilio';

const router = Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

if (!accountSid || !authToken || !serviceSid) {
    throw new Error("Twilio credentials or service SID are missing.");
  }

const client = twilio(accountSid, authToken);

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
        return;
    } catch (err) {
        console.log('Error sending OTP: ',err);
        res.status(500).json({ error: 'Failed to send OTP'});
        return;
    }

    
})

router.post('/verify', async (req, res) => {
    const { mobileNumber, otp} = req.body;

    if (!mobileNumber || !otp) {
        res.status(400).json({error: 'Mobile number and OTP are required'});
        return;
    }
    try {
        // verify otp
        const verificationCheck = await client.verify.v2.services(serviceSid)
        .verificationChecks
        .create({ to: mobileNumber, code: otp});
        if(!verificationCheck.valid) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }
        res.status(200).json({message: 'OTP verified'});
        return;
    } catch (err) {
        console.log('Error sending OTP: ',err);
        res.status(500).json({ error: 'Failed to verify OTP'});
        return;
    }
})

export default router;