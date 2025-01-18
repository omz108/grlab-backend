"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateAdmin = (req, res, next) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            res.status(401).json({ error: 'Authentication token not found, please log in' });
            return;
        }
        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            throw new Error('JWT_SECRET_KEY is not set in environment variables');
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        req.admin = decoded;
        next();
    }
    catch (err) {
        // console.log(err);
        res.status(403).json({ error: "Invalid or expired token, Please login again" });
        return;
    }
};
exports.authenticateAdmin = authenticateAdmin;
