import express from "express";
import Group from "../models/groups.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

const router = express.Router();

// ✅ Create a new group
router.post("/create", protectRoute, async (req, res) => {
  const { name, memberIds, groupPic } = req.body;

  if (!name || !Array.isArray(memberIds)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const group = new Group({ name, members: memberIds, groupPic });
    await group.save();
    res.status(201).json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get groups for logged-in user
router.get("/", protectRoute, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "fullName profilePic")
      .select("name members groupPic createdAt updatedAt");
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch groups" });
  }
});

// ✅ Get all messages of a group
router.get("/:groupId/messages", protectRoute, async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load group messages" });
  }
});

// ✅ Send a message to a group (with image support + real-time emit)
router.post("/:groupId/messages", protectRoute, async (req, res) => {
  const { text, image } = req.body;
  const { groupId } = req.params;
  const senderId = req.user._id;

  if (!text && !image) {
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const message = new GroupMessage({
      groupId,
      senderId,
      text,
      image: imageUrl,
    });

    await message.save();
    const populatedMessage = await message.populate("senderId", "fullName profilePic");

    // Broadcast the message to all connected users in the group
    io.emit("newGroupMessage", {
      groupId,
      message: populatedMessage,
    });

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: "Failed to send group message" });
  }
});

// ✅ Add a member to a group
router.put("/add-member", protectRoute, async (req, res) => {
  const { groupId, userIdToAdd } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(userIdToAdd)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push(userIdToAdd);
    await group.save();
    res.status(200).json({ message: "Member added successfully", group });
  } catch (err) {
    res.status(500).json({ message: "Failed to add member" });
  }
});

// ✅ Remove a member from a group
router.put("/remove-member", protectRoute, async (req, res) => {
  const { groupId, userIdToRemove } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userIdToRemove)) {
      return res.status(400).json({ message: "User is not a member" });
    }

    group.members = group.members.filter(id => id.toString() !== userIdToRemove);
    await group.save();
    res.status(200).json({ message: "Member removed successfully", group });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove member" });
  }
});

router.put("/:id", protectRoute, async (req, res) => {
  const { id } = req.params;
  const { name, memberIds, groupPic } = req.body;

  if (!name || !Array.isArray(memberIds)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.name = name;
    group.members = memberIds;
    group.groupPic = groupPic;
    await group.save();

    res.status(200).json({ success: true, message: "Group updated", group });
  } catch (err) {
    res.status(500).json({ message: "Failed to update group" });
  }
});

// ✅ Delete a group
router.delete("/:id", protectRoute, async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Delete all messages associated with this group
    await GroupMessage.deleteMany({ groupId: id });

    // Delete the group
    await Group.findByIdAndDelete(id);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ message: "Failed to delete group" });
  }
});

// Edit a group message
router.put("/messages/:messageId", protectRoute, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.text = text;
    await message.save();

    const updatedMessage = await message.populate("senderId", "fullName profilePic");

    // Emit message update event
    io.emit("groupMessageUpdate", {
      messageId,
      groupId: message.groupId,
      message: updatedMessage,
    });

    res.status(200).json(updatedMessage);
  } catch (err) {
    res.status(500).json({ message: "Failed to edit message" });
  }
});

// Delete a group message
router.delete("/messages/:messageId", protectRoute, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    const groupId = message.groupId;
    await GroupMessage.findByIdAndDelete(messageId);

    // Emit message deletion event
    io.emit("groupMessageDelete", {
      messageId,
      groupId,
    });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete message" });
  }
});

export default router;


// Working group.route.js without add members and remove members functionality.

// import express from "express";
// import Group from "../models/groups.model.js";
// import GroupMessage from "../models/groupMessage.model.js";
// import { protectRoute } from "../middleware/auth.middleware.js";
// import { io } from "../lib/socket.js";
// import cloudinary from "../lib/cloudinary.js";

// const router = express.Router();

// // ✅ Create a new group
// router.post("/create", protectRoute, async (req, res) => {
//   const { name, memberIds } = req.body;

//   if (!name || !Array.isArray(memberIds)) {
//     return res.status(400).json({ message: "Invalid input" });
//   }

//   try {
//     const group = new Group({ name, members: memberIds });
//     await group.save();
//     res.status(201).json({ success: true, group });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ✅ Get groups for logged-in user
// router.get("/", protectRoute, async (req, res) => {
//   try {
//     const groups = await Group.find({ members: req.user._id })
//       .populate("members", "fullName profilePic");
//     res.status(200).json(groups);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch groups" });
//   }
// });

// // ✅ Get all messages of a group
// router.get("/:groupId/messages", protectRoute, async (req, res) => {
//   const { groupId } = req.params;

//   try {
//     const messages = await GroupMessage.find({ groupId })
//       .populate("senderId", "fullName profilePic")
//       .sort({ createdAt: 1 });

