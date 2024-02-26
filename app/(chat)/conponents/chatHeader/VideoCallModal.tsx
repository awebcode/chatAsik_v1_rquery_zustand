import { useChatContext } from "@/context/ChatContext/ChatContextProvider";
import dynamic from "next/dynamic";

import Peer from "@/context/peer/Peer";
import { useVidoeCallStore } from "@/store/useCallStore";
import { useChatStore } from "@/store/useChat";
import { useUserStore } from "@/store/useUser";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
const ReactPlayer = dynamic(() => import("react-player"));

const VideoCallModal = ({ openVideoCall, setOpenVideoCall, isUserOnline }: any) => {
  const { selectedChat, setSelectedChat } = useChatStore();
  const { currentUser } = useUserStore();
  const { socket } = useChatContext();

  const {
    IncomingOffer,
    setIncomingOffer,
    clearIncomingOffer,
    isRejected,
    setRemoteStream,
    remoteStream,
    localStream,
    setLocalStream,
  } = useVidoeCallStore();
  //handle call to user
  const handleCallUser = useCallback(async () => {
    try {
      const mediaDevices =
        navigator.mediaDevices ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia;
      if (!mediaDevices) {
        throw new Error("getUserMedia is not supported");
      }

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      const offer = await Peer.getOffer();
      if (socket) {
        const socketData = { to: selectedChat?.userId, offer, user: currentUser, chatId:selectedChat?.chatId };
        socket.emit("user:call", socketData);
      }

      setLocalStream(stream);
    } catch (error) {
      console.error("Error in handleCallUser:", error);
      // Handle error as needed
    }
  }, [socket, selectedChat, setLocalStream]);

  const handleRejectedCall = ({ user }: any) => {
    useVidoeCallStore.setState({ isRejected: true, rejectBy: user });
    setOpenVideoCall(false);
  };

  //reject own Call

  const rejectCall = () => {
    socket.emit("call:rejected", { to: selectedChat?.userId, user: currentUser });
    setLocalStream(null);
    setOpenVideoCall(false);
  };
  const sendStreams = useCallback(() => {
    console.log({ localStream });
    for (const track of localStream?.getTracks()) {
      Peer.peer.addTrack(track, localStream);
    }
  }, [localStream]);

  const handleCallAccepted = useCallback(
    async({ from, ans }: any) => {
     await Peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  useEffect(() => {
    Peer.peer.addEventListener("track", async (ev: any) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  //negotiationNeeded
   const handleNegoNeeded = useCallback(async () => {
     const offer = await Peer.getOffer();
     socket.emit("peer:nego:needed", { offer, to: selectedChat?.userId,user:currentUser });
   }, [socket]);

   useEffect(() => {
     Peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
     return () => {
       Peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
     };
   }, [handleNegoNeeded]);
  //side effects
  useEffect(() => {
    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:rejected", handleRejectedCall);
    return () => {
      socket.off("call:rejected", handleRejectedCall);
      socket.on("call:accepted", handleCallAccepted);
    };
  }, []);

  return (
    <div
      className={`z-50 fixed max-w-md w-full p-10 left-1/2 top-[100px] transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-md shadow-lg transition-transform duration-200 ring-2 ring-blue-500 ${
        openVideoCall
          ? "translate-y-0 opacity-100 scale-100"
          : "opacity-0 scale-50 translate-y-full"
      }`}
    >
      <div className="flexCenter flex-col gap-6 mb-8">
        {localStream ? (
          <h1 className="text-lg md:text-xl text-white">
            You are calling {selectedChat?.username}!
          </h1>
        ) : (
          <h1 className="text-lg md:text-xl text-white">
            Call to {selectedChat?.username}!
          </h1>
        )}

        <div className="relative h-20 w-20 rounded-full overflow-hidden ring-4 ring-blue-500">
          <Image
            src={selectedChat?.pic as any}
            alt={selectedChat?.username as any}
            height={80}
            width={80}
            loading="lazy"
            className="object-cover h-full w-full rounded-full"
          />
          <span
            className={`absolute bottom-0 right-0 rounded-full p-[10px] ${
              isUserOnline ? "bg-green-500" : "bg-rose-500"
            }`}
          ></span>
        </div>

        {localStream && (
          <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
            <ReactPlayer
              playing
              muted
              controls={true}
              config={{
                file: {
                  attributes: {
                    controlsList:
                      "fullscreen nodownload noremoteplayback disablepictureinpicture ",
                  },
                },
              }}
              height="auto"
              width="100%"
              url={localStream}
              previewTabIndex={10}
              style={{ borderRadius: "8px" }}
            />
          </div>
        )}
        {remoteStream && (
          <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
            <ReactPlayer
              playing
              muted
              controls={true}
              config={{
                file: {
                  attributes: {
                    controlsList:
                      "fullscreen nodownload noremoteplayback disablepictureinpicture ",
                  },
                },
              }}
              height="auto"
              width="100%"
              url={remoteStream}
              previewTabIndex={10}
              style={{ borderRadius: "8px" }}
            />
          </div>
        )}

        {selectedChat?.status !== "blocked" ? (
          <>
            {localStream ? (
              <button
                onClick={() => rejectCall()}
                className="btn capitalize text-xl w-full bg-rose-500 hover:bg-rose-700"
              >
                End Call
              </button>
            ) : (
              <button
                onClick={() => handleCallUser()}
                className="btn capitalize text-xl w-full bg-blue-500 hover:bg-blue-700"
              >
                Start Video Call
              </button>
            )}
          </>
        ) : (
          <button
            className="btn capitalize text-xl w-full bg-rose-500 hover:bg-rose-700"
            disabled
          >
            {selectedChat.username} Blocked You!
          </button>
        )}
      </div>

      <button
        className="absolute bottom-4 right-4 btn capitalize text-lg"
        onClick={() => setOpenVideoCall(false)}
      >
        Close Call
      </button>
    </div>
  );
};

export default VideoCallModal;
