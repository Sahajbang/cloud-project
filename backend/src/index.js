import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import chatbotRoutes from "./routes/chatbot.route.js";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import taskRoutes from "./routes/task.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : true,
    credentials: true,
  })
);

// API routes
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/tasks", taskRoutes);

// health check
app.get("/api", (req, res) => {
  res.send("API is running");
});

// production setup
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});

// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import chatbotRoutes from "./routes/chatbot.route.js";

// import path from "path";

// import { connectDB } from "./lib/db.js";

// import authRoutes from "./routes/auth.route.js";
// import messageRoutes from "./routes/message.route.js";
// import groupRoutes from "./routes/group.route.js";
// import taskRoutes from "./routes/task.route.js";

// import { app, server } from "./lib/socket.js";

// dotenv.config();

// const PORT = process.env.PORT;
// const __dirname = path.resolve();

// app.use(express.json());
// app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.use("/api/chatbot", chatbotRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/groups", groupRoutes);
// app.use("/api/tasks", taskRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

// server.listen(PORT, () => {
//   console.log("server is running on PORT:" + PORT);
//   connectDB();
// });
