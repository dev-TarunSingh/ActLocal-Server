const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

// Route to get all unique receivers for a given sender
router.get("/receivers/:senderId", async (req, res) => {
    try {
        const { senderId } = req.params;
        
        // Find all unique receivers where the sender is the current user
        const chatList = await Chat.find({ sender: senderId })
            .select("receiver chatroomId lastMessage -_id");

        res.json(chatList);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/chat/:chatroomId", async (req, res) => {
    try {
        const { chatroomId } = req.params;

        // Find the chatroom and return its messages
        const chat = await Chat.findOne({ chatroomId });

        if (!chat) {
            return res.status(404).json({ message: "No chat found" });
        }

        res.json(chat.messages);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
