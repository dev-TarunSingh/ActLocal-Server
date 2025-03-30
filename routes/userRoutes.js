import express from "express";
import User from "../models/User.js"; // Ensure the User model is imported

const router = express.Router();

// Route to check username availability
router.get("/check-username/:username", async (req, res) => {
    try {
        console.log("checking username")
        const { username } = req.params;

        // Check if the username exists in the database
        const user = await User.findOne({ userName: username });

        if (user) {
            console.log("not available")
            return res.status(200).json({ available: false });
        }

        res.status(200).json({ available: true });
    } catch (error) {
        console.error("Error checking username:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router; // Use ES module export
