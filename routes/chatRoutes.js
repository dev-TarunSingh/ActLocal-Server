import express from 'express';
import ChatRooms from '../models/Chat.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all chatrooms a user is part of
router.get("/:userId", async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId); // Convert to ObjectId
    
        console.log(`Fetching chatrooms for user: ${userId}`);
    
        const foundchatrooms = await ChatRooms.find({ participants: userId })
          .populate("participants", "firstName") // Populate user names
          .sort({ updatedAt: -1 }); // Sort by last activity

        const chatroomsWithLastMessage = await Promise.all(
          foundchatrooms.map(async (chatroom) => {
            const lastMessage = await Message.findOne({ chatroomId: chatroom._id })
              .sort({ createdAt: -1 })
              .populate("sender", "name"); // Populate sender name

            // Filter out the requesting user's firstName from participants
            const otherParticipants = chatroom.participants.filter(
              (participant) => !participant._id.equals(userId)
            );

            return {
              ...chatroom.toObject(),
              participants: otherParticipants, // Include only other participants
              lastMessage: lastMessage || null, // Include last message or null if none
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
    const messages = await Message.find({ chatroomId: req.params.chatroomId }).populate("sender", "name");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start or Join a Chatroom
router.post("/chatrooms", async (req, res) => {
  console.log("Chatroom request received:", req.body);

  const { user1, user2 } = req.body;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Both user1 and user2 are required" });
  }

  try {
    // Check for an existing chatroom with the same participants
    let chatroom = await ChatRooms.findOne({
      participants: { $all: [user1, user2] },
    });

    console.log("Chatroom found:", chatroom);

    if (!chatroom) {
      chatroom = new ChatRooms({ participants: [user1, user2] });
      await chatroom.save();
      console.log("New chatroom created:", chatroom._id);
    } 
    else {
      console.log("Existing chatroom found:", chatroom._id);
    }
    res.status(200).json({ chatroomId: chatroom._id });
  } catch (error) {
    console.error("Error creating or fetching chatroom:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
