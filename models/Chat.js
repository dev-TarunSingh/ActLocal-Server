import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ], 
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, 
  },
  { timestamps: true }
);

// Ensure only one chatroom exists between the same two users (regardless of order)
// ChatRoomSchema.index({ participants: 1 }, { unique: false }); 

const ChatRooms = mongoose.model("ChatRoom", ChatRoomSchema);

export default ChatRooms;