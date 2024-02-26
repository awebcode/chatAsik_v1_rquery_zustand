"use client";
import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { useChatStore } from "@/store/useChat";
import dynamic from "next/dynamic";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));
const MessageCard = dynamic(() => import("./MessageCard"));
import { allMessages } from "@/functions/messageActions";
import { FaArrowDown } from "react-icons/fa";
const NoChatProfile = dynamic(() => import("../NoChatProfile"));
const Messages = () => {
  const { selectedChat } = useChatStore();
  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    useInfiniteQuery({
      queryKey: ["messages", selectedChat?.chatId],

      queryFn: allMessages as any,

      getNextPageParam: (lastPage: any) => {
        const { prevOffset, total, limit } = lastPage;
        // Calculate the next offset based on the limit
        const nextOffset = prevOffset + limit;

        // Check if there are more items to fetch
        if (nextOffset >= total) {
          return;
        }

        return nextOffset;
      },
      initialPageParam: 0,
    });

  // const messages = data?.pages.flatMap((page) => page.messages);
  const messages = [].concat(...(data?.pages.map((page) => page.messages) ?? []));

  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(0);
  useEffect(() => {
    const container = containerRef.current as any;
    //check if scroll up greater than -200
    const handleScroll = () => {
      setUserScrolledUp(container.scrollTop);
    };
    const scrollToBottom = () => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    if (userScrolledUp >= 0) {
      scrollToBottom();
    }
    // scrollToBottom();

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [messages, userScrolledUp]);
  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById("CustomscrollableTarget");
      if (container) {
        const isAtBottom =
          container.scrollHeight - container.clientHeight <= container.scrollTop + 1;

        setShowScrollToBottomButton(!isAtBottom);

        
      }
    };
    // const container = containerRef.current;
    const container = document.getElementById("CustomscrollableTarget");
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [messages]);

  const scrollToBottom = () => {
    if (messageEndRef.current)
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div
      // onScroll={handleScroll}
      // className="menu p-4 bg-base-200 h-[80vh] overflow-y-scroll flex flex-col-reverse"
      >
        <div
          ref={containerRef}
          // onScroll={handleScroll}
          id="CustomscrollableTarget"
          className="menu p-4 bg-base-200 h-[80vh] overflow-y-scroll overflow-x-hidden flex flex-col-reverse"
        >
          <div className="init_profile">
            {/* {messages.length === 0 && !isLoading && (
              <NoChatProfile user={selectedChat as any} />
            )}{" "} */}

            {/* <NoChatProfile user={selectedChat as any} /> */}
          </div>
          <InfiniteScroll
            dataLength={messages ? messages?.length : 0}
            next={() => {
              console.log("next page message called");

              fetchNextPage();
            }}
            hasMore={hasNextPage}
            loader={
              // <h1 className="text-4xl text-white">Loading..........</h1>
              <div className="m-4 h-8 w-8 block mx-auto animate-spin rounded-full border-4 border-blue-500  border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            }
            endMessage={
              !isLoading &&
              messages.length > 10 && (
                <h1 className="text-green-400 text-center p-2 text-sm md:text-xl">
                  <b>Yay! You have seen it all</b>
                </h1>
              )
            }
            style={{ display: "flex", flexDirection: "column-reverse" }}
            inverse={true}
            scrollableTarget="CustomscrollableTarget"
            scrollThreshold={1}
          >
            <div className="flex flex-col gap-5">
              {isLoading ? (
                <div className="m-8 mb-32 h-10 w-10 block mx-auto animate-spin rounded-full border-4 border-blue-500  border-r-transparent  align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              ) : (
                messages &&
                messages.length &&
                messages.reverse().map((message: any, i: any) => {
                  return <MessageCard message={message} key={message?._id} />;
                })
              )}
              <div ref={messageEndRef} />
            </div>

            {showScrollToBottomButton && (
              <button
                onClick={scrollToBottom}
                className="fixed flex items-center z-50 bottom-24  right-4 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-500 focus:outline-none"
              >
                <FaArrowDown className="w-5 h-5 mt-1 animate-bounce text-green-400" />
              </button>
            )}
          </InfiniteScroll>
          {!hasNextPage&&!isFetching&&!isLoading &&  <NoChatProfile user={selectedChat as any} />}
        </div>
      </div>
    </>
  );
};

export default Messages;
