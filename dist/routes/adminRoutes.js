"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middlewares_1 = require("../middlewares");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// middleware multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
    }
});
// admin-login route
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'All fields are required!' });
        return;
    }
    try {
        const admin = yield database_1.prisma.admin.findUnique({
            where: {
                username
            }
        });
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, admin.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid password' });
            return;
        }
        const adminPayload = { id: admin.id };
        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            throw new Error('JWT_SECRET_KEY is not set in environment variables');
        }
        const token = jsonwebtoken_1.default.sign(adminPayload, secretKey, { expiresIn: '24h' });
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });
        res.json({ message: 'Login successful',
            admin: { id: admin.id, username: admin.username }
        });
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'An error occured' });
        return;
    }
}));
// apply authentication to subsequent routes
router.use(middlewares_1.authenticateAdmin);
// protected admin routes
router.get('/checkLogin', (req, res) => {
    res.status(200).json({ message: 'You are already logged in' });
    return;
});
router.post('/addGemRecord', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const reportData = req.body;
    try {
        const latestGemReport = yield database_1.prisma.gemReport.findFirst({
            select: {
                reportNumber: true
            },
            orderBy: {
                id: 'desc'
            }
        });
        const lastNumber = latestGemReport
            ? parseInt(latestGemReport.reportNumber.slice(1), 10)
            : 10000;
        const newReportNumber = `G${lastNumber + 1}`;
        const newReport = yield database_1.prisma.gemReport.create({
            data: Object.assign(Object.assign({}, reportData), { reportNumber: newReportNumber, imageUrl: `/uploads/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}` })
        });
        res.status(201).json(newReport);
        return;
        // console.log(newReport);
    }
    catch (err) {
        console.log(err);
        console.error(err);
        res.status(500).json({ error: 'Failed to save the report.' });
        return;
    }
}));
router.post('/addRudraksha', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const reportData = req.body;
    try {
        const latestRudrakshaReport = yield database_1.prisma.rudrakshaReport.findFirst({
            select: { reportNumber: true },
            orderBy: { id: 'desc' }
        });
        const lastNumber = latestRudrakshaReport
            ? parseInt(latestRudrakshaReport.reportNumber.slice(1), 10)
            : 10000;
        const newReportNumber = `R${lastNumber + 1}`;
        const newReport = yield database_1.prisma.rudrakshaReport.create({
            data: Object.assign(Object.assign({}, reportData), { reportNumber: newReportNumber, imageUrl: `/uploads/${(_b = req.file) === null || _b === void 0 ? void 0 : _b.filename}` })
        });
        res.status(201).json(newReport);
        return;
        // console.log(newReport);
    }
    catch (err) {
        console.log(err);
        console.error(err);
        res.status(500).json({ error: 'Failed to save the report.' });
        return;
    }
}));
// router.post('/addRecord', async (req, res) => {
//     const reportData = req.body;
//     const reportNumber = reportData.reportNumber;
//     try {
//         const existingReport = await prisma.gemReport.findUnique({where: { reportNumber }});
//         if (existingReport) {
//             res.status(409).json({error: `Report with Report ID: ${ reportNumber } already exists`});
//             return;
//         }
//         const newReport = await prisma.gemReport.create({
//             data: reportData
//         })
//         res.status(201).json(newReport);
//         return;
//     } catch(err) {
//         console.log(err);
//         res.status(500).json({error: 'Failed to save the report.'});
//         return;
//     }
// })
router.get('/fetchAllGems', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reports = yield database_1.prisma.gemReport.findMany({
            select: {
                reportNumber: true
            }, orderBy: {
                id: 'desc'
            }
        });
        res.status(200).json(reports);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch reports' });
        return;
    }
}));
router.get('/fetchAllRudraksha', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reports = yield database_1.prisma.rudrakshaReport.findMany({
            select: {
                reportNumber: true
            }, orderBy: {
                id: 'desc'
            }
        });
        res.status(200).json(reports);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch reports' });
        return;
    }
}));
router.put('/report/:reportNumber', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportNumber } = req.params;
    const updatedData = req.body;
    try {
        let updatedReport;
        if (reportNumber.startsWith('G')) {
            updatedReport = yield database_1.prisma.gemReport.update({
                where: { reportNumber },
                data: updatedData
            });
        }
        else if (reportNumber.startsWith('R')) {
            updatedReport = yield database_1.prisma.rudrakshaReport.update({
                where: { reportNumber },
                data: updatedData
            });
        }
        res.status(200).json({ message: 'Report updated successfully', updatedReport });
        return;
    }
    catch (err) {
        if (err.code === 'P2025') {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        res.status(500).json({ error: 'Failed to update report' });
        return;
    }
}));
router.delete('/report/:reportNumber', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportNumber } = req.params;
    try {
        if (reportNumber.startsWith('G')) {
            yield database_1.prisma.gemReport.delete({
                where: { reportNumber }
            });
        }
        else if (reportNumber.startsWith('R')) {
            yield database_1.prisma.rudrakshaReport.delete({
                where: { reportNumber }
            });
        }
        res.status(200).json({ message: 'Report deleted successfully' });
        return;
    }
    catch (err) {
        if (err.code === 'P2025') {
            res.status(404).json({ error: "Report not found" });
            return;
        }
        res.status(500).json({ error: 'Failed to delete report' });
        return;
    }
}));
router.get('/reportDetail/:reportNumber', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportNumber } = req.params;
    try {
        let reportDetail;
        if (reportNumber.startsWith('G')) {
            reportDetail = yield database_1.prisma.gemReport.findUnique({
                where: { reportNumber }
            });
        }
        else if (reportNumber.startsWith('R')) {
            reportDetail = yield database_1.prisma.rudrakshaReport.findUnique({
                where: { reportNumber }
            });
        }
        if (!reportDetail) {
            res.status(404).json({ error: 'Report not found, Please enter a valid report number' });
            return;
        }
        res.status(200).json(reportDetail);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch details' });
        return;
    }
}));
router.post('/logout', (req, res) => {
    try {
        res.clearCookie('adminToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });
        res.status(200).json({ message: 'Admin logged out successfully' });
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to logout' });
        return;
    }
});
exports.default = router;
