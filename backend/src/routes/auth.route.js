import express from "express";
import { getAllUser, logout, signIn, signUp, updateProfile } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { arcjetMiddleware } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// router.use(arcjetMiddleware);

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/logout", logout);
router.post("/update-profile", authMiddleware, updateProfile);

router.get("/all", getAllUser);

export default router;
