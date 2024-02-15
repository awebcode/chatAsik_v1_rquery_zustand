import { useChatStore } from "@/store/useChat";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import Image from "next/image";
import React from "react";
import { FaArrowLeft, FaBeer } from "react-icons/fa";
const ChatHeader = () => {
  const { selectedChat, clearselectedChat } = useChatStore();
  const { onlineUsers } = useOnlineUsersStore();
  const isUserOnline = onlineUsers.some((u: any) => u.id === selectedChat?.userId);
  return (
    <div className="p-4 bg-gray-800 flexBetween rounded">
      <div className="flex items-center gap-2">
        <span
          className="text-white cursor-pointer p-[6px] bg-blue-500 rounded-full"
          onClick={() => clearselectedChat()}
        >
          <FaArrowLeft className="h-3 w-3" />
        </span>
        {selectedChat && (
          <>
            <div className="relative p-[2px] h-10 w-10 ring-2 ring-violet-600 rounded-full">
              <Image
                height={35}
                width={35}
                className="rounded-full object-fill h-full w-full"
                alt={selectedChat.username as any}
                src={selectedChat.pic as any}
              />

              <span
                className={`absolute bottom-0 right-0 rounded-full p-[6px] ${
                  isUserOnline ? "bg-green-500" : "bg-rose-500"
                }`}
              ></span>
            </div>
            <div>
              <h3 className="text-xs md:text-sm text-zinc-100">
                {selectedChat.username}
              </h3>
              <span className="text-xs text-zinc-300">
                {isUserOnline ? (
                  <span className="text-green-500">Online</span>
                ) : (
                  <span className="text-rose-500">Offline</span>
                )}
              </span>
            </div>
          </>
        )}
      </div>
      {/* <div>...</div> */}
    </div>
  );
};
export default ChatHeader;
