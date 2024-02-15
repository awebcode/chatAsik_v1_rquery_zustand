"use client";
import React, { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/functions/authActions";

import dynamic from "next/dynamic";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));

const UserCard = dynamic(() => import("./UserCard"));
const MyDrawer = dynamic(() => import("react-modern-drawer"));
const Drawer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchText = useDebounce(searchTerm, 600);
  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["messages", searchText],

    queryFn: getAllUsers as any,

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

  const users = data?.pages.flatMap((page) => page?.users);

  const [isOpen, setIsOpen] = React.useState(false);
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <div>
        {/* Page content here */}
        <button
          onClick={toggleDrawer}
          className="btn btn-primary drawer-button w-full rounded-none m-1 box-border"
        >
          Search User
        </button>
      </div>
      <MyDrawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="left"
        className="bg-gray-900 w-80"
      >
        <div>
          <div className="menu p-4   bg-base-200 text-base-content overflow-y-scroll">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleInputChange(e)}
              placeholder="Enter username.."
              className="shadow-lg w-full bg-blue-100 ring ring-blue-500  text-sm py-3 px-3 rounded-md text-black outline-none border-1 border-yellow-500 hover:border-yellow-500 transition-all duration-300"
            />

            <div id="customTarget" style={{ height: "90vh", overflowY: "scroll" }}>
              <InfiniteScroll
                dataLength={users ? users?.length : 0}
                next={() => {
                  console.log("next call");
                  fetchNextPage();
                }}
                hasMore={searchText.trim() !== "" && hasNextPage}
                loader={<div>Loading...</div>}
                endMessage={
                  <p className="text-green-400">
                    <b>Yay! You have seen it all</b>
                  </p>
                }
                style={{ height: "100%" }}
                scrollableTarget="customTarget"
              >
                <div className="flex flex-col gap-5">
                  {/* {users?.map((user: any) => {
          return <UserCard user={user} key={user._id} />;
        })} */}
                  {users && users?.length > 0 ? (
                    searchText.trim() !== "" &&
                    users?.map((user: any) => {
                      return (
                        <UserCard user={user} key={user._id} setIsOpen={setIsOpen} />
                      );
                    })
                  ) : (
                    <h1 className="text-sm md:text-xl m-4 text-center">No User Found!</h1>
                  )}

                  <h1>{isFetching ? "isFetching" : ""}</h1>
                </div>
              </InfiniteScroll>
            </div>
          </div>
        </div>
      </MyDrawer>
    </>
  );
};

export default Drawer;
