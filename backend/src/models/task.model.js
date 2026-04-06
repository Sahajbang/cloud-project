import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    done: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String, // e.g., "28th May 2025"
    },
    time: {
      type: String, // e.g., "12:30 PM"
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
