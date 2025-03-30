import express from "express";
import Chat from "../models/Chat.js";
import Chat from "../models/Chat.js"; // Ensure ChatRoom schema is imported

const router = express.Router();

// Route to get all chat rooms where the user is the sender
router.get("/sender/:userId", async (req, res) => {
    try {
        console.log("got request to get chat rooms");
        const { userId } = req.params;

        // Find all chat rooms where the sender is the current user
        const chatRooms = await ChatRoom.find({ sender: userId });

        if (!chatRooms) {
            return res.status(404).json({ error: "No chat rooms found" });
        }

        res.json(chatRooms);
    } catch (error) {
        console.error("Error fetching chat rooms:", error);
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

export default router; // Use ES module export
