import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        const contacts = await User.find(
            { _id: { $ne: userId } }
        ).select("-password");

        return res.status(200).json(contacts);
    } catch (error) {
        console.log("Error in getAllContacts:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessageById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: targetUserId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: targetUserId },
                { senderId: targetUserId, receiverId: userId }
            ]
        });

        return res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessageById:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { id: receiverId } = req.params;
        const { text, image } = req.body;

        if (!text && !image) {
            return res.status(400).json({ message: "Text or image can not be empty" });
        }
        if (senderId.equals(receiverId)) {
            return res.status(400).json({ message: "Cannot send messages to yourself." });
        }

        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver user not found." });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        // check if they are online, send realtime event
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getChatPartners = async (req, res) => {
    try {
        const userId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        });

        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) =>
                    msg.senderId.toString() === userId.toString()
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()
                )
            ),
        ];

        const chatPartners = await User.find(
            { _id: { $in: chatPartnerIds } }
        ).select("-password");

        return res.status(200).json(chatPartners);
    } catch (error) {
        console.log("Error in getChatPartners:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
