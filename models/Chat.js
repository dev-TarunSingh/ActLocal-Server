import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    sender: String,
    receiver: String,
    chatroomId: String,
    messages: [{ text: String, timestamp: { type: Date, default: Date.now } }],
    lastMessage: String,
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;