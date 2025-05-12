import { Circle, Eraser, Hand, Pencil, RectangleHorizontalIcon } from "lucide-react"
import type { Tool } from "./Canvas"
import { IconButton } from "./ui/iconButton"

export function Topbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return (
        <div className="flex gap-2 bg-white/90 border rounded-xl p-0.5 scale-90">
            <IconButton 
                onClick={() => {
                    setSelectedTool("pencil")
                }}
                activated={selectedTool === "pencil"}
                icon={<Pencil />}
            />
            <IconButton 
                onClick={() => {
                    setSelectedTool("rect")
                }} 
                activated={selectedTool === "rect"} 
                icon={<RectangleHorizontalIcon />} 
            />
            <IconButton 
                onClick={() => {
                    setSelectedTool("circle")
                }} 
                activated={selectedTool === "circle"} 
                icon={<Circle />}
            />
            <IconButton 
                onClick={() => {
                    setSelectedTool("eraser")
                }} 
                activated={selectedTool === "eraser"} 
                icon={<Eraser />}
            />
            <IconButton 
                onClick={() => {
                    setSelectedTool("hand")
                }} 
                activated={selectedTool === "hand"} 
                icon={<Hand />}
            />
        </div>
    );
}