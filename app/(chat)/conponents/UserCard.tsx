import { accessChats } from "@/functions/chatActions";
import { useChatStore } from "@/store/useChat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";

export type Tuser = {
  username: string;
  email: string;
  pic: string;
  _id: string;
  chatCreatedAt: Date;
};

const UserCard: React.FC<{ user: Tuser; setIsOpen: any }> = ({ user, setIsOpen }) => {
  const { setSelectedChat } = useChatStore();
  const queryclient = useQueryClient();
  const mutaion = useMutation({
    mutationFn: (data) => accessChats(data),
    onSuccess: (data) => {
      const chatData = {
        chatId: data?._id,
        chatCreatedAt: data?.createdAt,
        username: user?.username,
        email: user?.email,
        userId: user?._id,
        pic: user?.pic,
      };
      setSelectedChat(chatData as any);
      setIsOpen(false);

      queryclient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const data = {
      userId: user._id,
    };
    mutaion.mutateAsync(data as any);
  };

  return (
    <div
      onClick={handleClick}
      className="p-3 rounded-md  cursor-pointer   hover:bg-violet-300 duration-300"
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 relative">
          <Image
            height={35}
            width={35}
            className="rounded-full h-full w-full object-cover"
            alt={user.username}
            src={user.pic}
          />
        </div>
        <div>
          <h3 className="text-xs md:text-sm">{user.username}</h3>
          <span className="text-xs">Last Message</span>
          <span className="text-xs">Time</span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
