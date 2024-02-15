// userStore.ts

import { create } from "zustand";

interface User {
  username: string;
  _id: string;
  pic: string;
  email: string;
}

interface UserStore {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  clearcurrentUser: () => void;
}

export const useUserStore = create<UserStore>((set) => {
  // Try to get user info from localStorage
  const storedUser =
    typeof window !== "undefined" && window.localStorage.getItem("userInfo");
  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  return {
    currentUser: initialUser,
    setCurrentUser: (user) => {
      // Save user info to localStorage
      localStorage.setItem("userInfo", JSON.stringify(user));
      set({ currentUser: user });
    },
    clearcurrentUser: () => {
      // Remove user info from localStorage
      localStorage.removeItem("userInfo");
      localStorage.removeItem("authToken");
      set({ currentUser: null });
    },
  };
});
