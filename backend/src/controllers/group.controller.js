import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

// GET group messages by group ID
export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;

    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "fullName profilePic") // populate sender details
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST a message to a group
export const sendGroupMessage = async (req, res) => {
  try {
    console.log("sendGroupMessage function triggered");
    const { text, image } = req.body;
    const { id: groupId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newGroupMessage = new GroupMessage({
      groupId,
      senderId,
      text,
      image: imageUrl,
    });

    await newGroupMessage.save();

    const populatedMessage = await GroupMessage.findById(newGroupMessage._id).populate(
      "senderId",
      "fullName profilePic"
    );
    console.log("Populated message:", populatedMessage);

    // Emit to all group members using socket.io namespace for groups
    io.to(groupId).emit("newGroupMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET groups for a user (for Sidebar)
export const getGroupsForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId }).select("name members");

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroupsForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ADD a member to a group
export const addGroupMember = async (req, res) => {
  const { groupId, userIdToAdd } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(userIdToAdd)) {
      return res.status(400).json({ message: "User already in group" });
    }

    group.members.push(userIdToAdd);
    await group.save();
    res.status(200).json({ message: "Member added", group });
  } catch (error) {
    console.error("Error in addGroupMember:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// REMOVE a member from a group
export const removeGroupMember = async (req, res) => {
  const { groupId, userIdToRemove } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(userIdToRemove)) {
      return res.status(400).json({ message: "User not in group" });
    }

    group.members = group.members.filter(id => id.toString() !== userIdToRemove);
    await group.save();
    res.status(200).json({ message: "Member removed", group });
  } catch (error) {
    console.error("Error in removeGroupMember:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};