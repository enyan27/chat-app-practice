import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    allContacts: [],
    allChats: [],
    allMessages: [],
    activeTab: "chats",
    selectedUser: null,
    isLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) || false,

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
        set({ isSoundEnabled: !get().isSoundEnabled });
    },
    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (user) => set({ selectedUser: user }),

    getAllContacts: async () => {
        try {
            set({ isLoading: true });
            const res = await axiosInstance.get("/messages/contacts");
            set({ allContacts: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoading: false });
        }
    },
    getAllChats: async () => {
        try {
            set({ isLoading: true });
            const res = await axiosInstance.get("/messages/chats");
            set({ allChats: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoading: false });
        }
    },
    getMessagesByUserId: async (userId) => {
        try {
            set({ isLoading: true });
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ allMessages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoading: false });
        }
    },

    sendMessage: async (data) => {
        const { selectedUser, allMessages } = get();
        const { authUser } = useAuthStore.getState();

        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: data.text,
            image: data.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true, // flag
        };

        // immediately update the UI before server response
        set({ allMessages: [...allMessages, optimisticMessage] });

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, data);

            set({ allMessages: [...allMessages, res.data] });
        } catch (error) {
            set({ allMessages: allMessages })
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }
}));