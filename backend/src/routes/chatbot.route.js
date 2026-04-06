import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAiMessages, sendAiMessage } from "../controllers/aiMessage.controller.js";

const router = express.Router();

// Get AI chat history
router.get("/", protectRoute, getAiMessages);

// Send a new message and receive AI reply
router.post("/", protectRoute, sendAiMessage);

export default router;




