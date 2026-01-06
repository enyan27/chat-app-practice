import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ENV.CLIENT_URL,
        credentials: true,
    },
});

// apply auth middleware to all socket connections
io.use(socketAuthMiddleware);

// check if the user is online or not
export function getReceiverSocketId(userId) {
    return userSocketMap[userId]; // socketId or undefined
}

// this is for storing online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log(`${socket.user.fullName} has connected`);

    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    // send event from server
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // listen event from server
    socket.on("disconnect", () => {
        console.log(`${socket.user.fullName} has disconnected`);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, server, io };