import React, { useEffect } from "react";
import dynamic from "next/dynamic";

const ChatHeader = dynamic(() => import("./chatHeader/ChatHeader"));
const Messages = dynamic(() => import("./messages/Messages"));

const Input = dynamic(() => import("./Input"));
import { useChatStore } from "@/store/useChat";
import { useChatContext } from "@/context/ChatContext/ChatContextProvider";

const MainChat = () => {
  const { selectedChat } = useChatStore();
  const { socket } = useChatContext();
  useEffect(() => {
    const handleSocketJoin = (data: any) => {
      console.log("Socket join", data);
    };

    // Add event listeners
    socket.on("join", handleSocketJoin);

    // Emit "join" event when the component mounts
    const joinData = {
      chatId: selectedChat?.chatId,
    };
    socket.emit("join", joinData);

    // Clean up event listeners when the component unmounts
    return () => {
      socket.off("join", handleSocketJoin);
    };
  }, []); //
  return (
    <div className="relative p-4 w-full border-2 rounded-md border-blue-800 hover:border-violet-500 transition-all duration-500 m-3">
      <ChatHeader />
      <Messages />
      <div className="absolute bottom-1 w-[96%]">
        <Input />
      </div>
    </div>
  );
};

export default MainChat;
