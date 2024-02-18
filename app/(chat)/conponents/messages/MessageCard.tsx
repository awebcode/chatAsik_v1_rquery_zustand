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
import { MdAdd, MdClose, MdOutlineEmojiEmotions } from "react-icons/md";
import EmojiPicker, {
  Theme,
  EmojiStyle,
  SuggestionMode,
  Categories,
} from "emoji-picker-react";
import { useAddRemoveReactionMutation } from "../mutations/messageMutations";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
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
};

const MessageCard = ({ message }: { message: TMessage }) => {
  const { onlineUsers } = useOnlineUsersStore();
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
    const data = { status: "unsent", messageId: id };
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
      toast.warning((removemutation.error as any)?.response.data.message);
    }
  }, [removemutation.isError]);
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
  const lastThreeReactions =
    message?.reactions?.slice(0, 3).map((reaction) => reaction.emoji) ?? [];

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
                    <div
                      className={`absolute -top-[90px] -right-20 p-4 rounded-xl bg-gray-800  max-w-[40rem] transition-all  duration-500  ${
                        openReactModal ? "block opacity-100" : "hidden opacity-0"
                      }`}
                    >
                      <div className="flexBetween flex-row w-full gap-x-2">
                        {["🙂", "😍", "❤", "😠", "😜"].map((v, i: number) => {
                          return (
                            <>
                              {" "}
                              <span
                                onClick={() => {
                                  const e = { emoji: v };
                                  onEmojiClick(e, message._id);
                                  // setOpenReactModal(false);
                                  // setOpenEmojiModal(false);
                                }}
                                key={i}
                                className={`text-gray-300 h-6 w-6 mr-1 cursor-pointer transition-all duration-500 hover:scale-105`}
                              >
                                {" "}
                                {v}
                              </span>
                            </>
                          );
                        })}
                        <span
                          ref={emojiModalRef}
                          className="p-2 rounded-full bg-gray-700"
                        >
                          <MdAdd
                            onClick={() => setOpenEmojiModal((prev: boolean) => !prev)}
                            className={`text-gray-300 h-[18px] w-[18px] mr-1 cursor-pointer `}
                          />
                          <EmojiPicker
                            open={openEmojiModal}
                            style={{
                              position: "absolute",
                              top: !isCurrentUserMessage ? "" : "0px", // Adjust this value based on your design
                              right: !isCurrentUserMessage ? "-220px" : "0px",
                              zIndex: 1000,
                            }}
                            height={360}
                            width={310}
                            onEmojiClick={(e) => {
                              onEmojiClick(e, message._id);
                              setOpenReactModal(false);
                              setOpenEmojiModal(false);
                            }}
                            autoFocusSearch
                            theme={Theme.DARK}
                            lazyLoadEmojis
                            emojiStyle={EmojiStyle.FACEBOOK}
                            searchPlaceholder="Search chat emojis..."
                            suggestedEmojisMode={SuggestionMode.RECENT}
                            customEmojis={[
                              {
                                names: ["Alice", "alice in wonderland"],
                                imgUrl:
                                  "https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/alice.png",
                                id: "alice",
                              },
                            ]}
                          />
                        </span>
                      </div>
                    </div>
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
                      {message.isReply?.messageId?.content}
                    </span>
                    {message.status !== "remove" &&
                    message.removedBy !== currentUser?._id ? (
                      <div className="absolute -bottom-7 ring-2 ring-gray-400 left-8 right-0 text-sm text-gray-200  bg-gray-800 rounded-lg p-2  max-w-[260px] break-words !h-fit  ">
                        {message.content}
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
                  {message.content}
                  {/* Reactions */}
                  <div ref={reactionListModalRef}>
                    {message.reactions?.length === 1 ? (
                      <span
                        onClick={() => setReactionListVisible(!isReactionListModal)}
                        className="absolute -bottom-3 right-[6px] text-xl cursor-pointer"
                      >
                        <span className="flex">{message.reactions[0].emoji}</span>
                      </span>
                    ) : (
                      <span
                        onClick={() => setReactionListVisible(!isReactionListModal)}
                        className="absolute -bottom-3 right-[6px] text-[14px] cursor-pointer"
                      >
                        {lastThreeReactions.reverse().map((v, i) => (
                          <span key={i} className="inline">
                            {v}
                          </span>
                        ))}
                        <span className="text-xs">
                          {" "}
                          {message.reactions?.length > 1 && message.reactions?.length < 3
                            ? `` //${message.reactions.length}
                            : message.reactions?.length > 3
                            ? ` +${message.reactions.length - 3}`
                            : ""}
                        </span>
                      </span>
                    )}
                    <div
                      className={`z-50 absolute -top-20 ${
                        !isCurrentUserMessage ? "-right-[290px] w-[400px]" : "right-10"
                      } rounded transition-all  bg-gray-900 p-8 duration-300 ${
                        isReactionListModal
                          ? "block w-[400px] max-h-[300px] overflow-y-auto"
                          : "hidden"
                      }`}
                    >
                      <button
                        onClick={() => setReactionListVisible(false)}
                        className="btn float-right "
                      >
                        <MdClose />
                      </button>
                      <h1 className="text-3xl p-3 border-b-2 mb-6 border-violet-600">
                        Reactions ({message.reactions?.length})
                      </h1>
                      <div className="">
                        {message.reactions.map((v, i) => {
                          return (
                            <div className="flexBetween gap-2 hover:bg-gray-700 duration-300 p-3 rounded-md">
                              <div className="left p-2 flex">
                                {" "}
                                <div className="h-8 w-8 relative rounded-full ring-2 ring-violet-600">
                                  <Image
                                    height={35}
                                    width={35}
                                    className="rounded-full h-full w-full object-cover"
                                    alt={v.reactBy.username as any}
                                    src={v.reactBy.pic as any}
                                  />
                                  {onlineUsers.some(
                                    (u: any) => u.id === v.reactBy._id
                                  ) ? (
                                    <span
                                      className={`absolute bottom-0 right-0 rounded-full p-[6px] 
                                        bg-green-500
                                      `}
                                    ></span>
                                  ) : (
                                    <span
                                      className={`absolute bottom-0 right-0 rounded-full p-[6px] 
                                       bg-rose-500
                                      `}
                                    ></span>
                                  )}
                                </div>
                                <div className="flex flex-col mx-4">
                                  <span>{v.reactBy.username}</span>
                                  {/* Remove own react */}
                                  {v.reactBy._id === currentUser?._id && (
                                    <span
                                      className="text-rose-300 cursor-pointer my-1"
                                      onClick={() => {
                                        handleRemoveReact(v._id);
                                        setReactionListVisible(false);
                                      }}
                                    >
                                      Click to remove
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* Right side */}

                              <div className="emoji  text-yellow-400">
                                <span className="text-2xl">{v.emoji}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setReactionListVisible(false)}
                        className="btn float-right bottom-0 "
                      >
                        Close
                      </button>
                    </div>
                  </div>
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
