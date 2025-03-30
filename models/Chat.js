import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema(
  {
    sender: String,
    receiver: String,
    chatroomId: String,
    messages: [{ text: String, timestamp: { type: Date, default: Date.now } }],
    lastMessage: String,
  },
  { timestamps: true }
);

const ChatRooms = mongoose.model("ChatRoom", ChatRoomSchema);

export default ChatRooms;