import type { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";

interface DecodedToken {    //Added these to remove typescript error
    userId: string; 
}

interface AuthenticatedRequest extends Request {  //Added these to remove typescript error
    userId?: string;
}

export function middleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers["authorization"] || "";

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
        req.userId = decoded.userId; // No TypeScript error now
        next();
    } catch (error) {
        res.status(403).json({
            message: "Unauthorized",
        });
    }
}
