import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set) => ({
    authUser: null,

    signUp: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });

            toast.success("Account created successfully!");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    signIn: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/signin", data);
            set({ authUser: res.data });

            toast.success("Signed in successfully!");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });

            toast.success("Logged out successfully!");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
}));