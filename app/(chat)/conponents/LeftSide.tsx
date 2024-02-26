"use client";
import dynamic from "next/dynamic";

const Drawer = dynamic(() => import("./Drawer"));
const MyFriends = dynamic(() => import("./myChats/MyFriends"));
const GroupModal = dynamic(() => import("./group/Modal"));
const LeftSide = () => {
  return (
    <div className="w-[360px] h-screen bg-white overflow-y-scroll rounded-md border-2 m-2 border-blue-800 hover:border-violet-700 transition-all duration-500">
      <Drawer />
      <GroupModal />
      <MyFriends />
    </div>
  );
};

export default LeftSide;
