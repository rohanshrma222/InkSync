"use client"
import { WS_URL } from "@/lib/config";
import {useEffect, useRef, useState} from "react"
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId:string}){
    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError("No authentication token found. Please log in again.");
            return;
        }
        
        console.log("Using token:", token);
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        ws.onopen = () =>{
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }    
    }, [])


    if(!socket){
        return <div>
            Connecting to server...
        </div>
    }
    return <div>
        <Canvas roomId={roomId} socket={socket}/> 
      
    </div>
}