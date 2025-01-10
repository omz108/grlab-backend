import express, { json } from 'express';
import { prisma } from './config/database';
import adminRoutes from './routes/adminRoutes';
import dotenv from 'dotenv';

const app = express();

app.use(express.json());
dotenv.config();


// app.get('/', (req, res) => {
//     res.json({message: "Hello World!"})
// })

app.post('/getCertificate', async (req, res) => {
    const { reportNumber, mobileNumber, otp } = req.body;

    if (!reportNumber || !mobileNumber || !otp) {
        res.status(400).json({ error: "All fields are required!"});
        return;
    }

    try {
        const report = await prisma.report.findUnique({
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



app.listen(3000, () => {
    console.log("App is  listening at port 3000")
})