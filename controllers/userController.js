import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;



export const signup = async (req, res) => {
  const { email, password, firstName, userName } = req.body;
  console.log(email, password, firstName);
  try {
    const searchUser = await User.findOne({ email });
    if (searchUser) {
      res.status(400).json({ message: "User already exists" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);
      const newUser = await User.create({
        email,
        password: hashedPassword,
        firstName,
        userName,
      });
      res
        .status(201)
        .json({ message: "User created successfully! Please Log In!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error signing up: " + error.message });
  }
};

export const login = async (req, res) => {
  console.log("in login function")
  const { userName, password } = req.body;
  try {
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("LoggedIn");
    res
      .status(200)
      .json({ message: "Logged in successfully", token, user: user });
  } catch (error) {
    res.status(500).send("Error logging in: " + error.message);
  }
};
