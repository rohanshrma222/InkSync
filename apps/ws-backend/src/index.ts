import { WebSocketServer, WebSocket } from 'ws';
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from '@repo/db/client';

const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws: WebSocket;
    rooms: string[];
    userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
    try {
        console.log("Received token:", token);

        // Decode the token
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        console.log("Decoded token:", decoded);

        // Ensure decoded payload contains userId
        if (!decoded || typeof decoded !== "object") {
            console.error("Decoded token is invalid:", decoded);
            return null;
        }

        if (!decoded.userId) {
            console.error("User ID is missing in decoded token.");
            return null;
        }

        console.log("Extracted User ID:", decoded.userId);
        return decoded.userId;
    } catch (error) {
        console.error("JWT verification error:", error);
        return null;
    }
}

wss.on('connection', (ws: WebSocket, request) => {
    console.log("New WebSocket connection established.");
    console.log("Request URL:", request.url);
    const url = request.url;
    if (!url){
        console.error("Request URL is missing.");
        ws.close();
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    console.log("Query Params:", queryParams.toString());
    const token = queryParams.get('token') || "";

    if (!token) {
        console.error("Token not found in request.");
        ws.close();
        return;
    }

    const userId = checkUser(token);

    if (!userId) {
        console.error("Invalid token or user ID.");
        ws.close();
        return;
    }

    const newUser: User = { userId, rooms: [], ws };
    users.push(newUser);

    ws.on('message', async (data) => {
        console.log("messagereceived");
        console.log(data);
        const parsedData = JSON.parse(data.toString());

        const user = users.find(x => x.ws === ws);
        if (!user) return;

        if (parsedData.type === "join_room") {
            user.rooms.push(parsedData.roomId);
        }

        if (parsedData.type === "leave_room") {
            user.rooms = user.rooms.filter(x => x !== parsedData.roomId);
        }

        console.log("message received")
        console.log(parsedData);

        if (parsedData.type === "chat") {
            const { roomId, message } = parsedData;

            try {
                await prismaClient.chat.create({
                    data: {
                        roomId: Number(roomId),
                        message,
                        userId: user.userId,
                    }
                });

                users.forEach(u => {
                    if (u.rooms.includes(roomId)) {
                        u.ws.send(JSON.stringify({
                            type: "chat",
                            message,
                            roomId
                        }));
                    }
                });
            } catch (error) {
                console.error("Database error:", error);
            }
        }
    });

    ws.on('close', () => {
        const index = users.findIndex(u => u.ws === ws);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
});

// import { WebSocketServer } from 'ws';
// import jwt, { type JwtPayload } from "jsonwebtoken";
// import { JWT_SECRET } from '@repo/backend-common/config';
// import { prismaClient } from '@repo/db/client';

// interface User {
//     ws: WebSocket;
//     rooms: string[];
//     userId: string;
// }

// /**
//  * WebSocketService - Singleton class to manage WebSocket connections and user state
//  */
// class WebSocketService {
//     private static instance: WebSocketService;
//     private wss: WebSocketServer;
//     private users: User[] = [];

//     private constructor() {
//         this.wss = new WebSocketServer({ port: 8080 });
//         this.initializeWebSocketServer();
//     }

//     /**
//      * Get the singleton instance of WebSocketService
//      */
//     public static getInstance(): WebSocketService {
//         if (!WebSocketService.instance) {
//             WebSocketService.instance = new WebSocketService();
//         }
//         return WebSocketService.instance;
//     }

//     /**
//      * Verify JWT token and extract userId
//      */
//     private checkUser(token: string): string | null {
//         try {
//             const decoded = jwt.verify(token, JWT_SECRET);

//             if (typeof decoded === "string") {
//                 return null;
//             }

//             if (!decoded || !(decoded as JwtPayload).userId) {
//                 return null;
//             }
//             return (decoded as JwtPayload).userId;
//         } catch (e) {
//             return null;
//         }
//     }

//     /**
//      * Initialize WebSocket server and set up event handlers
//      */
//     private initializeWebSocketServer(): void {
//         this.wss.on('connection', (ws, request) => this.handleConnection(ws, request));
//     }

//     /**
//      * Handle new WebSocket connections
//      */
//     private handleConnection(ws: WebSocket, request: any): void {
//         const url = request.url;
//         if (!url) {
//             ws.close();
//             return;
//         }

//         const queryParams = new URLSearchParams(url.split('?')[1]);
//         const token = queryParams.get('token') || "";
//         const userId = this.checkUser(token);

//         if (userId === null) {
//             ws.close();
//             return;
//         }

//         // Add user to users array
//         const user: User = {
//             userId,
//             rooms: [],
//             ws
//         };
//         this.users.push(user);

//         // Set up message handler
//         ws.on('message', (data) => this.handleMessage(ws, data, userId));

//         // Handle disconnection
//         ws.on('close', () => this.handleDisconnection(ws));
//     }

//     /**
//      * Handle incoming WebSocket messages
//      */
//     private handleMessage(ws: WebSocket, data: any, userId: string): void {
//         try {
//             const parsedData = JSON.parse(data as unknown as string);
//             const user = this.users.find(x => x.ws === ws);
            
//             if (!user) return;

//             switch (parsedData.type) {
//                 case "join_room":
//                     this.handleJoinRoom(user, parsedData.roomId);
//                     break;
//                 case "leave_room":
//                     this.handleLeaveRoom(user, parsedData.roomId);
//                     break;
//                 case "chat":
//                     this.handleChatMessage(userId, parsedData.roomId, parsedData.message);
//                     break;
//             }
//         } catch (error) {
//             console.error("Error handling message:", error);
//         }
//     }

//     /**
//      * Handle user joining a room
//      */
//     private handleJoinRoom(user: User, roomId: string): void {
//         if (!user.rooms.includes(roomId)) {
//             user.rooms.push(roomId);
//         }
//     }

//     /**
//      * Handle user leaving a room
//      */
//     private handleLeaveRoom(user: User, roomId: string): void {
//         user.rooms = user.rooms.filter(x => x !== roomId);
//     }

//     /**
//      * Handle chat messages
//      */
//     private async handleChatMessage(userId: string, roomId: string, message: string): Promise<void> {
//         try {
//             // Store message in database
//             await prismaClient.chat.create({
//                 data: {
//                     roomId,
//                     message,
//                     userId
//                 }
//             });

//             // Broadcast message to users in the room
//             this.broadcastToRoom(roomId, {
//                 type: "chat",
//                 message,
//                 roomId
//             });
//         } catch (error) {
//             console.error("Error handling chat message:", error);
//         }
//     }

//     /**
//      * Broadcast message to all users in a room
//      */
//     private broadcastToRoom(roomId: string, data: any): void {
//         this.users.forEach(user => {
//             if (user.rooms.includes(roomId)) {
//                 user.ws.send(JSON.stringify(data));
//             }
//         });
//     }

//     /**
//      * Handle user disconnection
//      */
//     private handleDisconnection(ws: WebSocket): void {
//         const index = this.users.findIndex(user => user.ws === ws);
//         if (index !== -1) {
//             this.users.splice(index, 1);
//         }
//     }

//     /**
//      * Get all connected users
//      */
//     public getUsers(): User[] {
//         return [...this.users];
//     }
// }

// // Export the singleton instance
// export const webSocketService = WebSocketService.getInstance();

// // For standalone usage
// if (require.main === module) {
//     WebSocketService.getInstance();
//     console.log("WebSocket server started on port 8080");
// }