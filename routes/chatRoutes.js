import express from "express";
import ChatRooms from "../models/Chat.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

const router = express.Router();

// Get all chatrooms a user is part of
router.get("/:userId", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    console.log(`Fetching chatrooms for user: ${userId}`);

    const foundchatrooms = await ChatRooms.find({ participants: userId })
      .populate("participants", "firstName")
      .sort({ updatedAt: -1 });

    const chatroomsWithLastMessage = await Promise.all(
      foundchatrooms.map(async (chatroom) => {
        const lastMessage = await Message.findOne({ chatroomId: chatroom._id })
          .sort({ createdAt: -1 })
          .populate("sender", "name");

        const otherParticipants = chatroom.participants.filter(
          (participant) => !participant._id.equals(userId)
        );

        return {
          ...chatroom.toObject(),
          participants: otherParticipants,
          lastMessage: lastMessage || "Start a conversation",
        };
      })
    );

    if (chatroomsWithLastMessage.length === 0) {
      console.log("No chatrooms found for this user.");
      res.json([]);
    } else {
      console.log("Chatrooms found:", chatroomsWithLastMessage);
      res.json(chatroomsWithLastMessage);
    }
  } catch (err) {
    console.error("Error fetching chatrooms:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get messages from a chatroom
router.get("/messages/:chatroomId", async (req, res) => {
  try {
    const messages = await Message.find({
      chatroomId: req.params.chatroomId,
    }).populate("sender", "firstName");

    console.log("Messages sent by server:", messages); // Debugging log to check the array

    if (!messages || messages.length === 0) {
      console.error("No messages found for chatroom:", req.params.chatroomId);
    }
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start or Join a Chatroom
router.post("/chatrooms", async (req, res) => {
  const { user1, user2 } = req.body;

  const user1Id = new mongoose.Types.ObjectId(user1);
  const user2Id = new mongoose.Types.ObjectId(user2);

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Both user1 and user2 are required" });
  }

  try {
    const chatroom = await ChatRooms.findOne({
      participants: { $all: [user1Id, user2Id], $size: 2 }
    });
    

    console.log("Chatroom found:", chatroom);

    if (!chatroom) {
      const chatroom = new ChatRooms({ participants: [user1Id, user2Id] });
      await chatroom.save();
    } else {
      console.log("Existing chatroom found:", chatroom._id);
    }

    res.status(200).json({ chatroomId: chatroom._id });
  } catch (error) {
    console.error("Error creating or fetching chatroom:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
