import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import { Server } from "socket.io";
import cors from 'cors';
import http from 'http';
import { signup, login } from './controllers/userController.js';
import { AddService, NearbyServices, RemoveServices, MyServices } from './controllers/ServiceController.js';
import userRoutes from './routes/userRoutes.js'; // Import the default export
import chatRoutes from './routes/chatRoutes.js'; // Import the default export
import ChatRooms from './models/Chat.js';
import Message from './models/Message.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
});

const onlineUsers = new Map();

app.use(cors()); 
app.use(express.json());
const PORT = process.env.PORT;

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 30000
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
  console.error('Error details:', err);
  if (err.name === 'MongooseServerSelectionError') {
    console.error('Ensure your MongoDB URI is correct and accessible.');
  }
});



app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.post('/signup', signup);
app.post('/login', login);
app.post('/services', AddService);
app.post('/services/nearby', NearbyServices);
app.delete('/services', RemoveServices);
app.get('/services/my-services', MyServices);


io.on("join", (userId) => {
  onlineUsers.set(userId, socket.id);
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When a user joins, store them in onlineUsers
  socket.on("join", async (userId) => {
    onlineUsers.set(userId, socket.id);

    // Fetch all chatrooms the user is in
    const chatrooms = await ChatRooms.find({ participants: userId });

    for (const chatroom of chatrooms) {
      // Fetch all unread messages (not seen by user)
      const messages = await Message.find({
        chatroomId: chatroom._id,
        readBy: { $ne: userId }, // Messages not yet read by the user
      }).populate("sender", "name");

      // Send unread messages to the user
      if (messages.length > 0) {
        io.to(socket.id).emit("missedMessages", { chatroomId: chatroom._id, messages });
      }
    }
  });

  // When a user sends a message
  socket.on("sendMessage", async ({ chatroomId, sender, text }) => {
    const message = new Message({ chatroomId, sender, text });
    await message.save();

    // Update last message in chatroom
    await ChatRooms.findByIdAndUpdate(chatroomId, { lastMessage: message._id });

    // Notify other participant
    const chatroom = await ChatRooms.findById(chatroomId).populate("participants");
    const recipient = chatroom.participants.find((user) => user._id.toString() !== sender);

    if (recipient && onlineUsers.has(recipient._id.toString())) {
      io.to(onlineUsers.get(recipient._id.toString())).emit("newMessage", message);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});