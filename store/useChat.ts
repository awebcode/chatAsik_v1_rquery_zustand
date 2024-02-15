// userStore.ts

import { create } from "zustand";


interface ChatData {
  chatId?: string;
  lastMessage?: string;
  createdAt?: Date;
  username?: string;
  email?: string;
  userId?: string;
  pic?: string;
  isGroupChat:boolean
}


interface UserStore {
  selectedChat: ChatData | null;
  setSelectedChat: (user: ChatData) => void;
  clearselectedChat: () => void;
}

export const useChatStore = create<UserStore>((set) => ({
  selectedChat: null,
  setSelectedChat: (user) => set({ selectedChat: user }),
  clearselectedChat: () => set({ selectedChat: null }),
}));
