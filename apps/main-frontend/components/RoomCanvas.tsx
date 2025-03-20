"use client"
import { WS_URL } from "@/config";
import {useEffect, useRef, useState} from "react"
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId:string}){
    const [socket,setSocket] = useState<WebSocket | null>(null);

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZTBkY2ZkMC05YTExLTRjY2YtOGQ1MC02M2Y1ODU1MWFiMjUiLCJpYXQiOjE3NDIyODg5Njl9.BnhJ_-4shfClM0s6cWm8pJreYT1kd-hoW_J33Okk18k`)
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