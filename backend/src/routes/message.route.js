import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getAllContacts, getChatPartners, getMessageById, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessageById);
router.post("/send/:id", sendMessage);

export default router;