import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import { Server } from "socket.io";
import cors from 'cors';
import http from 'http';
import { signup, login } from './controllers/userController.js';
import  Chat  from './models/Chat.js';
import { AddService, NearbyServices, RemoveServices, MyServices } from './controllers/ServiceController.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
});
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

app.post('/signup', signup);
app.post('/login', login);
app.post('/services', AddService);
app.post('/services/nearby', NearbyServices);
app.delete('/services', RemoveServices);
app.get('/services/my-services', MyServices);
app.get('/chats', async (req, res) => {
  const chats = await Chat.find();
  res.json(chats);
});
app.get("/chat/:chatroomid", async (req, res) => {
  try {
    const { chatroomid } = req.params;
    const chat = await Chat.findById({chatroomid});
    if (!chat) {
      return res.status(404).json({ message: "No chat found" });
    } 
    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const messages = await Chat.find({}, "messages"); // Fetch all messages
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");

  // Join a chatroom
  socket.on("joinRoom", ({ chatroomId }) => {
      socket.join(chatroomId);
      console.log(`User joined chatroom: ${chatroomId}`);
  });

  // Handle incoming messages
  socket.on("sendMessage", async ({ chatroomId, sender, receiver, text }) => {
      const newMessage = { text, timestamp: new Date() };

      // Update chat in the database
      let chat = await Chat.findOne({ chatroomId });

      if (!chat) {
          chat = new Chat({ sender, receiver, chatroomId, messages: [newMessage], lastMessage: text });
      } else {
          chat.messages.push(newMessage);
          chat.lastMessage = text;
      }
      await chat.save();

      // Emit message to the chatroom
      io.to(chatroomId).emit("newMessage", newMessage);
  });

  socket.on("disconnect", () => {
      console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});