import express from "express"
import bcrypt from "bcryptjs"
import { z } from "zod";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken"
import { middleware } from "./middleware";
import {CreateUserSchema,SigninSchema,CreateRoomSchema} from '@repo/common/types'


const app = express();

app.post('/signup',(req,res)=>{

    const data = CreateUserSchema.safeParse(req.body);
    if(!data.success){
            res.json({
            message:"Invalid Input"
        })
        return
    }

    //db call
    res.json({
        userId:"123"
    })
    
})

app.post('/signin',(req,res)=>{

    const data = SigninSchema.safeParse(req.body);
    if(!data.success){
            res.json({
            message:"Invalid Input"
        })
        return
    }

    const userId=1;
    const token = jwt.sign({
        userId
    },JWT_SECRET);

    res.json({
        token
    })
    
})

app.post('create-room',middleware,(req,res)=>{

    const data = CreateUserSchema.safeParse(req.body);
    if(!data.success){
            res.json({
            message:"Invalid Input"
        })
        return
    }

    res.json({
        roomId: 123
    })
    
})

app.listen(3001)