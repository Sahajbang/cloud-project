import express from "express";
import Task from "../models/task.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🧾 GET all tasks for logged-in user
router.get("/", protectRoute, async (req, res) => {
  try {
    console.log("📥 GET /api/tasks - user:", req.user._id);
    const tasks = await Task.find({ userId: req.user._id }).sort("-createdAt");
    res.json(tasks);
  } catch (err) {
    console.error("❌ Failed to get tasks:", err.message);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ➕ POST create a new task
router.post("/", protectRoute, async (req, res) => {
  try {
    const { text, date, time } = req.body;
    console.log("📝 POST /api/tasks - data:", { text, date, time });

    const newTask = new Task({
      userId: req.user._id,
      text,
      date,
      time,
    });

    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Failed to create task:", err.message);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// ✏️ PUT update an existing task
router.put("/:id", protectRoute, async (req, res) => {
  try {
    const { text, date, time, done } = req.body;
    console.log("✏️ PUT /api/tasks/:id - id:", req.params.id, "data:", req.body);

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { text, date, time, done },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("❌ Failed to update task:", err.message);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// ❌ DELETE a task
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    console.log("🗑️ DELETE /api/tasks/:id - id:", req.params.id);

    const result = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!result) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(204).end();
  } catch (err) {
    console.error("❌ Failed to delete task:", err.message);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;

