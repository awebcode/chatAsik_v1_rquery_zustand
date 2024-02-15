import React from "react";
import { Tuser } from "../UserCard";
import { useUserStore } from "@/store/useUser";
import moment from "moment";
import Image from "next/image";
import { isLastMessage, isSameSender } from "../logics/logics";
import { renderStatus } from "../logics/renderStatus";
type TMessage = {
  content: string;
  status: string;
  sender: Tuser;
  createdAt: Date; // Assuming createdAt is a string, adjust accordingly
};

const MessageCard = ({
  message,
 
}: {
  message: TMessage;
  
}) => {
  const { currentUser } = useUserStore();

  const isCurrentUserMessage = message.sender._id === currentUser?._id;
  const isRecentMessage = moment().diff(moment(message.createdAt), "minutes") < 1;

  return (
    <div
      className={`flex ${
        isCurrentUserMessage ? "justify-end" : "justify-start"
      } mb-6 py-10`}
    >
      <div
        className={`flex items-end ${
          isCurrentUserMessage ? "flex-row-reverse" : "flex-row"
        } space-x-2`}
      >
        
        {message.sender._id === currentUser?._id ? (
          renderStatus(message,"onMessage",0)
        ) : (
          <div className="h-8 w-8 relative">
            <Image
              height={35}
              width={35}
              className="rounded-full h-full w-full object-cover"
              alt={message.sender.username as any}
              src={message.sender.pic as any}
            />
          </div>
        )}
        <div className="bg-gray-200 rounded-lg p-2">
          <p className="text-sm">{message.content}</p>
          <p className="text-xs text-gray-500">
            {moment(message.createdAt).format("llll")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
