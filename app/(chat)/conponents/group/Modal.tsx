"use client";
import React, { useState } from "react";
import { useClickAway, useDebounce } from "@uidotdev/usehooks";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers } from "@/functions/authActions";
import dynamic from "next/dynamic";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));
import useGroupStore from "@/store/useGroupStore";
import { toast } from "react-toastify";
import { createGroup } from "@/functions/chatActions";
const SingleUser = dynamic(() => import("./SingleUser"));
const GroupCard = dynamic(() => import("./GroupCard"));
const GroupModal = () => {
  const queryclient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const searchText = useDebounce(searchTerm, 600);
  const groupMutaion = useMutation({
    mutationFn: (data: any) => createGroup(data),
    onSuccess: (data) => {
      console.log({ groupMutaion: data });
      toast.success("Group created successfully!");
      queryclient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
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
  const { selectedGroupUsers } = useGroupStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const clickOutsideRef: any = useClickAway(() => {
    setIsOpen(false);
  });

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };
  const [groupName, setGroupName] = useState("");
  const createGroupHandler = () => {
    if (selectedGroupUsers.length < 2 && groupName.trim() === "") {
      return;
    }

    const userIds = selectedGroupUsers.map((user: any) => user._id);
    const groupData = {
      users: userIds,
      name: groupName,
    };
    groupMutaion.mutateAsync(groupData);
  };

  return (
    <div ref={clickOutsideRef}>
      <button
        onClick={toggleDrawer}
        className=" btn btn-primary drawer-button w-full rounded-none m-1 box-border"
      >
        +Create Group
      </button>
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[600px] md:h-[700px] w-auto md:w-[700px]   transition-all duration-300 rounded-lg p-8 bg-white z-50 ${
          isOpen ? "block opacity-1 duration-500" : "hidden opacity-0"
        }`}
      >
        <div>
          <div>
            <div className="">
              {/* Group Name */}
              <div className="relative mb-5">
                <label htmlFor="Group">Group Name:</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group Name."
                  className="shadow-lg w-full h-auto bg-blue-100 ring ring-blue-500 text-sm py-3 px-3 rounded-md text-black outline-none border-1 border-yellow-500 hover:border-yellow-500 transition-all duration-300"
                />
                <button
                  disabled={selectedGroupUsers.length < 3}
                  className="absolute right-1 top-[25px] bg-blue-600 btn m-1 text-xs rounded-md p-[8px] capitalize "
                  onClick={() => createGroupHandler()}
                >
                  +Create
                </button>
              </div>

              {/* searching */}

              <div className="relative">
                {" "}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleInputChange(e)}
                  placeholder="Enter username to search user..."
                  className="shadow-lg w-full h-auto bg-blue-100 ring ring-blue-500 text-sm py-3 px-3 rounded-md text-black outline-none border-1 border-yellow-500 hover:border-yellow-500 transition-all duration-300"
                />
              </div>
              {selectedGroupUsers.length > 0 && (
                <div>
                  <div className=" flex flex-wrap  items-center gap-2 p-4 m-5 overflow-y-auto max-h-40 bg-green-100 rounded-md ">
                    {selectedGroupUsers.map((user, index) => (
                      <SingleUser user={user} key={index} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div id="targetModal" className="max-h-[300px] mt-2 w-full overflow-y-scroll">
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
                scrollableTarget="targetModal"
              >
                <div className="flex flex-col gap-5">
                  {users && users?.length > 0 ? (
                    searchText.trim() !== "" &&
                    users?.map((user: any) => {
                      return (
                        <GroupCard user={user} key={user._id} setIsOpen={setIsOpen} />
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
        <div
          className="btn m-2 absolute bottom-0 right-0 cursor-pointer"
          onClick={toggleDrawer}
        >
          Close
        </div>
      </div>
    </div>
  );
};

export default GroupModal;
