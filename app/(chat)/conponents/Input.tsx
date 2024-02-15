"use client";
import React, {
  ChangeEvent,
  KeyboardEvent,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import EmojiPicker, { Theme, EmojiStyle, SuggestionMode } from "emoji-picker-react";
import { useClickAway } from "@uidotdev/usehooks";
import { useChatContext } from "@/context/ChatContext/ChatContextProvider";
import { join } from "path";
import { uuid } from "uuidv4";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sentMessage, updateMessageStatus } from "@/functions/messageActions";
import { useChatStore } from "@/store/useChat";
import useMessageStore from "@/store/useMessage";
import { useUserStore } from "@/store/useUser";
import { useTypingStore } from "@/store/useTyping";
import TypingIndicatot from "./TypingIndicator";
type Tmessage = {
  message: string | any;
};
type Temoji = {
  emoji: string;
};
const Input = () => {
  const { selectedChat } = useChatStore();
  const { socket } = useChatContext();
  const { currentUser } = useUserStore();
  const [message, setMessage] = useState<Tmessage>({ message: "" });
  const [openEmoji, setOpenEmoji] = useState(false);
  const { isTyping, content: typingContent, chatId: typingChatId } = useTypingStore();
  //clickOutside
  const clickRef: any = useClickAway(() => setOpenEmoji(false));
  //change message
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMessage((prev) => ({ ...prev, [name]: value }));
  };
  const timerRef = useRef<any | null>(null);
  useEffect(() => {
    if (message.message.trim() !== "") {
      socket.emit("startTyping", {
        content: message.message,
        chatId: selectedChat?.chatId,
        senderId: currentUser?._id,
        receiverId: selectedChat?.userId,
        isGroupChat: selectedChat?.isGroupChat,
      });
    } else {
      if (message.message.trim() === "") {
        socket.emit("stopTyping", {
          content: message.message,
          chatId: selectedChat?.chatId,
          senderId: currentUser?._id,
          receiverId: selectedChat?.userId,
          isGroupChat: selectedChat?.isGroupChat,
        });
      }
    }

    const timerLength = 2500;

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a new timer
    timerRef.current = setTimeout(() => {
      // Check if the user is still typing after the delay
      if (message.message.trim() !== "") {
        socket.emit("stopTyping", {
          content: message.message,
          chatId: selectedChat?.chatId,
          senderId: currentUser?._id,
          receiverId: selectedChat?.userId,
          isGroupChat: selectedChat?.isGroupChat,
        });
      }
    }, timerLength);

    return () => {
      // Clear the timer on component unmount or when the dependency changes
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message.message, currentUser, selectedChat, socket]);

  const onkeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };
  //onsubmit
  // const { setMessage } = useMessageStore();
  const queryclient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => sentMessage(data),
    // mutationKey: ["messages"],
    onSuccess: (data) => {
      const socketData = {
        senderId: currentUser?._id,
        receiverId: selectedChat?.userId,
        chatId: selectedChat?.chatId,
        content: data.content,
        pic: currentUser?.pic,
        createAt: data.createdAt,
        isGroupChat: selectedChat?.isGroupChat,
      };
      socket.emit("sentMessage", socketData);
      toast.success("Message Sent!");
      setMessage({ message: "" });

      queryclient.invalidateQueries({
        queryKey: ["messages"],
      });
    },
  });
  const onSubmit = () => {
    const messageData = {
      chatId: selectedChat?.chatId,
      content: message.message,
    };
    mutation.mutateAsync(messageData as any);
  };
  //emoji click
  const onEmojiClick = (e: Temoji) => {
    setMessage((prev) => ({ ...prev, message: prev.message + e.emoji }));
  };
  //side effects and change status

  return (
    <>
      {" "}
      {isTyping && typingContent && typingChatId === selectedChat?.chatId && (
        <TypingIndicatot user={selectedChat} />
      )}
      <div className="relative mt-5">
        <input
          className="px-2 py-4 rounded-lg text-sm md:text-xl border-2 border-violet-800 hover:border-green-500 transition-all duration-300 outline-none   w-full text-black"
          type="text"
          name="message"
          value={message.message}
          onChange={(e) => handleChange(e)}
          onKeyDown={onkeydown}
        />
        <div ref={clickRef} className="absolute right-24 top-4 text-2xl">
          <button className="rounded-md" onClick={() => setOpenEmoji((prev) => !prev)}>
            😍
          </button>
          <EmojiPicker
            open={openEmoji}
            style={{
              position: "absolute",
              top: "-470px", // Adjust this value based on your design
              right: "0",
              zIndex: 1000,
            }}
            onEmojiClick={onEmojiClick}
            autoFocusSearch
            theme={Theme.DARK}
            lazyLoadEmojis
            emojiStyle={EmojiStyle.FACEBOOK}
            searchPlaceholder="Search chat emojis..."
            suggestedEmojisMode={SuggestionMode.RECENT}
          />
        </div>

        <button
          onClick={onSubmit}
          className="absolute right-2 top-3 bg-green-500 px-6 py-2 rounded-md transition-all duration-300 hover:bg-violet-800"
        >
          Sent
        </button>
      </div>
    </>
  );
};

export default Input;
