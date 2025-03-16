import mongoose from "mongoose";
import Chat from "../models/Chat.js";

export const sendMessage = async (req, res) => {
  const { sender, receiver, message } = req.body;
  try {
    const chatMessage = new Chat({ sender, receiver, message });
    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { sender, receiver } = req.query;
  try {
    const messages = await Chat.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getChatList = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const chatList = await Chat.aggregate([
        {
          $match: {
            $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { receiver: new mongoose.Types.ObjectId(userId) }]
          }
        },
        {
          $group: {
            _id: null,
            contacts: { $addToSet: { $cond: [{ $eq: ["$sender", new mongoose.Types.ObjectId(userId)] }, "$receiver", "$sender"] } }
          }
        },
        {
          $project: {
            _id: 0,
            contacts: 1
          }
        }
      ]);
  
      res.json(chatList.length > 0 ? chatList[0].contacts : []);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };