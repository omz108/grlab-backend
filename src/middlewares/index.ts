import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authenticateAdmin = (req:Request , res:Response, next:NextFunction) => {
    try {
        const token = req.cookies.adminToken;

        if (!token) {
            res.status(401).json({error: 'Authentication token not found, please log in'});
            return;
        }

        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            throw new Error('JWT_SECRET_KEY is not set in environment variables');
            return;
        }

        const decoded = jwt.verify(token, secretKey);
        (req as any).admin = decoded;

        next();
    } catch(err) {
        // console.log(err);
        res.status(403).json({error: "Invalid or expired token, Please login again"});
        return;
    }
}