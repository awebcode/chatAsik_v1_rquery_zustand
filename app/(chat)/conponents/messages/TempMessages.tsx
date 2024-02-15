import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUser";
import { useChatStore } from "@/store/useChat";
import MessageCard from "./MessageCard";
import { allMessages } from "@/functions/messageActions";
import { FaArrowDown } from "react-icons/fa";
import NoChatProfile from "../NoChatProfile";

const Messages = () => {
  const { currentUser } = useUserStore();
  const { selectedChat } = useChatStore();
  const { data: messages, isFetching } = useQuery({
    queryKey: ["messages", selectedChat?.chatId],
    queryFn: () => allMessages(selectedChat?.chatId as any),
  });

  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;

      if (container) {
        const isAtBottom =
          container.scrollHeight - container.clientHeight <= container.scrollTop + 1;

        setShowScrollToBottomButton(!isAtBottom);
      }
    };

    const container = containerRef.current;

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [messages]);

  const messageEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messageEndRef.current)
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  //practice

  //  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  //    let element = e.currentTarget;
  //    if (element.scrollTop === 0 && hasNextPage) {
  //      fetchNextPage();
  //    }
  //  };
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    let element = e.currentTarget;
    if (element.scrollTop === 0) {
      console.log("scrolling");
    }
  };
  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="menu p-4 bg-base-200 h-[80vh] overflow-y-scroll"
      >
        <div className="init_profile">
          <NoChatProfile user={selectedChat as any} />
        </div>
        <div id="messageTarget" ref={targetRef}>
          <div className="flex flex-col gap-5">
            {messages &&
              messages.length &&
              messages.map((message: any, i: number) => (
                <MessageCard message={message} key={message?._id} />
              ))}
            <div ref={messageEndRef} />
          </div>
          {showScrollToBottomButton && (
            <button
              onClick={scrollToBottom}
              className="fixed flex items-center z-50 bottom-24 right-4 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-500 focus:outline-none"
            >
              <FaArrowDown className="w-5 h-5 mt-1 animate-bounce text-green-400" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Messages;
