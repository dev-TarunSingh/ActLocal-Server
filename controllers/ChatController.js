import ChatRoom from "../models/ChatRoom.js"; 
import Message from "../models/Message.js";

const getUserChatRooms = async (userId) => {
  return await ChatRoom.find({ participants: userId })
    .populate("participants", "name") // Load participant details
    .populate("lastMessage"); // Show last message
};

const startChat = async (user1, user2) => {
  let chatroom = await ChatRoom.findOne({
    participants: { $all: [user1, user2] },
  });

  if (!chatroom) {
    chatroom = new ChatRoom({ participants: [user1, user2] });
    await chatroom.save();
  }

  return chatroom;
};

const getChatMessages = async (chatroomId) => {
  return await Message.find({ chatroomId }).populate("sender", "name");
};

export { getUserChatRooms, startChat, getChatMessages };