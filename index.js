import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import mongoose from 'mongoose';
import { Server } from "socket.io";
import cors from 'cors';
import http from 'http';
import { signup, login } from './controllers/userController.js';
import { AddService, RemoveServices, MyServices, NearbyServices } from './controllers/ServiceController.js';
import { sendMessage, getMessages, getChatList } from './controllers/ChatController.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Change for production
  },
});
app.use(cors()); // Ensure CORS is enabled
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

app.post('/chat/send', sendMessage);
app.get('/chat/messages', getMessages);
app.get('/chat/list', getChatList);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on("sendMessage", async (messageData) => {
    try {
      const { sender, receiver, message } = messageData;
      console.log("Message data:", messageData);
      
      const chatMessage = new Chat({ sender, receiver, message });
      await chatMessage.save();

      io.to(receiver).to(sender).emit("receiveMessage", chatMessage);
      
      console.log("Message sent:", chatMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});