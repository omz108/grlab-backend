"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const XLSX = __importStar(require("xlsx"));
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
// middleware for excelfile
const excelStorage = multer_1.default.memoryStorage();
const uploadExcel = (0, multer_1.default)({ storage: excelStorage });
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
router.post('/uploadExcel', uploadExcel.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
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
            res.status(400).json({ error: "Empty or Invalid Excel file" });
        }
        const reportNumberPrefix = reportType === "gem" ? "G" : "R";
        const lastRecord = yield database_1.prisma[`${reportType}Report`].findFirst({
            select: { reportNumber: true },
            orderBy: { id: "desc" }
        });
        let lastNumber = lastRecord ? parseInt(lastRecord.reportNumber.slice(1), 10) : 10000;
        for (const row of data) {
            lastNumber++;
            const newReportNumber = `${reportNumberPrefix}${lastNumber}`;
            yield database_1.prisma[`${reportType}Report`].create({
                data: Object.assign({ reportNumber: newReportNumber }, row)
            });
        }
        res.json({ message: "Report added successfully" });
        return;
    }
    catch (err) {
        // console.log(err);
        res.status(500).json({ error: "Error processing file" });
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
// Put request route
router.put('/report/:reportNumber', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { reportNumber } = req.params;
    const updatedData = req.body;
    try {
        let updatedReport;
        if (reportNumber.startsWith('G')) {
            updatedReport = yield database_1.prisma.gemReport.update({
                where: { reportNumber },
                data: Object.assign(Object.assign({}, updatedData), { imageUrl: `/uploads/${(_c = req.file) === null || _c === void 0 ? void 0 : _c.filename}` })
            });
        }
        else if (reportNumber.startsWith('R')) {
            updatedReport = yield database_1.prisma.rudrakshaReport.update({
                where: { reportNumber },
                data: Object.assign(Object.assign({}, updatedData), { imageUrl: `/uploads/${(_d = req.file) === null || _d === void 0 ? void 0 : _d.filename}` })
            });
        }
        res.status(200).json({ message: 'Report updated successfully', updatedReport });
        return;
    }
    catch (err) {
        // console.log(err);
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
