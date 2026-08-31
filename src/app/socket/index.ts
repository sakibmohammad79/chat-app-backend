import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { config } from "../config";
import { setIO } from "./socket.instance";
import { verifyAccessToken } from "../utils/jwt";
import type { AuthSocket } from "./socket.types";
import { registerPresenceHandlers } from "./handlers/presence.handler";
import { registerTypingHandlers } from "./handlers/typing.handler";
import { registerMessageHandler } from "./handlers/message.handler";

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
  setIO(io);

  io.use((socket, next) => {
    try {
      // Client send token in to way
      // socket.auth = { token: "..." }  ← recommended
      // query: ?token=...               ← fallback
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.query?.token as string);

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = verifyAccessToken(token);
      //user attach in socket
      (socket as AuthSocket).user = {
        id: decoded.id,
        email: decoded.email,
      };

      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  //connection handler
  io.on("connection", (socket) => {
    const authSocket = socket as AuthSocket;

    console.log(`Socket connected: ${authSocket.user.id} (${socket.id})`);

    //every handler register
    registerPresenceHandlers(authSocket);
    registerTypingHandlers(authSocket);
    registerMessageHandler(authSocket);

    socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected: ${authSocket.user.id} — reason: ${reason}`,
      );
    });
  });
  return io;
};
