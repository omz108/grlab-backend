import { Router } from "express";
import { prisma } from "../config/database";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateAdmin } from "../middlewares";

const router = Router();

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
            sameSite: 'strict'
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

export default router;