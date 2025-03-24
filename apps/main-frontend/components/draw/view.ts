export type Point = {
    x: number;
    y: number;
}

export class ViewManager {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    
    // View state
    private scale: number = 1;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private isDragging: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    
    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
    }
    
    // Convert screen coordinates to world coordinates
    screenToWorld(screenX: number, screenY: number): Point {
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX: number, worldY: number): Point {
        return {
            x: worldX * this.scale + this.offsetX,
            y: worldY * this.scale + this.offsetY
        };
    }
    
    // Apply transformations to the context for drawing
    applyTransform() {
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);
    }
    
    // Start panning
    startPan(x: number, y: number) {
        this.isDragging = true;
        this.lastMouseX = x;
        this.lastMouseY = y;
    }
    
    // End panning
    endPan() {
        this.isDragging = false;
    }
    
    // Pan by the specified delta
    pan(deltaX: number, deltaY: number) {
        if (this.isDragging) {
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            return true;
        }
        return false;
    }
    
    // Handle zoom with mouse wheel
    zoom(mouseX: number, mouseY: number, zoomIn: boolean) {
        // Get mouse position in world space before zoom
        const worldPos = this.screenToWorld(mouseX, mouseY);
        
        // Update scale (zoom level)
        const zoomFactor = zoomIn ? 1.1 : 0.9;
        this.scale *= zoomFactor;
        
        // Limit zoom level if needed
        this.scale = Math.max(0.1, Math.min(10, this.scale));
        
        // Adjust offset to zoom toward mouse position
        const newWorldPos = this.screenToWorld(mouseX, mouseY);
        this.offsetX += (worldPos.x - newWorldPos.x) * this.scale;
        this.offsetY += (worldPos.y - newWorldPos.y) * this.scale;
        
        return true;
    }
    
    // Getters for the current view state
    getScale() {
        return this.scale;
    }
    
    getOffset() {
        return {
            x: this.offsetX,
            y: this.offsetY
        };
    }
    
    isDraggingView() {
        return this.isDragging;
    }
    
    updateLastMousePosition(x: number, y: number) {
        this.lastMouseX = x;
        this.lastMouseY = y;
    }
    
    getLastMousePosition() {
        return {
            x: this.lastMouseX,
            y: this.lastMouseY
        };
    }
}