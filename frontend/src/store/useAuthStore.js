import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    socket: null,
    onlineUsers: [],

    checkAuthUser: async () => {
        try {
            const res = await axiosInstance.get("/auth/me");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log(error.response.data.message);
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    signUp: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/signup", data);

            set({ authUser: res.data });
            toast.success("Account created successfully!");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    signIn: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/signin", data);

            set({ authUser: res.data });
            toast.success("Signed in successfully!");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");

            set({ authUser: null });
            toast.success("Logged out successfully!");

            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    updateProfile: async (data) => {
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });

            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            withCredentials: true,
        });

        socket.connect();
        set({ socket });

        // listen for online users event
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },
    disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) socket.disconnect();
    },
}));