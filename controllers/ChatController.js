export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all chat rooms where the user is involved
    const chatRooms = await Chat.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { timestamp: -1 }, // Sort messages by latest
      },
      {
        $group: {
          _id: "$chatRoom",
          lastMessage: { $first: "$message" },
          lastTimestamp: { $first: "$timestamp" },
          sender: { $first: "$sender" },
          receiver: { $first: "$receiver" },
        },
      },
      { $sort: { lastTimestamp: -1 } }, // Sort chats by most recent message
    ]);

    res.json(chatRooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
