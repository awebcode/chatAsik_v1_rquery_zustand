"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  useDebounce,
  useIntersectionObserver,
  useIsFirstRender,
} from "@uidotdev/usehooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/functions/authActions";
import { axiosClient } from "@/config/AxiosConfig";
import InfiniteScroll from "react-infinite-scroll-component";
import UserCard from "../UserCard";
const LeftSide = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // const [searchText, setSearchText] = useState("");
  const searchText = useDebounce(searchTerm, 600);
  // const [users, setUsers] = useState([]);
  const initialRender = useRef(true);

  // const {
  //   data: users,
  //   isLoading,
  //   refetch,
  // } = useQuery({
  //   queryKey: ["search", searchText],
  //   queryFn: async () => {
  //     if (searchText.trim() === "") {
  //       return [];
  //     } else {
  //       return await getAllUsers(searchText);
  //     }
  //   },
  // });
  // useEffect(() => {
  //   const searchFunc = async () => {
  //     const result = await getAllUsers(searchText);
  //     setUsers(result);
  //   };

  //   if (searchText.trim() === "") {
  //     setUsers([]);
  //   } else {
  //     searchFunc();
  //   }
  // }, [searchText]);
  const {
    data: users,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["search", searchText],

    queryFn: getAllUsers as any,

    getNextPageParam: (lastPage: any) => {
      const { prevOffset, total, limit } = lastPage;
      console.log({ prevOffset, total, limit });
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

  const products = users?.pages.flatMap((page) => page?.users);
  return (
    <div className="w-[360px] h-screen bg-white overflow-y-scroll">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleInputChange(e)}
        placeholder="Enter your name.."
        className="shadow-lg w-full bg-violet-100 ring ring-violet-400  text-sm py-3 px-3 rounded-md text-black outline-none border-1 border-yellow-500 hover:border-yellow-500 transition-all duration-300"
      />

      <InfiniteScroll
        dataLength={products ? products?.length : 0}
        next={() => {
          fetchNextPage();
        }}
        hasMore={searchText.trim() !== "" && hasNextPage}
        loader={<div>Loading...</div>}
        endMessage={
          <p className="text-green-400">
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        <div className="flex flex-col gap-5">
          {/* {users?.map((user: any) => {
          return <UserCard user={user} key={user._id} />;
        })} */}
          {products &&
            products?.length &&
            searchText.trim() !== "" &&
            products?.map((user: any) => {
              return <UserCard user={user} key={user._id} />;
            })}

          <h1>{isFetching ? "isFetching" : ""}</h1>
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default LeftSide;
