import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useUserStore } from "@/store/useUser";
import Image from "next/image";
import React from "react";
import { MdClose } from "react-icons/md";

const Reactions = ({
  message,
  isCurrentUserMessage,
  handleRemoveReact,
  isReactionListModal,
  setReactionListVisible,
  reactionListModalRef,
}: any) => {
  const { onlineUsers } = useOnlineUsersStore();
  const { currentUser } = useUserStore();
  const lastThreeReactions =
    message?.reactions?.slice(0, 3).map((reaction: any) => reaction.emoji) ?? [];
  return (
    <div>
      {/* Reactions */}
      <div ref={reactionListModalRef}>
        {message.reactions?.length === 1 ? (
          <span
            onClick={() => setReactionListVisible(!isReactionListModal)}
            className={`absolute ${
              message.isReply ? "-bottom-6" : "-bottom-3"
            } right-[6px] text-xl cursor-pointer`}
          >
            <span className="flex">{message.reactions[0].emoji}</span>
          </span>
        ) : (
          <span
            onClick={() => setReactionListVisible(!isReactionListModal)}
            className="absolute -bottom-3 right-[6px] text-[14px] cursor-pointer"
          >
            {lastThreeReactions.reverse().map((v: any, i: any) => (
              <span key={i} className="inline">
                {v}
              </span>
            ))}
            <span className="text-xs">
              {" "}
              {message.reactions?.length > 1 && message.reactions?.length < 3
                ? `` //${message.reactions.length}
                : message.reactions?.length > 3
                ? ` +${message.reactions.length - 3}`
                : ""}
            </span>
          </span>
        )}
        <div
          className={`z-50 absolute -top-20 ${
            !isCurrentUserMessage ? "-right-[290px] w-[400px]" : "right-10"
          } rounded transition-all  bg-gray-900 p-8 duration-300 ${
            isReactionListModal
              ? "block w-[400px] max-h-[300px] overflow-y-auto"
              : "hidden"
          }`}
        >
          <button
            onClick={() => setReactionListVisible(false)}
            className="btn float-right "
          >
            <MdClose />
          </button>
          <h1 className="text-3xl p-3 border-b-2 mb-6 border-violet-600">
            Reactions ({message.reactions?.length})
          </h1>
          <div className="">
            {message.reactions.map((v: any, i: any) => {
              return (
                <div className="flexBetween gap-2 hover:bg-gray-700 duration-300 p-3 rounded-md">
                  <div className="left p-2 flex">
                    {" "}
                    <div className="h-8 w-8 relative rounded-full ring-2 ring-violet-600">
                      <Image
                        height={35}
                        width={35}
                        className="rounded-full h-full w-full object-cover"
                        alt={v.reactBy.username as any}
                        src={v.reactBy.pic as any}
                      />
                      {onlineUsers.some((u: any) => u.id === v.reactBy._id) ? (
                        <span
                          className={`absolute bottom-0 right-0 rounded-full p-[6px] 
                                        bg-green-500
                                      `}
                        ></span>
                      ) : (
                        <span
                          className={`absolute bottom-0 right-0 rounded-full p-[6px] 
                                       bg-rose-500
                                      `}
                        ></span>
                      )}
                    </div>
                    <div className="flex flex-col mx-4">
                      <span>{v.reactBy.username}</span>
                      {/* Remove own react */}
                      {v.reactBy._id === currentUser?._id && (
                        <span
                          className="text-rose-300 cursor-pointer my-1"
                          onClick={() => {
                            handleRemoveReact(v._id);
                            setReactionListVisible(false);
                          }}
                        >
                          Click to remove
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Right side */}

                  <div className="emoji  text-yellow-400">
                    <span className="text-2xl">{v.emoji}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setReactionListVisible(false)}
            className="btn float-right bottom-0 "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reactions;
