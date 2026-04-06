import { Server } from "socket.io";
import http from "http";
import express from "express";
import GroupMessage from "../models/groupMessage.model.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true
  },
});

const userSocketMap = {}; // Maps userId to socketId

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("✅ A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (!userId) {
    console.warn("❌ No userId provided in socket handshake.");
    return;
  }

  // Save the mapping
  userSocketMap[userId] = socket.id;

  // Broadcast online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle direct messages
  socket.on("sendMessage", (message) => {
    console.log("📨 New message received:", message);
    const receiverSocketId = userSocketMap[message.receiverId];
    const senderSocketId = userSocketMap[message.senderId];

    // Send to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }
    
    // Also send back to sender for multi-tab/window sync
    if (senderSocketId && senderSocketId !== socket.id) {
      io.to(senderSocketId).emit("newMessage", message);
    }
  });

  // Handle group messages
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`👥 User ${userId} joined group ${groupId}`);
  });

  socket.on("sendGroupMessage", async (data) => {
    console.log("📨 New group message:", data);
    try {
      // Save the message to database and populate sender details
      const message = new GroupMessage({
        groupId: data.groupId,
        senderId: userId,
        text: data.message.text,
        image: data.message.image,
      });
      
      await message.save();
      const populatedMessage = await message.populate("senderId", "fullName profilePic");
      
      // Broadcast the populated message to the group
      io.to(data.groupId).emit("newGroupMessage", {
        groupId: data.groupId,
        message: populatedMessage
      });
    } catch (error) {
      console.error("Error handling group message:", error);
      socket.emit("error", { message: "Failed to send group message" });
    }
  });

  // WebRTC handlers
  socket.on("call:offer", ({ to, offer }) => {
    const targetSocketId = getReceiverSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call:incoming", {
        from: userId,
        offer,
      });
    }
  });

  socket.on("call:answer", ({ to, answer }) => {
    const targetSocketId = getReceiverSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call:accepted", {
        from: userId,
        answer,
      });
    }
  });

  socket.on("call:ice-candidate", ({ to, candidate }) => {
    const targetSocketId = getReceiverSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call:ice-candidate", {
        from: userId,
        candidate,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("🚪 A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };

// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173"],
//     credentials: true
//   },
// });

// const userSocketMap = {}; // Maps userId to socketId

// export function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// io.on("connection", (socket) => {
//   console.log("✅ A user connected", socket.id);

//   const userId = socket.handshake.query.userId;
//   if (!userId) {
//     console.warn("❌ No userId provided in socket handshake.");
//     return;
//   }

//   // Save the mapping
//   userSocketMap[userId] = socket.id;

//   // Notify all clients about currently online users
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   // ✅ Join group room
//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId);
//     console.log(`👥 User ${userId} joined group ${groupId}`);
//   });

//   // ✅ Group message handler
//   socket.on("sendGroupMessage", ({ groupId, message }) => {
//     socket.to(groupId).emit("newGroupMessage", message);
//   });

//   // ✅ WebRTC: Send Offer to Callee
//   socket.on("call-user", ({ to, offer }) => {
//     const targetSocketId = getReceiverSocketId(to);
//     if (targetSocketId) {
//       io.to(targetSocketId).emit("incoming-call", {
//         from: userId,
//         offer,
//       });
//       console.log(`📞 ${userId} is calling ${to}`);
//     }
//   });

//   // ✅ WebRTC: Send Answer to Caller
//   socket.on("call-accepted", ({ to, answer }) => {
//     const targetSocketId = getReceiverSocketId(to);
//     if (targetSocketId) {
//       io.to(targetSocketId).emit("call-accepted", {
//         from: userId,
//         answer,
//       });
//       console.log(`✅ ${userId} accepted call from ${to}`);
//     }
//   });

//   // ✅ WebRTC: ICE Candidate relay
//   socket.on("ice-candidate", ({ to, candidate }) => {
//     const targetSocketId = getReceiverSocketId(to);
//     if (targetSocketId) {
//       io.to(targetSocketId).emit("ice-candidate", {
//         from: userId,
//         candidate,
//       });
//       console.log(`❄️ ICE candidate sent from ${userId} to ${to}`);
//     }
//   });

//   // ✅ Handle disconnection
//   socket.on("disconnect", () => {
//     console.log("🚪 A user disconnected", socket.id);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// export { io, app, server };


//============ Working socket.js before video calling functionality =======================

// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173"],
//   },
// });

// const userSocketMap = {}; // For one-to-one communication

// export function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);

//   const userId = socket.handshake.query.userId;
//   if (userId) userSocketMap[userId] = socket.id;

//   // Send updated online users to everyone
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   // ✅ Join group rooms sent by client
//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId);
//     console.log(`User ${userId} joined group ${groupId}`);
//   });

//   // ✅ Handle group messages
//   socket.on("sendGroupMessage", ({ groupId, message }) => {
//     // Emit to all members in the group room (except sender)
//     socket.to(groupId).emit("newGroupMessage", message);
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.id);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// export { io, app, server };


// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173"],
//   },
// });

// export function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// // used to store online users
// const userSocketMap = {}; 

// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);

//   const userId = socket.handshake.query.userId;
//   if (userId) userSocketMap[userId] = socket.id;

//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.id);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// export { io, app, server };
