import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app= express();
app.use(express.json());
app.use(cors())

app.post('/signup',async(req,res)=>{
    console.log("Received Request Body:", req.body);

    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        console.log(JSON.stringify(parsedData.error, null, 2));
        res.json({
            message:"Incorrect Inputs"
        })
        return
    }
    try{
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
        const user = await prismaClient.user.create({
            data:{
                email:parsedData.data?.username,
                password:hashedPassword,
                name:parsedData.data.name
            }
        })
        console.log("User Successfully Stored in DB:", user);
        res.json({
            userId:user.id
        })
    } catch(e){
        console.error("Database Error:", e);
        res.status(403).json({
            message:"User already exists with this username"
        })
    }
})

app.post('/signin',async(req,res)=>{
    const parsedData = SigninSchema.safeParse(req.body);
    console.log("signin header",req.body)
    if(!parsedData.success){
        console.log(JSON.stringify(parsedData.error, null, 2));
        res.json({
            message:"Incorrect Inputs"
        })
        return
    }

    const user = await prismaClient.user.findFirst({
        where:{
            email:parsedData.data.username,
        }
    }) 

    if(!user  || !(await bcrypt.compare(parsedData.data.password, user.password))){
        res.status(403).json({
            message:"Not Authorized"
        })
        return;
    } 
            
    const token=jwt.sign({
        userId:user?.id
    },JWT_SECRET)

    res.json({
        token
    })
});

app.post('/room',middleware,async(req,res)=>{
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message:"Incorrect Inputs"
        })
        return
    }
    //@ts-ignore
    const userId = req.userId;
    try{
        const room= await prismaClient.room.create({
            data:{
                slug:parsedData.data.name,
                adminId:userId
            }
        })
        res.json({
            roomId:room.id
        })
    }
    catch(e){
        res.status(411).json({
            message:"Room already exists with this name"
        })
    }    
})

app.listen(3001, () => {
    console.log("🚀 Server running on http://localhost:3001");
});