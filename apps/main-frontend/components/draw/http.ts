import { HTTP_BACKEND } from "@/lib/config";
import axios from "axios";
import type { Shape } from "./types";

export async function getExistingShapes(roomId: string): Promise<Shape[]> {
    try {
        const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
        const messages = res.data.messages || [];
        
        // Track deleted shape IDs
        const deletedShapeIds = new Set<string>();
        
        // First pass: collect all deleted shape IDs
        messages.forEach((x: { message: string }) => {
            try {
                const messageData = JSON.parse(x.message);
                if (messageData.action === "delete") {
                    deletedShapeIds.add(messageData.shapeId);
                }
            } catch (error) {
                console.error('Failed to parse message:', error);
            }
        });
        
        // Second pass: collect shapes that haven't been deleted
        const shapes = messages
            .map((x: { message: string }) => {
                try {
                    const messageData = JSON.parse(x.message);
                    if (messageData.action === "add") {
                        const shape = messageData.shape;
                        // Only include shapes that haven't been deleted
                        return shape && shape.id && !deletedShapeIds.has(shape.id) ? shape : null;
                    }
                    return null;
                } catch (error) {
                    console.error('Failed to parse message:', error);
                    return null;
                }
            })
            .filter((shape: Shape | null): shape is Shape => shape !== null);
            
        return shapes;
    } catch (error) {
        console.error('Failed to fetch shapes:', error);
        return [];
    }
}