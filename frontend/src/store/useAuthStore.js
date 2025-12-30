import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,

    checkAuthUser: async () => {
        try {
            const res = await axiosInstance.get("/auth/me");
            set({ authUser: res.data });
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
    updateProfile: async (data) => {
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });

            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
}));