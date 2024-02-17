import React from "react";
import { BsArchive, BsCheck, BsLock, BsMicMute } from "react-icons/bs";
import { MdCall, MdDelete, MdVideoCall } from "react-icons/md";
import { RiProfileFill, RiProfileLine } from "react-icons/ri";
import {
  useBlockMutation,
  useDeleteSingleChatMutation,
} from "../mutations/chatMutations";
import { useUserStore } from "@/store/useUser";

const Modal = ({ open, setOpen, chatId, status, updatedBy }: any) => {
  const blockMutation = useBlockMutation();
  const { currentUser } = useUserStore();
  const deleteSignleChatMutation = useDeleteSingleChatMutation(chatId as any);
  const blockData = {
    chatId: chatId,
    status: status === "blocked" ? "unblocked" : "blocked",
  };
  const items = [
    {
      name: "Mark as read",
      icon: <BsCheck />,
      action: () => console.log("Mark as read clicked"),
    },
    {
      name: "Mute notifications",
      icon: <BsMicMute />,
      action: () => console.log("Mute notifications clicked"),
    },
    {
      name: "View profile",
      icon: <RiProfileLine />,
      action: () => console.log("View profile clicked"),
    },
    {
      name: "Audio call",
      icon: <MdCall />,
      action: () => console.log("Audio call clicked"),
    },
    {
      name: "Video call",
      icon: <MdVideoCall />,
      action: () => console.log("Video call clicked"),
    },
    {
      name: "Archive",
      icon: <BsArchive />,
      action: () => console.log("Archive clicked"),
    },
    {
      name:
        status === "blocked" && updatedBy?._id === currentUser?._id ? (
          <span className="text-blue-500">Unblock</span>
        ) : status === "blocked" && updatedBy._id !== currentUser?._id ? (
          <span className="text-rose-600">{updatedBy.username} Blocked you</span>
        ) : (
          <span className="text-rose-500">Block</span>
        ),
      icon: <BsLock />,
      action: () => blockMutation.mutateAsync(blockData),
    },
    {
      name: <span className="text-rose-500">Delete</span>,
      icon: <MdDelete className="text-rose-500" />,
      action: () => deleteSignleChatMutation.mutateAsync(),
    },
  ];

  return (
    <div
      className={`z-50 absolute right-0 w-[250px] p-4  shadow-md   bg-white rounded duration-500  ${
        open ? "block opacity-100 duration-300" : "hidden opacity-0 duration-300"
      }`}
    >
      <ul className="list-none p-0">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center py-2 px-4 cursor-pointer hover:bg-gray-100"
            onClick={item.action}
          >
            <span className="mr-2 text-xs md:text-sm">{item.icon}</span>
            <span className="text-xs md:text-sm">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Modal;
