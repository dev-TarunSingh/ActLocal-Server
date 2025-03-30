import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  profilePicture: { type: String },
  bio: { type: String },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  rating: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

export default User;
