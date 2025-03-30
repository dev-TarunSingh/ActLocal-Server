import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chatroomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true }, // Chatroom reference
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Message sender
    text: { type: String, required: true }, // Text message content
    timestamp: { type: Date, default: Date.now }, // Message timestamp
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who read the message
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;
