// socket.js

import { Server } from "socket.io";
let io;
const onlineUsers = new Map(); // userId -> socketId

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // Change this in production
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.userId = userId;
      next();
    } else {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Store user's socket connection
    onlineUsers.set(socket.userId, socket.id);
    socket.broadcast.emit("user-online", { userId: socket.userId });
    // Join user to their personal room for private messages
    socket.join(`user_${socket.userId}`);

    // Join chat rooms for existing chats
    socket.on("join-chats", (chatIds) => {
      chatIds.forEach((chatId) => {
        socket.join(`chat_${chatId}`);
      });
    });

    // Handle typing indicator
    socket.on("typing", ({ chatId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit("user-typing", {
        userId: socket.userId,
        isTyping,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
      onlineUsers.delete(socket.userId);

      // Broadcast offline status
      socket.broadcast.emit("user-offline", { userId: socket.userId });
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function isUserOnline(userId) {
  return onlineUsers.has(userId);
}

export function getUserSocketId(userId) {
  return onlineUsers.get(userId);
}
