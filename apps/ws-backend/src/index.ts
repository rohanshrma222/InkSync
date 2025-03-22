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
    return null;
  }
  
}

wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if (userId == null) {
    ws.close()
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws
  })

  ws.on('message', async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
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

      console.log(`Attempting to create chat with userId: ${userId}`);
      console.log(`User ID type: ${typeof userId}, value: ${userId}`);
    
      try {
        // Check if user exists first
        const userExists = await prismaClient.user.findUnique({
          where: { id: userId }
        });
    
        if (!userExists) {
          console.error(`User with ID ${userId} not found`);
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
            userId: userId  // Make sure this matches the type in your database schema
          }
        });
    
        // Send message to users in the room
        users.forEach(user => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(JSON.stringify({
              type: "chat",
              message: message,
              userId: userId,  // Include sender ID
              roomId
            }))
          }
        });
      } catch (error) {
        console.error("Error creating chat message:", error);
        // Optionally notify the user about the error
        ws.send(JSON.stringify({
          type: "error",
          message: "Failed to send message"
        }));
      }
    }

  });

});
