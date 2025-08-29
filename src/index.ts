import express, { json } from 'express';
import { prisma } from './config/database';
import adminRoutes from './routes/adminRoutes';
// import otpRoutes from './routes/otpRoutes';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
// import twilio from 'twilio';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
dotenv.config();

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const serviceSid = process.env.TWILIO_SERVICE_SID;

// if (!accountSid || !authToken || !serviceSid) {
//     throw new Error("Twilio credentials or service SID are missing.");
//   }

// const client = twilio(accountSid, authToken);
// testing

app.use(
    cors({
    //   origin: 'http://localhost:5173', 
    origin: ['https://grlab.in', 'https://www.grlab.in'],
    credentials: true, // Allow cookies to be sent
    })
  );


// app.get('/', (req, res) => {
//     res.json({message: "Hello World!"})
// })

app.get('/reportDetails/:reportNumber', async (req, res) => {
    const { reportNumber } = req.params;

    if (!reportNumber ) {
        res.status(400).json({ error: "Report number is required!"});
        return;
    }

    try {
        let report;

        if(reportNumber.startsWith('G')) {
            report = await prisma.gemReport.findUnique({
                where: {
                    reportNumber
                }
            })
        } else if (reportNumber.startsWith('R')) {
            report = await prisma.rudrakshaReport.findUnique({
                where: {
                    reportNumber
                }
            })
        }

        if (!report) {
            // console.log("Report not found, Please enter valid Report Number");
            res.status(404).json({ error: "Report not found, Please enter valid Report Number"});
            return;
        }
    
        res.status(200).json(report);
        return;

    } catch (error) {
        console.log("errrror ho gya re baba");
        console.log(error);
        res.status(500).json({ error: "An error occured" });
        return;
    }
    
})


// Admin routes
app.use('/admin', adminRoutes);
// app.use('/otp', otpRoutes);



app.listen(3000, () => {
    console.log("App is  listening at port 3000")
})
