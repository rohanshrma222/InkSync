import express, { Request, Response, RequestHandler } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";
import type { ParamsDictionary } from 'express-serve-static-core';

const app= express();
app.use(express.json());
app.use(cors())

app.post('/signup',async(req,res)=>{
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
        console.log("User Successfully Stored in DB:", user.id);
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
    if(!parsedData.success){
        console.log(JSON.stringify(parsedData.error, null, 2));
        res.json({
            message:"Incorrect Inputs"
        })
        return
    }

    const {username , password} =parsedData.data
    const user = await prismaClient.user.findFirst({
        where:{
            email:username,
        }
    }) 

    if(!user  || !(await bcrypt.compare(password, user.password))){
        res.status(401).json({
            success:false,
            message:"Invalid email or password"
        })
        return;
    } 
            
    const token=jwt.sign({
        userId:user.id
    },JWT_SECRET,{expiresIn: '24h'})
    console.log("User ID being stored in JWT:", user.id);
    console.log("Generated token:", token);
    res.status(200).json({
        success:true,
        message:"Signin Successful",
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
        console.log("room created by userId:",userId)
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

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });

        res.json({
            messages
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
    
})

const getRoomHandler: RequestHandler<{slug: string}> = async (req, res) => {
    const slug = req.params.slug;
    try {
        const room = await prismaClient.room.findFirst({
            where: { slug }
        });
        
        if (!room) {
            res.status(404).json({
                success: false,
                message: "Room not found"
            });
            return;
        }

        res.json({
            success: true,
            room
        });
    } catch (error) {
        console.error("Error finding room:", error);
        res.status(500).json({
            success: false,
            message: "Failed to find room"
        });
    }
};

app.get("/room/:slug", getRoomHandler);

app.listen(3001, () => {
    console.log("🚀 Server running on http://localhost:3001");
});