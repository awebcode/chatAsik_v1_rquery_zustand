import { useChatStore } from "@/store/useChat";
import Image from "next/image";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateChatStatusAsBlockOUnblock } from "@/functions/messageActions";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/useUser";
import { deleteSingleChat } from "@/functions/chatActions";
import {
  useBlockMutation,
  useDeleteSingleChatMutation,
} from "../mutations/chatMutations";
const UserModal = ({ open, setOpen, isUserOnline }: any) => {
  const queryclient = useQueryClient();
  const { selectedChat, setSelectedChat } = useChatStore();
  const { currentUser } = useUserStore();
  const blockMutation = useBlockMutation();

  const deleteSignleChatMutation = useDeleteSingleChatMutation(
    selectedChat?.chatId as any
  );
  const blockHandler = () => {
    const data = {
      chatId: selectedChat?.chatId,
      status: selectedChat?.status === "blocked" ? "unblocked" : "blocked",
    };
    blockMutation.mutateAsync(data);
  };
  const deleteHandler = () => {
    deleteSignleChatMutation.mutateAsync();
  };
  return (
    <div
      className={`z-50 fixed max-h-screen max-w-3xl p-10 px-14 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded duration-500  ${
        open ? "block opacity-100 duration-300" : "hidden opacity-0 duration-300"
      }`}
    >
      <div className="flex flex-col gap-6 text-zinc-900 mb-8">
        <h1>Id: {selectedChat?.userId}</h1>
        <h1>Name: {selectedChat?.username}</h1>

        <h1>Email: {selectedChat?.email}</h1>
        <div className="relative h-28 w-28 rounded-full ring-4 ring-blue-500">
          <Image
            src={selectedChat?.pic as any}
            alt={selectedChat?.username as any}
            height={100}
            width={100}
            loading="lazy"
            className="h-full w-full rounded-full"
          />
          <span
            className={`absolute bottom-0 right-0 rounded-full p-[12px] ${
              isUserOnline ? "bg-green-500" : "bg-rose-500"
            }`}
          ></span>
        </div>
        {selectedChat?.status === "blocked" &&
        selectedChat.chatUpdatedBy._id === currentUser?._id ? (
          <button
            onClick={() => blockHandler()}
            className="btn capitalize text-xl w-full bg-blue-500 hover:bg-blue-700"
          >
            UnBlock User
          </button>
        ) : selectedChat?.status === "blocked" &&
          selectedChat.chatUpdatedBy._id !== currentUser?._id ? (
          <button
            // onClick={() => blockHandler()}
            className="btn capitalize text-xl w-full bg-rose-500 hover:bg-rose-700"
          >
            {selectedChat.username} Blocked You!
          </button>
        ) : (
          <>
            <button
              onClick={() => blockHandler()}
              className="btn capitalize text-xl w-full bg-rose-500 hover:bg-rose-700"
            >
              Block User
            </button>
            <button
              onClick={() => deleteHandler()}
              className="btn capitalize text-xl w-full my-2 bg-rose-500 hover:bg-rose-700"
            >
              Delete Chat
            </button>
          </>
        )}
      </div>

      <button
        className="absolute mt-5 bottom-2 right-1  btn capitalize text-xl"
        onClick={() => setOpen(false)}
      >
        Close
      </button>
    </div>
  );
};

export default UserModal;
