import type { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./https";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export class Game{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX: 0;
    private startY: 0;
    private selectedTool : Tool = "circle";
    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement,roomId:string,socket:WebSocket){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked= false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    setTool(tool:"circle" | "pencil" | "rect"){
        this.selectedTool = tool;
    }

    async init(){
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers(){
        this.socket.onmessage = (event) =>{
            const message = JSON.parse(event.data);

            if(message.type == "chat"){
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
            }
        }
    }

    clearCanvas(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle = "rgba(0,0,0)"
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        this.existingShapes.map((shape)=>{
            if(shape.type === "rect"){
                this.ctx.strokeStyle = "rgba(255,255,255)"
                this.ctx.strokeRect(shape.x,shape.y,shape.width,shape.height);
            }
            else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            }
        })
    }

    initMouseHandlers(){
        this.canvas.addEventListener("mousedown",(e) => {
            this.clicked = true
            this.startX  = e.clientX
            this.startY  = e.clientY
        })

        this.canvas.addEventListener("mouseup",(e)=>{
            this.clicked = false
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            //@ts-ignore
            const selectedTool = window.selectedTool;
            let shape : Shape | null = null;
            if(selectedTool === "rect"){
                     shape = {
                    //@ts-ignore
                    type: "rect",
                    x: this.startX,
                    y: this.startY,
                    height,
                    width
                }
                this.existingShapes.push(shape);
            } else if(selectedTool === "circle"){
                const radius = Math.max(width,height) /2;
                     shape = {
                    //@ts-ignore
                    type: "circle",
                    radius: radius,
                    centerX: this.startX + radius,
                    centerY: this.startY + radius,
                } 
            }

            if(!shape){
                return;
            }
            this.existingShapes.push(shape);
            
            this.socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({
                    shape
                }),
                roomId: this.roomId
            }))
            
        })

        this.canvas.addEventListener("mousemove",(e)=>{
            if(this.clicked){
                const width = e.clientX - this.startX;
                const height = e.clientY - this.startY;
                this.clearCanvas();
                this.ctx.strokeStyle="rgba(255,255,255)"
                // @ts-ignore
                const selectedTool = window.selectedTool;
                if(selectedTool === "rect"){
                    this.ctx.strokeRect(this.startX,this.startY,width,height); 
                }else if(selectedTool === "circle"){
                    const radius = Math.max(width,height) /2;
                    const centerX = this.startX + radius;
                    const centerY = this.startY + radius;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX,centerY,radius,0,Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.closePath();     
                }
            }
        })  
    }
}