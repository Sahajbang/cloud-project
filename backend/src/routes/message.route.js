import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";
import Message from "../models/message.model.js";
import { io } from "../lib/socket.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

// Edit a message
router.put("/:messageId", protectRoute, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if the user is the sender of the message
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only edit your own messages" });
        }

        message.text = text;
        await message.save();

        // Emit message update event
        io.emit("messageUpdate", {
            messageId,
            text,
        });

        res.status(200).json(message);
    } catch (err) {
        res.status(500).json({ message: "Failed to edit message" });
    }
});

// Delete a message
router.delete("/:messageId", protectRoute, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if the user is the sender of the message
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        await Message.findByIdAndDelete(messageId);

        // Emit message deletion event
        io.emit("messageDelete", {
            messageId,
        });

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete message" });
    }
});

export default router;