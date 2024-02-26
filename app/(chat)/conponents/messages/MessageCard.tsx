import React, { useEffect, useState } from "react";
import { Tuser } from "../UserCard";
import { useUserStore } from "@/store/useUser";
import moment from "moment";
import Image from "next/image";
import { renderStatus } from "../logics/renderStatus";
import { BsReply, BsThreeDotsVertical } from "react-icons/bs";
import { useClickAway } from "@uidotdev/usehooks";
import useEditReplyStore from "@/store/useEditReply";
import { useChatStore } from "@/store/useChat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  updateAllMessageStatusAsRemove,
  updateAllMessageStatusAsUnsent,
} from "@/functions/messageActions";
import { useChatContext } from "@/context/ChatContext/ChatContextProvider";
import { MdOutlineEmojiEmotions } from "react-icons/md";

import { useAddRemoveReactionMutation } from "../mutations/messageMutations";
import dynamic from "next/dynamic";

const Reactions = dynamic(() => import("./Reactions"));
const EmojiReactModal = dynamic(() => import("./EmojiReactModal"));
type TMessage = {
  _id: string;
  content: string;
  status: string;
  sender: Tuser;
  isEdit: any;
  isReply: any;
  createdAt: Date; // Assuming createdAt is a string, adjust accordingly
  updatedAt: Date;
  removedBy: string;
  reactions: any[];
  image: { url: string };
};

