import Image from "next/image";
import { IoIosCheckmarkCircle, IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useUserStore } from "@/store/useUser";
export const renderStatus = (message: any, type: string, unseenArray: any) => {
  const { currentUser } = useUserStore();

  const unseenMessagesCount =
    unseenArray?.length > 0 &&
    unseenArray.find((item: any) => item._id === message?.chat)?.unseenMessagesCount;
  
  
  let statusDiv;
  
  switch (message?.status) {
    case "seen":
      message.sender._id !== currentUser?._id && type === "onFriendListCard"
        ? (statusDiv =
            //   <div className="h-5 w-5 relative m-1">
            //     <Image
            //       height={15}
            //       width={15}
            //       className="rounded-full h-full w-full object-cover"
            //       alt={message.sender.username as any}
            //       src={message.sender.pic as any}
            //     />
            // </div>
            "")
        : (statusDiv = (
            <div className="h-5 w-5 relative m-1">
              <Image
                height={15}
                width={15}
                className="rounded-full h-full w-full object-cover"
                alt={message.sender.username as any}
                src={message.sender.pic as any}
              />
            </div>
          ));
      break;
    case "delivered":
      message.sender._id !== currentUser?._id && type === "onFriendListCard"
        ? (statusDiv = (
            <div className="h-7 w-7 relative m-1 rounded-full bg-sky-500 flex items-center justify-center">
              <span className="text-gray-900 absolute text-[10px]">
                {unseenMessagesCount > 0
                  ? unseenMessagesCount > 99
                    ? "99+"
                    : unseenMessagesCount
                  : ""}
              </span>
              {/* <IoIosCheckmarkCircle className="h-5 w-5 relative  text-sky-600" /> */}
            </div>
          ))
        : (statusDiv = (
            <div className="h-5 w-5 relative m-1">
              <IoIosCheckmarkCircle className="h-5 w-5 relative text-gray-400" />
            </div>
          ));
      break;
    case "unseen":
      statusDiv = (
        <div className="h-5 w-5 relative m-1">
          <IoIosCheckmarkCircleOutline className="h-5 w-5 text-gray-400 rounded-full relative" />
        </div>
      );
      break;
    default:
      statusDiv = (
        <div className="h-5 w-5 relative">
          {/* Render default content or handle additional statuses */}
        </div>
      );
      break;
  }

  return statusDiv;
};
