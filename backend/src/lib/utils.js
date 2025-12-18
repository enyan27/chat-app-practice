import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
    const { JWT_SECRET, NODE_ENV } = ENV;
    if (!JWT_SECRET || !NODE_ENV) throw new Error("JWT_SECRET or NODE_ENV is not set");

    const token = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: "strict",
        secure: NODE_ENV === "production" ? true : false
    });

    return token;
}