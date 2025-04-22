import { WebSocketServer } from 'ws';
import http from 'http';
import { randomUUID } from 'crypto';

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server for WebRTC signaling\n');
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store connected clients by room ID
const rooms = new Map();
let connectionCounter = 0;

wss.on('connection', (ws) => {
  // 고유 사용자 ID 생성
  const userId = `User_${++connectionCounter}`;
  ws.userId = userId;
  
  console.log(`${userId} connected`);
  
  // 클라이언트에게 자신의 ID 전송
  ws.send(JSON.stringify({
    type: 'userId',
    userId: userId
  }));
  
  let clientRoomId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle joining a room
      if (data.type === 'join') {
        clientRoomId = data.roomId;
        
        if (!rooms.has(clientRoomId)) {
          rooms.set(clientRoomId, new Set());
        }
        
        // Add this client to the room
        rooms.get(clientRoomId).add(ws);
        console.log(`${userId} joined room: ${clientRoomId}`);
        console.log(`Room ${clientRoomId} has ${rooms.get(clientRoomId).size} clients`);
        
        // 같은 방에 있는 다른 클라이언트들에게 새 사용자 입장 알림
        rooms.get(clientRoomId).forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'chat',
              message: `${userId}님이 입장했습니다.`,
              from: 'System'
            }));
          }
        });
      }
      
      // Handle signaling data or chat messages
      else if (data.type === 'signal' || data.type === 'chat') {
        const roomId = data.roomId;
        
        if (rooms.has(roomId)) {
          // Forward the message to all other clients in the same room
          rooms.get(roomId).forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              if (data.type === 'signal') {
                client.send(JSON.stringify(data.signalData));
              } else if (data.type === 'chat') {
                client.send(JSON.stringify({
                  type: 'chat',
                  message: data.message,
                  from: userId
                }));
              }
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error processing message from ${userId}:`, error);
    }
  });

  ws.on('close', () => {
    console.log(`${userId} disconnected`);
    
    // Remove client from room
    if (clientRoomId && rooms.has(clientRoomId)) {
      // 같은 방에 있는 다른 클라이언트들에게 사용자 퇴장 알림
      rooms.get(clientRoomId).forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'chat',
            message: `${userId}님이 퇴장했습니다.`,
            from: 'System'
          }));
        }
      });
      
      rooms.get(clientRoomId).delete(ws);
      
      // If room is empty, delete it
      if (rooms.get(clientRoomId).size === 0) {
        rooms.delete(clientRoomId);
        console.log(`Room ${clientRoomId} deleted (empty)`);
      } else {
        console.log(`${userId} left room: ${clientRoomId}`);
        console.log(`Room ${clientRoomId} has ${rooms.get(clientRoomId).size} clients`);
      }
    }
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
}); 