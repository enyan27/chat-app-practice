import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if (!newUser) {
            return res.status(400).json({ message: "Invalid user data" });
        }

        await newUser.save();
        generateToken(newUser._id, res);

        try {
            sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL);
        } catch (error) {
            console.log("Error sending welcome email:", error);
        }

        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });
    } catch (error) {
        console.log("Error in signup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid email or password" });

        generateToken(user._id, res);

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in signin:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (_, res) => {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully" });
}

export const updateProfile = async (req, res) => {
    const { profilePic } = req.body;

    try {
        if (!profilePic) return res.status(400).json({ message: "Profile picture is required" });

        const userId = req.user._id;

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        return res.status(200).json({ updatedUser });
    } catch (error) {
        console.log("Error in updateProfile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}