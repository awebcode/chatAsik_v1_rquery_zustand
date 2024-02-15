"use client";
import React, { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useInfiniteQuery } from "@tanstack/react-query";

import dynamic from "next/dynamic";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));
const FriendsCard = dynamic(() => import("./FriendsCard"));
import { getChats } from "@/functions/chatActions";
import { useUserStore } from "@/store/useUser";
const MyFriends = () => {
  const { currentUser } = useUserStore();
  const [searchTerm, setSearchTerm] = useState("");
  const searchText = useDebounce(searchTerm, 600);
  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["messages", searchText, "messages"],

    queryFn: getChats as any,

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const users = data?.pages.flatMap((page) => page.users);

  return (
    <>
      <div>
        <div className="menu p-4   bg-base-200 text-base-content overflow-y-scroll">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e)}
            placeholder="Search Friends"
            className="shadow-lg w-full bg-blue-100 ring ring-blue-500  text-sm py-3 px-3 rounded-md text-black outline-none border-1 border-yellow-500 hover:border-yellow-500 transition-all duration-300"
          />

          <div id="customTargetFriend" style={{ height: "80vh", overflowY: "scroll" }}>
            <InfiniteScroll
              dataLength={users ? users?.length : 0}
              next={() => {
                console.log("next call");
                fetchNextPage();
              }}
              hasMore={hasNextPage}
              loader={<div>Loading...</div>}
              endMessage={
                <p className="text-green-400">
                  <b>Yay! You have seen it all</b>
                </p>
              }
              style={{ height: "100%" }}
              scrollableTarget="customTargetFriend"
            >
              {/* <div className="flex flex-col gap-5">
                {users && users.length > 0 ? (
                  users.map((chat: any) => {
                    const friends = chat.users.filter(
                      (u: any) => u._id !== currentUser?._id && chat.isGroupChat
                    );

                    return friends.map((friend: any) => (
                      <FriendsCard
                        user={friend}
                        chat={chat}
                        unseenMessagesCount={data?.pages[0].unseenMessagesCount}
                        key={friend._id}
                      />
                    ));
                  })
                ) : (
                  <h1 className="text-sm md:text-xl m-4 text-center">No Friend Found!</h1>
                )}

                <h1>{isFetching ? "isFetching" : ""}</h1>
              </div> */}

              <div className="flex flex-col gap-5">
                {users && users.length > 0 ? (
                  users.map((chat: any) => {
                    const friends = chat.users.filter(
                      (u: any) => u._id !== currentUser?._id && chat.isGroupChat
                    );

                    return friends.map((friend: any) => (
                      <FriendsCard
                        user={friend}
                        chat={chat}
                        unseenMessagesCount={data?.pages[0].unseenMessagesCount}
                        key={friend._id}
                      />
                    ));
                  })
                ) : (
                  <h1 className="text-sm md:text-xl m-4 text-center">No Friend Found!</h1>
                )}

                <h1>{isFetching ? "isFetching" : ""}</h1>
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyFriends;
