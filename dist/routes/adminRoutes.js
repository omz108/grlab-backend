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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
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
        res.json(admin);
    }
    catch (error) {
    }
}));
router.post('/addRecord', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reportData = req.body;
    try {
        const newReport = yield database_1.prisma.report.create({
            data: reportData
        });
        res.status(201).json(newReport);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to save the report.' });
    }
}));
exports.default = router;
