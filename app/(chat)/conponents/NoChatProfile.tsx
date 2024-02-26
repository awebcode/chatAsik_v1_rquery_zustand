import Image from "next/image";
import React from "react";
import { Tuser } from "./UserCard";
import moment from "moment";

const NoChatProfile = ({ user }: { user: Tuser }) => {
  return (
    <div>
      <div className="max-w-sm text-gray-200 mx-auto m-20 rounded-lg shadow-md p-4">
        <div className="h-20 w-20 block mx-auto ring-4 ring-violet-600 rounded-full">
          {" "}
          <Image
            height={80}
            width={80}
            className="rounded-full mx-auto h-full w-full"
            src={user?.pic as any}
            alt={user?.username}
          />
        </div>
        <h2 className="text-center text-2xl font-semibold mt-3">{user?.username}</h2>

        <h2 className="text-center text-2xl font-semibold mt-3">
          {moment(user?.chatCreatedAt).format("llll")}
        </h2>
        <p className="text-center text-gray-200 mt-1">Software Engineer</p>
        <div className="flex justify-center mt-5">
          <a href="#" className="text-blue-500 hover:text-blue-700 mx-3">
            Twitter
          </a>
          <a href="#" className="text-blue-500 hover:text-blue-700 mx-3">
            LinkedIn
          </a>
          <a href="#" className="text-blue-500 hover:text-blue-700 mx-3">
            GitHub
          </a>
        </div>
        <div className="mt-3 text-center">
          <p className="text-gray-300 mt-2">
            {user?.username} is a software engineer with over 10 years of experience in
            developing web and mobile applications. He is skilled in JavaScript, React,
            and Node.js.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatProfile;
