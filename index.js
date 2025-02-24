import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { signup, login } from './controllers/userController.js';
import { AddService, RemoveServices, MyServices, NearbyServices } from './controllers/ServiceController.js';

const app = express();
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

// Example route for user signup
app.post('/signup', signup);

// Example route for user login
app.post('/login', login);

app.post('/services', AddService);

app.get('/services/nearby', NearbyServices);

app.delete('/services', RemoveServices);

app.get('/services', MyServices);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});