const MessageCard = ({ message }: { message: TMessage }) => {
  const { onEdit, onReply } = useEditReplyStore();
  const { currentUser } = useUserStore();
  const { selectedChat } = useChatStore();
  const [openReactModal, setOpenReactModal] = useState(false);
  const [isReactionListModal, setReactionListVisible] = useState(false);
  const [openEmojiModal, setOpenEmojiModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState("");
  const { socket } = useChatContext();
  const modalRef: any = useClickAway(() => {
    setOpen(false);
  });
  const reactModalRef: any = useClickAway(() => {
    setOpenReactModal(false);
  });
  const emojiModalRef: any = useClickAway(() => {
    setOpenEmojiModal(false);
  });

  const reactionListModalRef: any = useClickAway(() => {
    setReactionListVisible(false);
  });

  const isCurrentUserMessage = message.sender._id === currentUser?._id;
  const queryclient = useQueryClient();
  const unsentmutation = useMutation({
    mutationFn: (data) => updateAllMessageStatusAsUnsent(data),
    // mutationKey: ["messages"],
    onSuccess: (data) => {
      const socketData = {
        senderId: currentUser?._id,
        receiverId: selectedChat?.userId,
        chatId: selectedChat?.chatId,

        pic: currentUser?.pic,
        createAt: data.createdAt,
        isGroupChat: selectedChat?.isGroupChat,
      };
      socket.emit("sentMessage", socketData);
      toast.success("Message Unsent!");
      setOpen(false);
      queryclient.invalidateQueries({
        queryKey: ["messages"],
      });
    },
  });

  const removemutation = useMutation({
    mutationFn: (data) => updateAllMessageStatusAsRemove(data),
    // mutationKey: ["messages"],
    onSuccess: (data) => {
      console.log({ data });
      const socketData = {
        senderId: currentUser?._id,
        receiverId: selectedChat?.userId,
        chatId: selectedChat?.chatId,

        pic: currentUser?.pic,
        createAt: data.createdAt,
        isGroupChat: selectedChat?.isGroupChat,
      };
      socket.emit("sentMessage", socketData);
      toast.success("Message Removed!");
      setOpen(false);
      queryclient.invalidateQueries({
        queryKey: ["messages"],
      });
    },
  });
  const removeHandler = (id: string) => {
    const data = { status: "remove", messageId: id, chatId: selectedChat?.chatId };
    removemutation.mutateAsync(data as any);
  };
  const removeFromAllHandler = (id: string) => {
    const data = { status: "removeFromAll", messageId: id, chatId: selectedChat?.chatId };
    removemutation.mutateAsync(data as any);
  };
  const unsentHandler = (id: string) => {
    const data = { status: "unsent", messageId: id, chatId: selectedChat?.chatId };
    unsentmutation.mutateAsync(data as any);
  };

  const BackRemoveFromAllHandler = (id: string) => {
    const data = {
      status: "reBack",
      messageId: id,
      chatId: selectedChat?.chatId,
    };
    removemutation.mutateAsync(data as any);
  };
  useEffect(() => {
    if (removemutation.isError && removemutation.error) {
      toast.error((removemutation.error as any)?.response?.data?.message);
    }

    if (unsentmutation.isError && unsentmutation.error) {
      toast.error((unsentmutation.error as any)?.response?.data?.message);
    }

    return () => {
      // Cleanup: Reset error states when the component unmounts
      removemutation.reset();
      unsentmutation.reset();
    };
  }, [removemutation.isError, unsentmutation.isError, toast]);
  //reactiions
  const addRemoveReactionMutation = useAddRemoveReactionMutation();
  const onEmojiClick = (e: any, messageId: string) => {
    setCurrentEmoji(e.emoji);
    const reactionData = {
      type: "add",
      messageId: messageId,
      emoji: e.emoji,
    };
    addRemoveReactionMutation.mutateAsync(reactionData);
  };

  const handleRemoveReact = (id: string) => {
    const reactionData = {
      type: "remove",
      reactionId: id,
    };
    addRemoveReactionMutation.mutateAsync(reactionData);
  };

  return (
    <div
      className={`flex ${
        isCurrentUserMessage ? "justify-end" : "justify-start"
      } mb-6 py-10`}
    >
      <div
        className={`flex items-end ${
          isCurrentUserMessage ? "flex-row-reverse" : "flex-row"
        } space-x-2`}
      >
        {message.sender._id === currentUser?._id ? (
          renderStatus(message, "onMessage", 0)
        ) : (
          <div className="h-8 w-8 relative">
            <Image
              height={35}
              width={35}
              className="rounded-full h-full w-full object-cover"
              alt={message.sender.username as any}
              src={message.sender.pic as any}
            />
          </div>
        )}

        <div className=" ">
          <div
            className={`flex items-center ${
              !isCurrentUserMessage ? "flex-row-reverse" : "flex-row"
            } gap-[6px]`}
          >
            {/* {message.status !== "unsent" && message.removedBy !== currentUser?._id && ( */}
            <>
              {" "}
              <span className="relative" ref={modalRef}>
                {message.status !== "unsent" && (
                  <BsThreeDotsVertical
                    onClick={() => setOpen((prev) => !prev)}
                    className="text-white h-5 w-5 cursor-pointer"
                  />
                )}

                <div
                  className={`modal absolute ${
                    !isCurrentUserMessage ? "left-[0px] -top-24" : "-left-[150px] -top-36"
                  }   w-[140px]  bg-gray-100 text-black p-3 rounded-lg duration-300  ${
                    open ? "block opacity-100" : "hidden opacity-0"
                  }`}
                >
                  <ul className="flex flex-col gap-1">
                    {isCurrentUserMessage && (
                      <a
                        onClick={() => {
                          onEdit(message as any);
                          setOpen(false);
                        }}
                        className=" text-xs hover:bg-gray-300  p-[6px] duration-300  rounded"
                      >
                        Edit
                      </a>
                    )}
                    {message.status !== "remove" ? (
                      <>
                        <a
                          onClick={() => removeHandler(message._id)}
                          className=" text-xs hover:bg-gray-300  p-[6px] duration-300  rounded"
                        >
                          Remove
                        </a>
                        <a
                          onClick={() => removeFromAllHandler(message._id)}
                          className="text-xs hover:bg-gray-300  p-[6px] duration-300  rounded"
                        >
                          Remove All
                        </a>
                      </>
                    ) : (
                      <a
                        onClick={() => BackRemoveFromAllHandler(message._id)}
                        className="text-xs hover:bg-gray-300  p-[6px] duration-300  rounded"
                      >
                        Back Message
                      </a>
                    )}

                    {isCurrentUserMessage && (
                      <a
                        onClick={() => unsentHandler(message._id)}
                        className=" text-xs hover:bg-gray-300  p-[6px] duration-300  rounded"
                      >
                        Unsent
                      </a>
                    )}
                  </ul>
                </div>
              </span>
              {message.status !== "unsent" && message.status !== "remove" && (
                <>
                  {" "}
                  <span>
                    <BsReply
                      onClick={() => {
                        onReply(message as any);
                        setOpen(false);
                      }}
                      className={`text-gray-300 h-5 w-5 cursor-pointer`}
                    />
                  </span>
                  {/* Emoji reaction start */}
                  <div ref={reactModalRef} className="relative">
                    <span>
                      <MdOutlineEmojiEmotions
                        onClick={() => setOpenReactModal((prev) => !prev)}
                        className={`text-gray-300 h-[18px] w-[18px] mr-1 cursor-pointer`}
                      />
                    </span>
                    {/* Emoji Modal */}

                    <EmojiReactModal
                      message={message}
                      openReactModal={openReactModal}
                      setOpenReactModal={setOpenReactModal}
                      onEmojiClick={onEmojiClick}
                      emojiModalRef={emojiModalRef}
                      openEmojiModal={openEmojiModal}
                      setOpenEmojiModal={setOpenEmojiModal}
                      isCurrentUserMessage={isCurrentUserMessage}
                    />
                  </div>
                  {/* Emoji reaction end */}
                </>
              )}
            </>
            {/* )} */}

            <div className="">
              {/* Time */}
              <p className="text-xs text-gray-200">
                {message.isEdit ? (
                  <span className="font-bold mr-2">Edited</span>
                ) : message.status === "unsent" ? (
                  <span className="font-bold mr-2">UnsentAt</span>
                ) : message.status === "remove" ? (
                  <span className="font-bold mr-2">removedAt</span>
                ) : null}
                {moment(
                  message.isEdit
                    ? message.updatedAt
                    : message.status === "unsent" || message.status === "remove"
                    ? message.updatedAt
                    : message.createdAt
                ).format("lll")}
              </p>
              {/* Time end */}
              {message.isReply ? (
                <div>
                  <span className="text-gray-200 text-xs">
                    <BsReply
                      className={`text-gray-300 h-4 w-4 cursor-pointer mx-2 inline `}
                    />{" "}
                    {message.sender._id === message.isReply?.messageId?.sender?._id
                      ? message.sender._id === currentUser?._id
                        ? "You replied to yourself"
                        : message.sender._id === selectedChat?.userId
                        ? ` ${message.isReply?.messageId?.sender?.username} replied to You `
                        : ""
                      : message.isReply?.messageId?.sender?._id === currentUser?._id
                      ? ` ${selectedChat?.username} replied to you `
                      : `You replied to ${selectedChat?.username} `}
                  </span>
                  <div className="relative text-sm  bg-gray-800  rounded-lg p-3  max-w-[260px] break-words !h-fit  ">
                    <span className="text-gray-300">
                      {/* {message.isReply?.messageId?.content} */}
                      {message.isReply?.messageId?.content ? (
                        message.isReply?.messageId?.content
                      ) : message.isReply?.messageId?.image ? (
                        <div className="h-[130px] w-[130px] rounded">
                          <Image
                            src={message.isReply?.messageId?.image.url}
                            alt={message.sender.username}
                            height={100}
                            width={100}
                            className="h-full w-full rounded-lg"
                          />
                        </div>
                      ) : (
                        ""
                      )}
                    </span>
                    {message.status !== "remove" &&
                    message.removedBy !== currentUser?._id ? (
                      <div
                        className={`absolute ${
                          message.image ? "-bottom-[70px]" : "-bottom-5"
                        } ring-2 ring-gray-400 left-8 right-0 text-sm text-gray-200  bg-gray-800 rounded-lg p-2  max-w-[260px] break-words !h-fit  `}
                      >
                        {message.content ? (
                          message.content
                        ) : message.image ? (
                          <div className="h-[60px]  rounded">
                            <Image
                              src={message.image.url}
                              alt={message.sender.username}
                              height={80}
                              width={80}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          </div>
                        ) : (
                          ""
                        )}
                        {/* Reply Reactions */}
                        <Reactions
                          message={message}
                          isCurrentUserMessage={isCurrentUserMessage}
                          handleRemoveReact={handleRemoveReact}
                          isReactionListModal={isReactionListModal}
                          setReactionListVisible={setReactionListVisible}
                          reactionListModalRef={reactionListModalRef}
                        />
                      </div>
                    ) : (
                      <div className="absolute -bottom-7 ring-2 ring-gray-400 left-8 right-0 text-sm text-gray-200  bg-gray-800 rounded-lg p-2  max-w-[260px] break-words !h-fit  ">
                        Removed
                      </div>
                    )}
                  </div>
                </div>
              ) : message.status !== "remove" &&
                message.removedBy !== currentUser?._id ? (
                <div className="text-sm relative  text-gray-200  bg-gray-800 rounded-lg p-3  max-w-[260px] break-words !h-fit  ">
                  {message.content ? (
                    message.content
                  ) : message.image ? (
                    <div className="h-[130px] w-[130px] rounded">
                      <Image
                        src={message.image.url}
                        alt={message.sender.username}
                        height={100}
                        width={100}
                        className="h-full w-full rounded-lg"
                      />
                    </div>
                  ) : (
                    ""
                  )}

                  {/* Reactions */}

                  <Reactions
                    message={message}
                    isCurrentUserMessage={isCurrentUserMessage}
                    handleRemoveReact={handleRemoveReact}
                    isReactionListModal={isReactionListModal}
                    setReactionListVisible={setReactionListVisible}
                    reactionListModalRef={reactionListModalRef}
                  />
                  {/*Display Reactions end */}
                </div>
              ) : (
                <div className="text-sm  text-gray-200  bg-gray-800 rounded-lg p-3  max-w-[260px] break-words !h-fit  ">
                  Removed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
