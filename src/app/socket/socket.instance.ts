import e from "express";
import { Server } from "socket.io";

// Singleton pattern to share the io instance globally
// Call getIO() in handler files or services to access the same instance
let io: Server;

export const setIO = (instance: Server) => {
  io = instance;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
