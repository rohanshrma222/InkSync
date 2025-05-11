import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./ui/iconButton";
import { Game } from "@/components/draw/Game";
import { Topbar } from "./Topbar";
import { PropertiesPanel } from "./PropertiesPanel";

export type Tool = "circle" | "rect" | "pencil" |"eraser"| "hand";

// Helper function to determine if a tool is a drawing tool
const isDrawingTool = (tool: Tool): boolean => {
    return tool === "circle" || tool === "rect" || tool === "pencil";
};

export function Canvas({ roomId,socket}: { roomId: string;socket: WebSocket;}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");
    const [strokeColor, setStrokeColor] = useState("#1e1e1e");
    const [fillColor, setFillColor] = useState("transparent");
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [strokeStyle, setStrokeStyle] = useState<number[]>([]);

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (game) {
            game.setStrokeColor(strokeColor);
            game.setFillColor(fillColor);
            game.setStrokeWidth(strokeWidth);
            game.setStrokeStyle(strokeStyle);
        }
    }, [strokeColor, fillColor, strokeWidth, strokeStyle, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);
            return () => {
                g.destroy();
            }
        }
    }, [canvasRef]);

    return (
        <div className="relative w-full h-screen">
            {/* Centered Topbar */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
            </div>
            
            {/* Left-aligned Properties Panel, only shown for drawing tools */}
            {isDrawingTool(selectedTool) && (
                <div className="absolute top-4 left-4 z-10">
                    <PropertiesPanel
                        strokeColor={strokeColor}
                        fillColor={fillColor}
                        strokeWidth={strokeWidth}
                        strokeStyle={strokeStyle}
                        onStrokeColorChange={setStrokeColor}
                        onFillColorChange={setFillColor}
                        onStrokeWidthChange={setStrokeWidth}
                        onStrokeStyleChange={setStrokeStyle}
                    />
                </div>
            )}
            
            <canvas 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight}
                className="w-full h-full"
            />
        </div>
    );
}

