import express, { json } from 'express';
import { prisma } from './config/database';
import adminRoutes from './routes/adminRoutes';
import otpRoutes from './routes/otpRoutes';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
dotenv.config();

app.use(
    cors({
      origin: 'http://localhost:5173', // Frontend URL
      credentials: true, // Allow cookies to be sent
    })
  );


// app.get('/', (req, res) => {
//     res.json({message: "Hello World!"})
// })

app.post('/reportDetails', async (req, res) => {
    const { reportNumber, mobileNumber, otp } = req.body;

    if (!reportNumber || !mobileNumber || !otp) {
        res.status(400).json({ error: "All fields are required!"});
        return;
    }

    try {
        // verify otp
        const record = await prisma.oTP.findUnique({
            where: {
                mobileNumber
            }
        })
        
        
        if (!record || record.otp !== otp || new Date().toISOString() > record?.expiry) {
            res.status(400).json({error: 'Invalid or expired OTP'});
            return;
        }

        // find report in db
        const report = await prisma.gemReport.findUnique({
            where: {
                reportNumber
            }
        })

        if (!report) {
            // console.log("Report not found, Please enter valid Report Number");
            res.status(404).json({ error: "Report not found, Please enter valid Report Number"});
            return;
        }
    
        res.status(200).json(report);
        return;

    } catch (error) {
        // console.log("errrror ho gya re baba");
        res.status(500).json({ error: "An error occured" });
        return;
    }
    
})


// Admin routes
app.use('/admin', adminRoutes);
app.use('/otp', otpRoutes);



app.listen(3000, () => {
    console.log("App is  listening at port 3000")
})