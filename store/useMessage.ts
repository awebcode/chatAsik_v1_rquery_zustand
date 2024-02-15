import { Tuser } from "@/app/(chat)/conponents/UserCard";
import { create } from "zustand";

type Message = {
  content: string;
  status: string;
  sender: Tuser;
  createdAt: Date; // Assuming createdAt is a string, adjust accordingly
};

interface MessageStore {
  messages: Message[];
  setMessage: (message: Message) => void;
}

const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  setMessage: (newMessage) => {
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },
}));

export default useMessageStore;
