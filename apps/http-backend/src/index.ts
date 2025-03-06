import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

const app= express();
app.use(express.json())

app.post('/signup',async(req,res)=>{
    
    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message:"Incorrect Inputs"
        })
        return
    }
    try{
        const user = await prismaClient.user.create({
            //@ts-ignore
            data:{
                email:parsedData.data?.username,
                password:parsedData.data?.password,
                name:parsedData.data.name
            }
        })
        res.json({
            userId:user.id
        })
    } catch(e){
        res.status(403).json({
            message:"User already exists with this username"
        })
    }
})

app.post('/signin',(req,res)=>{
    const data = SigninSchema.safeParse(req.body);
    if(!data.success){
        res.json({
            message:"Incorrect Inputs"
        })
        return
    }

    const userId=1;
    const token=jwt.sign({
        userId
    },JWT_SECRET)
});

app.post('/create',middleware,(req,res)=>{
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
        res.json({
            message:"Incorrect Inputs"
        })
        return
    }
    
})

app.listen(3001, () => {
    console.log("🚀 Server running on http://localhost:3001");
});