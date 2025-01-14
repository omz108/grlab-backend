import { Router } from "express";
import { prisma } from "../config/database";
import bcrypt from 'bcrypt';

const router = Router();

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
        res.json(admin);
    } catch(error) {

    }

})

router.post('/addRecord', async (req, res) => {
    const reportData = req.body;
    try {
        const newReport = await prisma.report.create({
            data: reportData
        })
        res.status(201).json(newReport);
    } catch(err) {
        res.status(500).json({error: 'Failed to save the report.'})
    }
})

export default router;