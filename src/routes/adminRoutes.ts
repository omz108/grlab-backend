import { Router } from "express";
import { prisma } from "../config/database";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateAdmin } from "../middlewares";
import multer from "multer";
import * as XLSX from 'xlsx';
import { bucket } from "../config/firebaseConfig";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage })

// middleware for excelfile
const excelStorage = multer.memoryStorage();
const uploadExcel = multer({ storage: excelStorage })


// admin-login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({error: 'All fields are required!'});
        return;
    }

    try {
        const admin = await prisma.admin.findUnique({
            where: {
                username
            }
        })
        if (!admin) {
            res.status(404).json({error: 'Admin not found'});
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            res.status(401).json({error: 'Invalid password'});
            return;
        }

        const adminPayload = { id: admin.id };
        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            throw new Error('JWT_SECRET_KEY is not set in environment variables');
        }
        const token = jwt.sign(adminPayload, secretKey, { expiresIn: '24h' });
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === 'production'? 'strict' : 'lax'
        })
        res.json({ message: 'Login successful', 
            admin: { id: admin.id, username: admin.username }
        });
        return;
    } catch(error) {
        res.status(500).json({error: 'An error occured'});
        return;
    }

})

// apply authentication to subsequent routes
router.use(authenticateAdmin);


// protected admin routes

router.get('/checkLogin', (req, res) => {
    res.status(200).json({message: 'You are already logged in'});
    return;
})


router.post('/addGemRecord', upload.single('image'), async (req, res) => {
    const reportData = req.body;

    try {
        // generate unique filename
        let publicUrl;
        if (req.file) {
            const uniqueFileName = `gem/${Date.now()}-${req.file.originalname}`;
            const file = bucket.file(uniqueFileName);

            await file.save(req.file.buffer, {
                metadata: { contentType: req.file.mimetype },
            });

            await file.makePublic();

            publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
        }
        
        const latestGemReport = await prisma.gemReport.findFirst({
            select: {
                reportNumber: true
            }, 
            orderBy: {
                id: 'desc'
            }
        })
        
        const lastNumber = latestGemReport
        ? parseInt(latestGemReport.reportNumber.slice(1), 10)
        : 10000

        const newReportNumber = `G${lastNumber + 1}`;

        const newReport = await prisma.gemReport.create({
            data: {
                ...reportData,
                reportNumber: newReportNumber,
                imageUrl: publicUrl,
            }
        })
        res.status(201).json(newReport);
        return;
        // console.log(newReport);
    } catch (err){
        console.log(err);
        console.error(err);
        res.status(500).json({ error: 'Failed to save the report.'});
        return;
    }
})

router.post('/addRudraksha', upload.single('image'), async (req, res) => {
    const reportData = req.body;

    try {
        let publicUrl;
        if (req.file) {
            const uniqueFileName = `rudraksha/${Date.now()}-${req.file.originalname}`;
            const file = bucket.file(uniqueFileName);

            await file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
            });

            await file.makePublic();

            publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
        }
        const latestRudrakshaReport = await prisma.rudrakshaReport.findFirst({
            select: { reportNumber: true },
            orderBy: { id: 'desc' }
        })

        const lastNumber = latestRudrakshaReport
        ? parseInt(latestRudrakshaReport.reportNumber.slice(1), 10)
        : 10000

        const newReportNumber = `R${lastNumber + 1}`;

        const newReport = await prisma.rudrakshaReport.create({
            data: {
                ...reportData,
                reportNumber: newReportNumber,
                imageUrl: publicUrl,
            }
        })
        res.status(201).json(newReport);
        return;
        // console.log(newReport);
    } catch (err){
        console.log(err);
        console.error(err);
        res.status(500).json({ error: 'Failed to save the report.'});
        return;
    }
})

router.post('/uploadExcel', uploadExcel.single("file"), async (req, res) => {
    try {
        if(!req.file) {
            res.status(400).json({error: "No file uploaded"});
            return;
        }
        const { reportType } = req.body;
        if (!["gem", "rudraksha"].includes(reportType)) {
            res.status(400).json({ error: "Invalid report type" });
            return;
        }

        // read the excel file from buffer
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!Array.isArray(data) || data.length === 0) {
            res.status(400).json({error: "Empty or Invalid Excel file"});
            return;
        }

        const reportNumberPrefix = reportType === "gem"? "G":"R";
        const lastRecord = await (prisma as any)[`${reportType}Report`].findFirst({
            select: { reportNumber: true},
            orderBy: { id: "desc" }
        })
        let lastNumber = lastRecord ? parseInt(lastRecord.reportNumber.slice(1), 10): 10000;

        for( const row of data) {
            lastNumber++;
            const newReportNumber = `${reportNumberPrefix}${lastNumber}`;

            await (prisma as any)[`${reportType}Report`].create({
                data: {
                    reportNumber: newReportNumber,
                    ...(row as Record<string, any>),
                }
            })
        }
        res.json({message: "Report added successfully"});
        return;
    } catch(err) {
        // console.log(err);
        res.status(500).json({error: "Error processing file"});
        return;
    }
})

