import { io } from "socket.io-client";

let socket = null;

export const initSocket = (userId) => {
  if (!userId) {
    console.warn("[Socket] No userId provided for socket initialization");
    return;
  }

  if (socket?.connected) {
    console.log("[Socket] Socket already connected");
    return;
  }

  console.log("[Socket] Initializing socket connection for user:", userId);

  socket = io("http://localhost:5001", {
    query: { userId },
    withCredentials: true,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected successfully");
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("[Socket] Reconnected after", attemptNumber, "attempts");
  });

  socket.on("reconnect_error", (error) => {
    console.error("[Socket] Reconnection error:", error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn("[Socket] Attempting to get socket before initialization");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("[Socket] Disconnecting socket");
    socket.disconnect();
    socket = null;
  }
};

