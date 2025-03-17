"use client"
import { WS_URL } from "@/config";
import {useEffect, useRef, useState} from "react"
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId:string}){
    const [socket,setSocket] = useState<WebSocket | null>(null);

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
            eyJ1c2VySWQiOiJlZDk3ZmJlOC1mYWIzLTQ1NGYtODQ4MS01OTBhZjA3YjNmZmMiLCJpYXQiOjE3NDIyMTIwOTN9.
            ecPN6L1XL75IUrVCP8YH5uWgQDR22COnY67vlsv0B-s`)
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