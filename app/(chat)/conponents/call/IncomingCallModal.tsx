import { useChatContext } from "@/context/ChatContext/ChatContextProvider";
import Peer from "@/context/peer/Peer";
import { useVidoeCallStore } from "@/store/useCallStore";
import { useUserStore } from "@/store/useUser";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";

const IncomingCallModal = () => {
  const Router = useRouter();
  const { currentUser } = useUserStore();
  const { socket } = useChatContext();
  const {
    IncomingOffer,
    setIncomingOffer,
    clearIncomingOffer,
    localStream,
    setLocalStream,
  } = useVidoeCallStore();
  //accept call handler
  const sendStreams = useCallback(() => {
    for (const track of localStream.getTracks()) {
      Peer.peer.addTrack(track, localStream);
    }
  }, [localStream]);
  const acceptCallHandler = useCallback(async () => {
    if (!IncomingOffer) return;

    const ans = await Peer.getAnswer(IncomingOffer.offer);
    socket.emit("call:accepted", { to: IncomingOffer.from, ans, user: currentUser });
    Router.push(`/Chat/callpage/${IncomingOffer.chatId}`);
  }, [IncomingOffer]);

  //reject call handler
  const rejectCallHandler = useCallback(async () => {
    if (!IncomingOffer) return;
    const ans = await Peer.getAnswer(IncomingOffer.offer);
    socket.emit("call:rejected", { to: IncomingOffer.from, ans, user: currentUser });
    setIncomingOffer(null);
  }, [IncomingOffer]);
  return (
    <div
      className={`z-50 fixed max-w-md w-full p-8 left-1/2 top-[20%] transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 ring-2 ring-blue-500 text-gray-100 rounded-md shadow-lg duration-500 ${
        IncomingOffer ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
      }`}
    >
      <div className="flexCenter flex-col gap-4 w-full p-4">
        <h1 className="text-2xl font-bold text-blue-500">
          {IncomingOffer?.user?.username} is calling you
        </h1>

        <div className="relative h-20 w-20 rounded-full overflow-hidden ring-4 ring-blue-500">
          <Image
            src={IncomingOffer?.user?.pic as any}
            alt={IncomingOffer?.user?.username as any}
            height={100}
            width={100}
            loading="lazy"
            className="object-cover h-full w-full rounded-full"
          />
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button className="btn bg-green-500" onClick={() => acceptCallHandler()}>
            Accept
          </button>
          <button className="btn bg-rose-500" onClick={() => rejectCallHandler()}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
