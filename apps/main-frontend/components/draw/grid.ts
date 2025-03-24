export class GridManager {
    private ctx: CanvasRenderingContext2D;
    private gridSize: number;
    
    constructor(ctx: CanvasRenderingContext2D, gridSize: number = 40) {
        this.ctx = ctx;
        this.gridSize = gridSize;
    }
    
    setGridSize(size: number) {
        this.gridSize = size;
    }
    
    drawGrid(width: number, height: number, scale: number, offsetX: number, offsetY: number) {
        // Save current drawing state
        this.ctx.save();
        
        // Apply transforms for zoom and pan
        this.ctx.translate(offsetX, offsetY);
        this.ctx.scale(scale, scale);
        
        // Calculate visible area in world coordinates
        const visibleStartX = -offsetX / scale;
        const visibleStartY = -offsetY / scale;
        const visibleEndX = (width - offsetX) / scale;
        const visibleEndY = (height - offsetY) / scale;
        
        // Calculate grid lines within the visible area
        const startX = Math.floor(visibleStartX / this.gridSize) * this.gridSize;
        const startY = Math.floor(visibleStartY / this.gridSize) * this.gridSize;
        const endX = Math.ceil(visibleEndX / this.gridSize) * this.gridSize;
        const endY = Math.ceil(visibleEndY / this.gridSize) * this.gridSize;
        
        // Set grid styling
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        this.ctx.lineWidth = 0.5 / scale; // Adjust line width for zoom
        
        // Draw vertical lines
        for (let x = startX; x <= endX; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, visibleStartY);
            this.ctx.lineTo(x, visibleEndY);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = startY; y <= endY; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(visibleStartX, y);
            this.ctx.lineTo(visibleEndX, y);
            this.ctx.stroke();
        }
        
        // Restore drawing state
        this.ctx.restore();
    }
}