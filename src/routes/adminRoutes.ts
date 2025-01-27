import { Router } from "express";
import { prisma } from "../config/database";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateAdmin } from "../middlewares";
import multer from "multer";

const router = Router();

// middleware multer

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});


const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
    }
})




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
    const reportNumber = reportData.reportNumber;

    try {
        const existingReport = await prisma.report.findUnique({
            where: {reportNumber}
        })

        if (existingReport) {
            res.status(409).json({error: `Report with Report ID: ${reportNumber} already exists`});
            return;
        }

        const newReport = await prisma.report.create({
            data: {
                ...reportData,
                imageUrl: `/uploads/${req.file?.filename}`,
            }
        })
        res.status(201).json(newReport);
        // console.log(newReport);
    } catch (err){
        console.error(err);
        res.status(500).json({ error: 'Failed to save the report.'});
    }
})


router.post('/addRecord', async (req, res) => {
    const reportData = req.body;
    const reportNumber = reportData.reportNumber;
    try {
        const existingReport = await prisma.report.findUnique({where: { reportNumber }});
        if (existingReport) {
            res.status(409).json({error: `Report with Report ID: ${ reportNumber } already exists`});
            return;
        }
        const newReport = await prisma.report.create({
            data: reportData
        })
        res.status(201).json(newReport);
        return;
    } catch(err) {
        console.log(err);
        res.status(500).json({error: 'Failed to save the report.'});
        return;
    }
})

router.get('/fetchAllReports', async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
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

router.put('/report/:reportNumber', async (req, res) => {
    const { reportNumber } = req.params;
    const updatedData = req.body;
    try {
        const updatedReport = await prisma.report.update({
            where: { reportNumber },
            data: updatedData
        });
        res.status(200).json({ message: 'Report updated successfully', updatedReport });
        return;
    } catch(err: any) {
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
        await prisma.report.delete({
            where: { reportNumber }
        });
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
        const reportDetail = await prisma.report.findUnique({
            where: { reportNumber }
        })
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