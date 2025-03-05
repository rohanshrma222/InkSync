import type { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken"

export function middleware(req:Request,res:Response,next:NextFunction){
    const header = req.headers["authorization"] ?? ""

   const decoded = jwt.verify(header,JWT_SECRET);

   if(decoded){
    //@ts-ignore
    req.userId = decoded.userId;
    next();
   } else{
    res.status(403).json({
        message:"Unauthorized"
    })
   }
}