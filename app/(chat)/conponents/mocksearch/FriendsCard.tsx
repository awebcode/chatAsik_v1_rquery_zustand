import { accessChats } from "@/functions/chatActions";
import { useChatStore } from "@/store/useChat";
import { useUserStore } from "@/store/useUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";
import moment from "moment";
import { useTypingStore } from "@/store/useTyping";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { renderStatus } from "../logics/renderStatus";
import { useChatContext } from "@/context/ChatContext/ChatContextProvider";
import { updateAllMessageStatusAsSeen } from "@/functions/messageActions";
import dynamic from "next/dynamic";
const TypingIndicator = dynamic(() => import("../TypingIndicator"));
type Tuser = {
  username: string;
  email: string;
  pic: string;
  _id: string;
  users: Tuser[];
};
type TChat = {
  isGroupChat: boolean;
  _id: string;
  latestMessage: { content: string; createdAt: Date | any; status: string };
  createdAt: Date | any;
  chatName: string;

  users: Tuser[];
};

const FriendsCard: React.FC<{
  user: Tuser;
  chat: TChat;
  unseenMessagesCount: number;
}> = ({ user, chat, unseenMessagesCount }) => {
  const { socket } = useChatContext();
  const { setSelectedChat } = useChatStore();
  const { currentUser } = useUserStore();
  const queryclient = useQueryClient();
  const { onlineUsers } = useOnlineUsersStore();
  const { isTyping, content: typingContent, senderId: typingUserId } = useTypingStore();
  const updateStatusMutation = useMutation({
    mutationKey: ["messages"],
    mutationFn: (chatId: string) => updateAllMessageStatusAsSeen(chatId),
    onSuccess: (data) => {
      const deliverData = {
        senderId: currentUser?._id,
        receiverId: user?._id,

        pic: currentUser?.pic,
      };
      socket.emit("deliveredMessage", deliverData);
      queryclient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
  const mutaion = useMutation({
    mutationFn: (data) => accessChats(data),
    onSuccess: (data) => {
      const chatData = {
        chatId: chat?._id,
        lastMessage: chat?.latestMessage?.content,
        createdAt: chat?.latestMessage?.createdAt,
        chatCreatedAt: chat?.createdAt,
        username: user?.username,
        email: user?.email,
        userId: user?._id,
        pic: user?.pic,
      };
      setSelectedChat(chatData as any);
      queryclient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const handleClick = (chatId: string) => {
    const data = {
      userId: user._id,
    };
    mutaion.mutateAsync(data as any);
    updateStatusMutation.mutateAsync(chatId);
  };
  return (
    <div
      onClick={() => handleClick(chat._id as string)}
      className="p-3 rounded-md  cursor-pointer   hover:bg-violet-300 duration-300"
    >
      <div className="flex items-center gap-2">
        {chat.isGroupChat ? (
          <div className="relative h-8 w-8">
            <Image
              height={35}
              width={35}
              className="rounded-full object-fill h-full w-full"
              alt={chat.chatName}
              src={"/next.svg"}
            />
            {onlineUsers.some((onlineUser: any) =>
              chat.users.some((user: any) => user._id === onlineUser.id)
            ) ? (
              <span className="absolute bottom-0 right-0 rounded-full p-[6px] bg-green-500"></span>
            ) : (
              <span className="absolute bottom-0 right-0 rounded-full p-[6px] bg-rose-500"></span>
            )}
          </div>
        ) : (
          <div className="relative h-8 w-8">
            <Image
              height={35}
              width={35}
              className="rounded-full object-fill h-full w-full"
              alt={user.username}
              src={user.pic}
            />
            {onlineUsers.some((u: any) => u.id === user?._id) ? (
              <span className="absolute bottom-0 right-0 rounded-full p-[6px] bg-green-500"></span>
            ) : (
              <span className="absolute bottom-0 right-0 rounded-full p-[6px] bg-rose-500"></span>
            )}
          </div>
        )}

        <div>
          <h3 className="text-xs md:text-sm">
            {chat.isGroupChat ? chat.chatName : user.username}
          </h3>

          <span className="text-xs font-bold">
            {isTyping && typingContent && typingUserId === user?._id ? (
              <TypingIndicator />
            ) : chat?.latestMessage?.content ? (
              chat?.latestMessage?.content
            ) : (
              "Start new conversation"
            )}
          </span>
          <span className="text-[10px] font-thin px-2">
            {chat?.latestMessage?.content
              ? moment(chat?.latestMessage?.createdAt).format("llll")
              : moment(chat?.createdAt).format("lll")}
          </span>
        </div>

        <div className="mx-2">
          {renderStatus(chat?.latestMessage, "onFriendListCard", unseenMessagesCount)}
        </div>
      </div>
    </div>
  );
};

export default FriendsCard;
