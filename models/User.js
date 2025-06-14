import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userName: { type: String, required: true, unique: true },
  password: { type: String},
  phone: { type: String },
  postCount: { type: Number, default: 0},
  address: { type: String },
  profilePicture: { type: String, default: "https://actlocal-server.onrender.com/avatars/1.svg" },
  bio: { type: String },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  rating: { type: Number, default: 0 },
  resetPasswordToken: {type: String},
  resetPasswordExpires: {type: Date},
  isVerified: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

export default User;
