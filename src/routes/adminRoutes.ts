import { Router } from "express";
import { prisma } from "../config/database";

const router = Router();

router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({error: 'All fields are required!'});
        return;
    }

    try {
        const admin = prisma.admin.findUnique({
            where: {
                username
            }
        })
    } catch(error) {

    }

})

export default router;