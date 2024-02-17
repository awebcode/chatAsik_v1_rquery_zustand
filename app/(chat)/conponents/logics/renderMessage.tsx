import { useUserStore } from "@/store/useUser";

export const getReplyText = (message) => {
    const {currentUser}=useUserStore()
  const isCurrentUserSender = message.sender._id === currentUser?._id;
  const isReplyingToSelf = message.sender._id === message.isReply?.messageId?.sender?._id;

  if (isReplyingToSelf) {
    return isCurrentUserSender ? "You replied to yourself" : "";
  }

  return isCurrentUserSender
    ? ` ${selectedChat?.username} replied to you `
    : `You replied to ${selectedChat?.username}`;
};

export const renderMessageContent = (message,content) => (
  <div className="relative text-sm bg-gray-800 rounded-lg p-3 max-w-[260px] break-words !h-fit">
    <span className="text-gray-300">{content}</span>
    {message.status !== "remove" &&
      message.status !== "reBack" &&
      message.removedBy !== currentUser?._id && (
        <div className="absolute -bottom-7 ring-2 ring-gray-400 left-8 right-0 text-sm text-gray-200 bg-gray-800 rounded-lg p-2 max-w-[260px] break-words !h-fit">
          {content}
        </div>
      )}
  </div>
);
