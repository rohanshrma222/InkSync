import { Circle, Eraser, Hand, Pencil, RectangleHorizontalIcon } from "lucide-react"
import type { Tool } from "./Canvas"
import { IconButton } from "./ui/iconButton"

export function Topbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return <div style={{
            position: "fixed",
            top: 10,
            left: 10
        }}>
            <div className="flex gap-t bg-amber-50 border rounded-2xl">
                <IconButton 
                    onClick={() => {
                        setSelectedTool("pencil")
                    }}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil />}
                />
                <IconButton onClick={() => {
                    setSelectedTool("rect")
                }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle")
                }} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("eraser")
                }} activated={selectedTool === "eraser"} icon={<Eraser />}></IconButton>
                 <IconButton onClick={() => {
                    setSelectedTool("hand")
                }} activated={selectedTool === "hand"} icon={<Hand />}></IconButton>
            </div>
        </div>
}