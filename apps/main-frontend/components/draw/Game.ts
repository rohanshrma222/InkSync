import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { GridManager } from "./grid";
import { ViewManager, Point } from "./view";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    id?: string;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
    id?: string;
} | {
    type: "pencil";
    points: Point[];
    id?: string;
} | {
    type: "eraser";
} | {
    type: "hand";
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private currentPencilPoints: Point[] = [];
    private eraserSize = 20; // Size of the eraser
    
    // Managers for grid and view
    private gridManager: GridManager;
    private viewManager: ViewManager;

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        
        // Initialize managers
        this.gridManager = new GridManager(this.ctx);
        this.viewManager = new ViewManager(canvas, this.ctx);
        
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
        this.initWheelHandler();
    }
    
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.removeEventListener("wheel", this.wheelHandler);
    }

    setTool(tool: "circle" | "pencil" | "rect" |"eraser" | "hand") {
        this.selectedTool = tool;
        
        // Set appropriate cursor immediately when tool changes
        if (tool === "hand") {
            this.canvas.style.cursor = "grab";
        } else if (tool === "eraser") {
            this.canvas.style.cursor = "none"; // We'll draw our own cursor
        } else {
            this.canvas.style.cursor = "crosshair";
        }
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        // Assign IDs to existing shapes if they don't have them
        this.existingShapes = this.existingShapes.map((shape, index) => {
            if (!('id' in shape)) {
                return {
                    ...shape,
                    id: `shape_${index}_${Date.now()}`
                };
            }
            return shape;
        });
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedMessage = JSON.parse(message.message);
                if (parsedMessage.action === "add") {
                    const newShape = parsedMessage.shape;
                    this.existingShapes.push(newShape);
                } else if (parsedMessage.action === "delete") {
                    const shapeId = parsedMessage.shapeId;
                    this.existingShapes = this.existingShapes.filter(shape => 
                        !('id' in shape) || shape.id !== shapeId);
                }
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const scale = this.viewManager.getScale();
        const offset = this.viewManager.getOffset();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw background
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw grid with zoom and pan
        this.gridManager.drawGrid(width, height, scale, offset.x, offset.y);
        
        // Save context for transformations
        this.ctx.save();
        
        // Apply transformations for zoom and pan
        this.viewManager.applyTransform();
        
        // Set default stroke style for shapes
        this.ctx.strokeStyle = "rgba(255, 255, 255)";
        this.ctx.lineWidth = 2 / scale; // Adjust line width for zoom
        
        // Draw existing shapes
        this.existingShapes.forEach((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            }
            else if(shape.type === "pencil") {
                if (shape.points.length > 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                    
                    for (let i = 1; i < shape.points.length; i++) {
                        this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                    }
                    
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        });
        
        // Draw current pencil stroke if we're in the middle of drawing
        if (this.clicked && this.selectedTool === "pencil" && this.currentPencilPoints.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.currentPencilPoints[0].x, this.currentPencilPoints[0].y);
            
            for (let i = 1; i < this.currentPencilPoints.length; i++) {
                this.ctx.lineTo(this.currentPencilPoints[i].x, this.currentPencilPoints[i].y);
            }
            
            this.ctx.stroke();
            this.ctx.closePath();
        }
        
        // Draw eraser cursor if eraser is selected
        if (this.selectedTool === "eraser") {
            const lastMousePos = this.viewManager.getLastMousePosition();
            if (lastMousePos.x && lastMousePos.y) {
                const worldPos = this.viewManager.screenToWorld(lastMousePos.x, lastMousePos.y);
                
                this.ctx.beginPath();
                this.ctx.arc(worldPos.x, worldPos.y, this.eraserSize / scale, 0, Math.PI * 2);
                this.ctx.strokeStyle = "red";
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
        
        // Restore context
        this.ctx.restore();
    }

    isShapeUnderEraser(shape: Shape, eraserX: number, eraserY: number, eraserRadius: number): boolean {
        if (shape.type === "rect") {
            // Check if any corner or the center of the rectangle is within eraser radius
            const corners = [
                { x: shape.x, y: shape.y },
                { x: shape.x + shape.width, y: shape.y },
                { x: shape.x, y: shape.y + shape.height },
                { x: shape.x + shape.width, y: shape.y + shape.height },
                { x: shape.x + shape.width/2, y: shape.y + shape.height/2 } // center
            ];
            
            for (const corner of corners) {
                const dx = corner.x - eraserX;
                const dy = corner.y - eraserY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= eraserRadius) {
                    return true;
                }
            }
        } else if (shape.type === "circle") {
            // Calculate distance between circle center and eraser center
            const dx = shape.centerX - eraserX;
            const dy = shape.centerY - eraserY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If distance is less than sum of radii, there's an intersection
            return distance <= (shape.radius + eraserRadius);
        } else if (shape.type === "pencil") {
            // Check if any point in the pencil stroke is within eraser radius
            for (const point of shape.points) {
                const dx = point.x - eraserX;
                const dy = point.y - eraserY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= eraserRadius) {
                    return true;
                }
            }
        }
        
        return false;
    }

    wheelHandler = (e: WheelEvent) => {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Use the ViewManager to handle zooming
        this.viewManager.zoom(mouseX, mouseY, e.deltaY < 0);
        
        this.clearCanvas();
    }

    initWheelHandler() {
        this.canvas.addEventListener("wheel", this.wheelHandler);
    }

    mouseDownHandler = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        // Store screen coordinates for future use through the ViewManager
        this.viewManager.updateLastMousePosition(screenX, screenY);
        
        // Handle hand tool (pan) specifically
        if (this.selectedTool === "hand") {
            this.viewManager.startPan(screenX, screenY);
            this.canvas.style.cursor = "grabbing";
            return;
        }
        
        // Convert to world coordinates for other tools
        const worldPos = this.viewManager.screenToWorld(screenX, screenY);
        
        if (this.selectedTool === "eraser") {
            // For eraser, we check immediately for shapes to erase
            const shapesToDelete = [];
            const scale = this.viewManager.getScale();
            
            for (const shape of this.existingShapes) {
                if (this.isShapeUnderEraser(shape, worldPos.x, worldPos.y, this.eraserSize / scale)) {
                    if ('id' in shape) {
                        shapesToDelete.push(shape.id);
                    }
                }
            }
            
            // Delete shapes and broadcast deletion
            if (shapesToDelete.length > 0) {
                shapesToDelete.forEach(shapeId => {
                    this.existingShapes = this.existingShapes.filter(shape => 
                        !('id' in shape) || shape.id !== shapeId);
                    
                    this.socket.send(JSON.stringify({
                        type: "chat",
                        message: JSON.stringify({
                            action: "delete",
                            shapeId
                        }),
                        roomId: this.roomId
                    }));
                });
                
                this.clearCanvas();
            }
            
            this.clicked = true;
            return;
        }
        
        this.clicked = true;
        this.startX = worldPos.x;
        this.startY = worldPos.y;
        
        if (this.selectedTool === "pencil") {
            this.currentPencilPoints = [{ x: this.startX, y: this.startY }];
        }
    }
    
    mouseUpHandler = (e: MouseEvent) => {
        // For hand tool, release the drag state
        if (this.selectedTool === "hand") {
            this.viewManager.endPan();
            this.canvas.style.cursor = "grab";
            return;
        }
        
        if (this.selectedTool === "eraser") {
            this.clicked = false;
            return;
        }
        
        if (!this.clicked) return;
        
        this.clicked = false;
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        // Convert to world coordinates
        const worldPos = this.viewManager.screenToWorld(screenX, screenY);
        const currentX = worldPos.x;
        const currentY = worldPos.y;
        
        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;
        
        if (selectedTool === "rect") {
            const width = currentX - this.startX;
            const height = currentY - this.startY;
            
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width,
                id: `rect_${Date.now()}`
            };
        } else if (selectedTool === "circle") {
            const width = currentX - this.startX;
            const height = currentY - this.startY;
            const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
            const centerX = this.startX + width / 2;
            const centerY = this.startY + height / 2;
            
            shape = {
                type: "circle",
                radius,
                centerX,
                centerY,
                id: `circle_${Date.now()}`
            };
        } else if (selectedTool === "pencil") {
            // Only save pencil shape if we have actual points
            if (this.currentPencilPoints.length > 1) {
                shape = {
                    type: "pencil",
                    points: [...this.currentPencilPoints],
                    id: `pencil_${Date.now()}`
                };
            }
            this.currentPencilPoints = [];
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                action: "add",
                shape
            }),
            roomId: this.roomId
        }));
        
        this.clearCanvas();
    }
    
    mouseMoveHandler = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        // Get the last mouse position from ViewManager
        const lastMousePos = this.viewManager.getLastMousePosition();
        const deltaX = screenX - lastMousePos.x;
        const deltaY = screenY - lastMousePos.y;
        
        // Handle panning with hand tool using ViewManager
        if (this.selectedTool === "hand" && this.viewManager.isDraggingView()) {
            this.viewManager.pan(deltaX, deltaY);
            // Redraw the canvas with the new offsets
            this.clearCanvas();
        }
        
        // Update last mouse position for next move event
        this.viewManager.updateLastMousePosition(screenX, screenY);
        
        // For eraser, continuously check and delete shapes
        if (this.clicked && this.selectedTool === "eraser") {
            const worldPos = this.viewManager.screenToWorld(screenX, screenY);
            const shapesToDelete = [];
            const scale = this.viewManager.getScale();
            
            for (const shape of this.existingShapes) {
                if (this.isShapeUnderEraser(shape, worldPos.x, worldPos.y, this.eraserSize / scale)) {
                    if ('id' in shape) {
                        shapesToDelete.push(shape.id);
                    }
                }
            }
            
            // Delete shapes and broadcast deletion
            if (shapesToDelete.length > 0) {
                shapesToDelete.forEach(shapeId => {
                    this.existingShapes = this.existingShapes.filter(shape => 
                        !('id' in shape) || shape.id !== shapeId);
                    
                    this.socket.send(JSON.stringify({
                        type: "chat",
                        message: JSON.stringify({
                            action: "delete",
                            shapeId
                        }),
                        roomId: this.roomId
                    }));
                });
            }
            
            this.clearCanvas();
            return;
        }
        
        // Convert to world coordinates for drawing
        const worldPos = this.viewManager.screenToWorld(screenX, screenY);
        const currentX = worldPos.x;
        const currentY = worldPos.y;
        
        if (this.clicked) {
            if (this.selectedTool === "rect") {
                const width = currentX - this.startX;
                const height = currentY - this.startY;
                
                this.clearCanvas();
                
                // Draw the new rectangle with transformations applied
                this.ctx.save();
                this.viewManager.applyTransform();
                this.ctx.strokeStyle = "rgba(255, 255, 255)";
                this.ctx.lineWidth = 2 / this.viewManager.getScale();
                this.ctx.strokeRect(this.startX, this.startY, width, height);
                this.ctx.restore();
                
            } else if (this.selectedTool === "circle") {
                const width = currentX - this.startX;
                const height = currentY - this.startY;
                const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
                const centerX = this.startX + width / 2;
                const centerY = this.startY + height / 2;
                
                this.clearCanvas();
                
                // Draw the new circle with transformations applied
                this.ctx.save();
                this.viewManager.applyTransform();
                this.ctx.strokeStyle = "rgba(255, 255, 255)";
                this.ctx.lineWidth = 2 / this.viewManager.getScale();
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
                this.ctx.restore();
                
            } else if (this.selectedTool === "pencil") {
                // Add the current point to our pencil stroke
                this.currentPencilPoints.push({ x: currentX, y: currentY });
                
                // Redraw everything
                this.clearCanvas();
            }
        }
        
        // Update cursor appearance based on current tool
        this.updateCursor();
    }

    updateCursor() {
        // Set the appropriate cursor style based on the current tool
        if (this.selectedTool === "eraser") {
            this.canvas.style.cursor = "none"; // Hide default cursor, we draw our own
            this.clearCanvas(); // Refresh to show updated eraser cursor position
        } else if (this.selectedTool === "hand") {
            this.canvas.style.cursor = this.viewManager.isDraggingView() ? "grabbing" : "grab";
        } else {
            this.canvas.style.cursor = "crosshair";
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
        
        // Add mouseout/leave handler to reset state if mouse leaves canvas
        this.canvas.addEventListener("mouseleave", () => {
            if (this.viewManager.isDraggingView() && this.selectedTool === "hand") {
                this.viewManager.endPan();
                this.canvas.style.cursor = "grab";
            }
        });
    }
}