//     res.status(200).json(messages);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to load group messages" });
//   }
// });

// // ✅ Send a message to a group (with image support + real-time emit)
// router.post("/:groupId/messages", protectRoute, async (req, res) => {
//   const { text, image } = req.body;
//   const { groupId } = req.params;
//   const senderId = req.user._id;

//   if (!text && !image) {
//     return res.status(400).json({ message: "Message content is required" });
//   }

//   try {
//     let imageUrl;
//     if (image) {
//       const uploadResponse = await cloudinary.uploader.upload(image);
//       imageUrl = uploadResponse.secure_url;
//     }

//     const message = new GroupMessage({
//       groupId,
//       senderId,
//       text,
//       image: imageUrl,
//     });

//     await message.save();
//     const populatedMessage = await message.populate("senderId", "fullName profilePic");

//     // Broadcast the message to all connected users in the group
//     io.emit("newGroupMessage", {
//       groupId,
//       message: populatedMessage,
//     });

//     res.status(201).json(populatedMessage);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to send group message" });
//   }
// });

// export default router;

//====================================================================

// import express from "express";
// import Group from "../models/groups.model.js";
// import Message from "../models/message.model.js"; // ✅ Message model
// import { protectRoute } from "../middleware/auth.middleware.js"; // ✅ Auth middleware

// const router = express.Router();

// // ✅ Create a new group
// // POST /api/groups/create
// router.post("/create", protectRoute, async (req, res) => {
//   const { name, memberIds } = req.body;

//   if (!name || !Array.isArray(memberIds)) {
//     return res.status(400).json({ message: "Invalid input" });
//   }

//   try {
//     const group = new Group({ name, members: memberIds });
//     await group.save();
//     res.status(201).json({ success: true, group });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ✅ Get all groups with member details
// // GET /api/groups
// router.get("/", protectRoute, async (req, res) => {
//   try {
//     const groups = await Group.find({
//       members: req.user._id, // Only return groups the user is part of
//     }).populate("members", "fullName profilePic");

//     res.status(200).json(groups);
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ✅ Get messages for a specific group
// // GET /api/groups/:groupId/messages
// router.get("/:groupId/messages", protectRoute, async (req, res) => {
//   const { groupId } = req.params;

//   try {
//     const messages = await Message.find({ group: groupId })
//       .populate("sender", "fullName profilePic")
//       .sort({ createdAt: 1 });

//     res.status(200).json(messages);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to load group messages" });
//   }
// });

// // ✅ Send a message in a group
// // POST /api/groups/:groupId/messages
// router.post("/:groupId/messages", protectRoute, async (req, res) => {
//   const { text, image } = req.body;
//   const { groupId } = req.params;
//   const senderId = req.user._id;

//   if (!text && !image) {
//     return res.status(400).json({ message: "Message content is required" });
//   }

//   try {
//     const newMessage = new Message({
//       text,
//       image,
//       senderId,    // ✅ correct field name
//       groupId,     // ✅ correct field name
//     });

//     await newMessage.save();
//     console.log("Message Sent");
//     console.log("Saved message:", newMessage);

//     const populatedMessage = await newMessage.populate("senderId", "fullName profilePic");

//     res.status(201).json(populatedMessage);
//   } catch (error) {
//     console.error("Failed to send group message:", error.message);
//     res.status(500).json({ message: "Failed to send group message" });
//   }
// });

// export default router;




// import express from "express";
// import { createGroup } from "../controllers/group.controller.js";
// import Group from "../models/groups.model.js";

// const router = express.Router();

// // POST /api/groups/create
// router.post("/create", async (req, res) => {
//   const { name, memberIds } = req.body;

//   if (!name || !Array.isArray(memberIds)) {
//     return res.status(400).json({ message: "Invalid input" });
//   }

//   try {
//     const group = new Group({ name, members: memberIds });
//     await group.save();
//     res.status(201).json({ success: true, group });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Optional: GET all groups
// router.get("/", async (req, res) => {
//   try {
//     const groups = await Group.find().populate("members", "name");
//     res.json(groups);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch groups" });
//   }
// });

// export default router;

// import express from "express";
// import Group from "../models/groups.model.js";

// const router = express.Router();

// // POST /api/groups/create
// router.post("/create", async (req, res) => {
//   const { name, memberIds } = req.body;

//   if (!name || !Array.isArray(memberIds)) {
//     return res.status(400).json({ message: "Invalid input" });
//   }

//   try {
//     const group = new Group({ name, members: memberIds });
//     await group.save();
//     res.status(201).json({ success: true, group });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // GET /api/groups
// router.get("/", async (req, res) => {
//   try {
//     const groups = await Group.find().populate("members", "fullName profilePic");
//     res.status(200).json(groups);
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });


// export default router;