router.get('/fetchAllGems', async (req, res) => {
    try {
        const reports = await prisma.gemReport.findMany({
            select: {
                reportNumber: true
            }, orderBy: {
                id: 'desc'
            }
        })
        res.status(200).json(reports);
        return;
    } catch(err) {
        res.status(500).json({error: 'Failed to fetch reports'})
        return;
    } 
})

router.get('/fetchAllRudraksha', async (req, res) => {
    try {
        const reports = await prisma.rudrakshaReport.findMany({
            select: {
                reportNumber: true
            }, orderBy: {
                id: 'desc'
            }
        })
        res.status(200).json(reports);
        return;
    } catch(err) {
        res.status(500).json({error: 'Failed to fetch reports'})
        return;
    } 
})

// Put request route
router.put('/report/:reportNumber', upload.single('image'), async (req, res) => {
    const { reportNumber } = req.params;
    const updatedData = req.body;
    let publicUrl;
    try {
        if (req.file) {
            try {
                const uniqueFileName = `reports/${Date.now()}-${req.file.originalname}`;
                const file = bucket.file(uniqueFileName);

                await file.save(req.file.buffer, {
                    metadata: { contentType: req.file.mimetype },
                });

                await file.makePublic();
                publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
            } catch (uploadErr) {
                res.status(500).json({ error: "Failed to upload image" });
                return;
            }
        }

        let updatedReport;
        if (reportNumber.startsWith('G')) {
            updatedReport = await prisma.gemReport.update({
                where: { reportNumber },
                data: {
                    ...updatedData,
                    ...(publicUrl ? { imageUrl: publicUrl } : {})
                }
            });
        } else if (reportNumber.startsWith('R')) {
            updatedReport = await prisma.rudrakshaReport.update({
                where: { reportNumber },
                data: {
                    ...updatedData,
                    ...(publicUrl ? { imageUrl: publicUrl } : {})
                }
            });
        }
        
        res.status(200).json({ message: 'Report updated successfully', updatedReport });
        return;
    } catch(err: any) {
        // console.log(err);
        if (err.code === 'P2025') {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        res.status(500).json({error: 'Failed to update report'});
        return;
    }  
})

router.delete('/report/:reportNumber', async (req, res) => {
    const { reportNumber } = req.params;
    try {
        if (reportNumber.startsWith('G')) {
            await prisma.gemReport.delete({
                where: { reportNumber }
            });
        } else if (reportNumber.startsWith('R')) {
            await prisma.rudrakshaReport.delete({
                where: { reportNumber }
            });
        }
        
        res.status(200).json({ message: 'Report deleted successfully' });
        return;
    } catch(err:any) {
        if (err.code === 'P2025') {
            res.status(404).json({error: "Report not found"});
            return;
        }
        res.status(500).json({error: 'Failed to delete report'})
        return;
    }
})

router.get('/reportDetail/:reportNumber', async (req, res) => {
    const { reportNumber } = req.params;
    try {
        let reportDetail;
        if (reportNumber.startsWith('G')) {
            reportDetail = await prisma.gemReport.findUnique({
                where: { reportNumber }
            })
        } else if (reportNumber.startsWith('R')) {
            reportDetail = await prisma.rudrakshaReport.findUnique({
                where: { reportNumber }
            })
        }
        
        if (!reportDetail) {
            res.status(404).json({error: 'Report not found, Please enter a valid report number'});
            return;
        }
        res.status(200).json(reportDetail);
        return;
    } catch(err) {
        res.status(500).json({error: 'Failed to fetch details'});
        return;
    }
})

router.post('/logout', (req, res) => {
    try {
        res.clearCookie('adminToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'? 'strict' : 'lax'
        })
        res.status(200).json({ message: 'Admin logged out successfully'});
        return;
    } catch(err) {
        res.status(500).json({ error: 'Failed to logout'});
        return;
    }
})

export default router;