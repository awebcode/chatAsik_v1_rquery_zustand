import React from "react";
import { Tuser } from "./UserCard";
import Image from "next/image";


const TypingIndicator = ({user}:any) => {
  return (
    <div className="flex  items-center">
      {user && (
        <div className="h-6 w-6  ring-3 ring-blue-700 rounded-full">
          {" "}
          <Image
            height={32}
            width={32}
            className="rounded-full object-fill h-full w-full"
            alt={user.username}
            src={user.pic}
          />
        </div>
      )}
      <div className="typingIndicatorContainer">
        <div className="typingIndicatorBubble">
          <div className="typingIndicatorBubbleDot"></div>
          <div className="typingIndicatorBubbleDot"></div>
          <div className="typingIndicatorBubbleDot"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
