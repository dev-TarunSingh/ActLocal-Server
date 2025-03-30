import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ], // Only 2 users per chatroom
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // Last message reference
  },
  { timestamps: true }
);

// Ensure only one chatroom exists between the same two users (regardless of order)
ChatRoomSchema.index({ participants: 1 }, { unique: false }); // Remove the incorrect unique index
ChatRoomSchema.index({ participants: 1, participants: -1 }, { unique: true }); // Compound index for unordered uniqueness

const ChatRooms = mongoose.model("ChatRoom", ChatRoomSchema);

export default ChatRooms;