import { create } from "zustand";

export const useAuthStore = create((set) => ({
    authUser: { fullName: "John Doe", email: "john.doe@example.com" },

    isLoggedIn: false,
    setLogin: () => {
        set((state) => ({ isLoggedIn: !state.isLoggedIn }));
    }
}));