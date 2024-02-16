import { accessChats } from "@/functions/chatActions";
import { useChatStore } from "@/store/useChat";
import { useUserStore } from "@/store/useUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";
import moment from "moment";
import { useTypingStore } from "@/store/useTyping";
import TypingIndicatot from "./TypingIndicator";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { renderStatus } from "./logics/renderStatus";
import { useChatContext } from "@/context/ChatContext/ChatContextProvider";
import { updateAllMessageStatusAsSeen } from "@/functions/messageActions";
import { getSender, getSenderFull } from "./logics/logics";
type Tuser = {
  username: string;
  email: string;
  pic: string;
  _id: string;
  users: Tuser[];
};
type TChat = {
  _id?: string;
  latestMessage: { content: string; createdAt: Date | any; status: string };
  createdAt: Date | any;
};

const FriendsCard: React.FC<{
  chat: TChat | any;
  unseenArray: any;
}> = ({ chat, unseenArray }) => {
  const { socket } = useChatContext();
  const { setSelectedChat } = useChatStore();
  const { currentUser } = useUserStore();
  const queryclient = useQueryClient();
  const { onlineUsers } = useOnlineUsersStore();
  const { isTyping, content: typingContent, chatId: typingChatId } = useTypingStore();
  const updateStatusMutation = useMutation({
    mutationKey: ["messages"],
    mutationFn: (chatId: string) => updateAllMessageStatusAsSeen(chatId),
    onSuccess: (data) => {
      const deliverData = {
        senderId: currentUser?._id,
        receiverId: !chat.isGroupChat
          ? getSenderFull(currentUser, chat.users)?._id
          : chat._id,

        pic: !chat.isGroupChat ? currentUser?.pic : "/vercel.svg",
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
        username: !chat.isGroupChat
          ? getSenderFull(currentUser, chat.users)?.username
          : chat.chatName,
        email: !chat.isGroupChat ? getSenderFull(currentUser, chat.users)?.email : "",
        userId: !chat.isGroupChat
          ? getSenderFull(currentUser, chat.users)?._id
          : chat._id,
        pic: !chat.isGroupChat
          ? getSenderFull(currentUser, chat.users)?.pic
          : "/vercel.svg",

        isGroupChat: chat.isGroupChat ? true : false,
      };
      if (chat.isGroupChat) {
        socket.emit("setup", { id: chat?._id } as any);
      }
      setSelectedChat(chatData);

      queryclient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const handleClick = (chatId: string) => {
    const data = {
      userId: getSenderFull(currentUser, chat.users)?._id,
    };
    mutaion.mutateAsync(data as any);
    if (chat?.latestMessage?.status === "unseen") {
      updateStatusMutation.mutateAsync(chatId);
    }
  };
  const isUserOnline = onlineUsers.some((u: any) =>
    chat.isGroupChat
      ? chat.users.some((user: any) => user._id === u.id)
      : getSenderFull(currentUser, chat.users)?._id === u.id
  );

  console.log({});
  return (
    <div
      onClick={() => handleClick(chat._id as string)}
      className="p-3 rounded-md  cursor-pointer   hover:bg-violet-300 duration-300"
    >
      <div className="flex items-center gap-2">
        <div className="relative p-[2px] h-10 w-10 ring-2 ring-gray-900 rounded-full">
          <Image
            height={35}
            width={35}
            className="rounded-full  h-full w-full"
            alt={
              !chat.isGroupChat
                ? getSenderFull(currentUser, chat.users).pic
                : chat.chatName
            }
            src={
              !chat.isGroupChat
                ? getSenderFull(currentUser, chat.users)?.pic
                : "/vercel.svg"
            }
          />

          <span
            className={`absolute bottom-0 right-0 rounded-full p-[6px] ${
              isUserOnline ? "bg-green-500" : "bg-rose-500"
            }`}
          ></span>
        </div>

        <div>
          <h3 className="text-xs md:text-sm font-bold">
            {!chat.isGroupChat ? getSender(currentUser, chat.users) : chat.chatName}
          </h3>

          <span className="text-xs font-bold">
            {isTyping && typingContent && typingChatId === chat?._id ? (
              <TypingIndicatot />
            ) : chat?.latestMessage?.content ? (
              chat?.latestMessage?.content?.length > 20 ? (
                chat?.latestMessage?.content?.substring(0, 15) + "..."
              ) : (
                chat?.latestMessage?.content?.substring(0, 15)
              )
            ) : (
              <span className="text-[10px] font-bold block">Start new conversation</span>
            )}
          </span>
          <span className="text-[9px] font-thin block">
            {chat?.latestMessage?.content
              ? moment(chat?.latestMessage?.createdAt).format("llll")
              : moment(chat?.createdAt).format("lll")}
          </span>
          {!isUserOnline && !chat.isGroupChat ? (
            <span className="text-[9px]">
              LastActive:{" "}
              {moment(getSenderFull(currentUser, chat.users)?.lastActive).format("lll")}
            </span>
          ) : (
            ""
          )}
        </div>

        <div className="mx-2">
          {renderStatus(chat?.latestMessage, "onFriendListCard", unseenArray)}
        </div>
      </div>
    </div>
  );
};

export default FriendsCard;
