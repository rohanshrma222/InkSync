
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./ui/iconButton";
import { Game } from "@/components/draw/Game";
import { Topbar } from "./Topbar";

export type Tool = "circle" | "rect" | "pencil" |"eraser"| "hand";

export function Canvas({ roomId,socket}: { roomId: string;socket: WebSocket;}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle")

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);
            return () => {
                g.destroy();
            }
        }
    }, [canvasRef]);

    return <div className="h-screen overflow-hidden flex items-center justify-center">
         <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}>    
        </canvas>
       
    </div>
}

