import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true },
    comment: { type: String },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }, // Linking review to booking
  },
  { timestamps: true }
);

const Reviews = mongoose.model("Reviews", reviewSchema);

export default Reviews;
