"use client";
// ChatContextProvider.tsx
import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { Socket, io, SocketOptions } from "socket.io-client";

interface ChatContextType {
  socket: Socket;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }
  return context;
};

interface ChatContextProviderProps {
  children: ReactNode;
}

const ChatContextProvider = ({ children }: ChatContextProviderProps) => {
  const socketOptions: SocketOptions = {}; // You can customize socket options if needed
  const socket: Socket = useMemo(
    () => io("http://localhost:5000", socketOptions),
    [socketOptions]
  );

  const contextValue: ChatContextType = {
    socket,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
