import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { config } from "../config";

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.ALLOWED_ORIGINS,
      credentials: true,
    },
    // attempt when connection drop
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, //2min
    },
  });
};
