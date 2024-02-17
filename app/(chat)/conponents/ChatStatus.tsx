// ChatStatus.js

import Link from "next/link";
import React from "react";
import { Tuser } from "./UserCard";
import { useUserStore } from "@/store/useUser";
import { useChatStore } from "@/store/useChat";

const ChatStatus = ({ user }: { user: Tuser }) => {
  const { currentUser } = useUserStore();
  const { selectedChat } = useChatStore();
  return (
    <div className="p-4 bg-gray-200 rounded-lg">
      {currentUser?._id === user._id ? (
        <p className="text-gray-700 ">
          You blocked <span className="font-bold">{selectedChat?.username}</span>
          <Link href="#" className="text-blue-500 cursor-pointer mx-2">
            unblock and start a conversation!
          </Link>
        </p>
      ) : (
        <p className="text-gray-700 ">
          You can't send messages!. This user has blocked you.{" "}
          <Link href="#" className="text-blue-500 cursor-pointer mx-2">
            Learn more
          </Link>
        </p>
      )}
    </div>
  );
};

export default ChatStatus;
