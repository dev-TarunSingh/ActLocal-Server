import express from "express";
import User from "../models/User.js";
import Service from "../models/Services.js"; // Import the Services model
import crypto from "crypto";
import bcrypt from "bcryptjs";
const router = express.Router();

router.post("/forgot-credentials", async (req, res) => {
  console.log("Oops Someone Forgot Their Credentials");
  const email = req.body.email;
  console.log("And That Stupid Guy is:", email);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Generate token (random string)
    const token = crypto.randomBytes(32).toString("hex");

    // Save token and expiry (e.g., 1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    res.status(200).json({ message: "Password reset email sent.", token });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  console.log("Reset Password request received.");
  console.log("Token:", token);

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Invalid or missing token." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear reset token and expiry
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    const username = user.userName;

    await user.save();
    console.log("Password reset successful for user:", user.email);

    res.status(200).json({
      message:
        "Password reset successful. You can now log in with Your username.",
      username,
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Route to check username availability
router.get("/check-username/:username", async (req, res) => {
  try {
    console.log("checking username");
    const { username } = req.params;

    // Check if the username exists in the database
    const user = await User.findOne({ userName: username });

    if (user) {
      console.log("not available");
      return res.status(200).json({ available: false });
    }

    res.status(200).json({ available: true });
  } catch (error) {
    console.error("Error checking username:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  console.log("Updating user profile for ID:", req.params.id);
  try {
    const updatedData = req.body;

    // Validate phone length if sent
    if (updatedData.phone && updatedData.phone.length !== 10) {
      return res.status(400).json({ error: "Phone number must be 10 digits." });
    }

    console.log("Updating");

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true }
    );

    console.log("Updated user:", updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/save-token", async (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) return res.status(400).json({ error: "Missing data" });

  try {
    await User.findByIdAndUpdate(userId, { expoPushToken: token });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/profile", async (req, res) => {
  const { id } = req.body;

  try {
    // Fetch user with selected fields only
    const user = await User.findById(id).select(
      "-password -email -phone -address -resetPasswordToken -resetPasswordExpires"
    );
    console.log("Fetched user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Service.find({ postedBy: id });

    return res.status(200).json({
      message: "Profile fetched successfully",
      profile: user,
      posts: posts,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
