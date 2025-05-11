import { Point } from "./view";

export type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    id?: string;
    strokeColor?: string;
    fillColor?: string;
    strokeWidth?: number;
    strokeStyle?: number[];
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
    id?: string;
    strokeColor?: string;
    fillColor?: string;
    strokeWidth?: number;
    strokeStyle?: number[];
} | {
    type: "pencil";
    points: Point[];
    id?: string;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: number[];
} | {
    type: "eraser";
} | {
    type: "hand";
} 