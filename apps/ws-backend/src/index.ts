import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  console.log("Token received for verification:", token);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log("Decoded JWT:", decoded);

    if (typeof decoded === "string" || !decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch(e) {
    console.error("Token verification failed:", e);
    if (e instanceof jwt.TokenExpiredError) {
      throw new Error("TOKEN_EXPIRED");
    }
    return null;
  }
}

wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    ws.send(JSON.stringify({
      type: "error",
      code: "INVALID_REQUEST",
      message: "Invalid connection request"
    }));
    ws.close();
    return;
  }
  
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  let connectedUserId: string;
  
  try {
    const userId = checkUser(token);
    if (userId == null) {
      ws.send(JSON.stringify({
        type: "error",
        code: "INVALID_TOKEN",
        message: "Invalid authentication token"
      }));
      ws.close();
      return;
    }

    connectedUserId = userId;
    users.push({
      userId: connectedUserId,
      rooms: [],
      ws
    });

    // Send successful connection message
    ws.send(JSON.stringify({
      type: "connection",
      status: "connected",
      userId: connectedUserId
    }));

  } catch (e) {
    if (e instanceof Error && e.message === "TOKEN_EXPIRED") {
      ws.send(JSON.stringify({
        type: "error",
        code: "TOKEN_EXPIRED",
        message: "Authentication token has expired"
      }));
    } else {
      ws.send(JSON.stringify({
        type: "error",
        code: "AUTH_ERROR",
        message: "Authentication failed"
      }));
    }
    ws.close();
    return;
  }

  ws.on('message', async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data);
    }

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter(x => x === parsedData.room);
    }

    console.log("message received")
    console.log(parsedData);

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      console.log(`Attempting to create chat with userId: ${connectedUserId}`);
      console.log(`User ID type: ${typeof connectedUserId}, value: ${connectedUserId}`);
    
      try {
        // Check if user exists first
        const userExists = await prismaClient.user.findUnique({
          where: { id: connectedUserId }
        });
    
        if (!userExists) {
          console.error(`User with ID ${connectedUserId} not found`);
          ws.send(JSON.stringify({
            type: "error",
            message: "User not found, please log in again"
          }));
          return;
        }
    
        // Create chat message
        await prismaClient.chat.create({
          data: {
            roomId: Number(roomId),
            message,
            userId: connectedUserId
          }
        });
    
        // Send message to users in the room
        users.forEach(user => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(JSON.stringify({
              type: "chat",
              message: message,
              userId: connectedUserId,
              roomId
            }))
          }
        });
      } catch (error) {
        console.error("Error creating chat message:", error);
        ws.send(JSON.stringify({
          type: "error",
          message: "Failed to send message"
        }));
      }
    }
  });
});
