import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerService: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderService', required: true }, // Link to the specific service offered by the provider
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }, // Redundant but useful for queries
    date: { type: Date, required: true },
    time: { type: String, required: true }, // Or use a Date/Time field
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    totalPrice: { type: Number, required: true },
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review'}, // Linking review to booking
    paymentIntent: { type: String } // For Stripe or other payment gateways
  },{timestamps: true});


const Bookings = mongoose.model("Bookings", bookingSchema);

export default Bookings;
  