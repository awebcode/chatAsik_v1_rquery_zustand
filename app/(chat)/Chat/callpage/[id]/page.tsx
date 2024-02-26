"use client";
import { useVidoeCallStore } from "@/store/useCallStore";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"));
const page = ({ params: { id } }: { params: { id: string } }) => {
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

  useEffect(() => {
    const fetchMedia = async () => {
      const mediaDevices =
        navigator.mediaDevices ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia;

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setLocalStream(stream);
    };
    return () => {
      fetchMedia();
    };
  }, []);
  return (
    <div className="text-white">
      <h1 className="text-4xl p-4">RoomId {id}</h1>{" "}
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
    </div>
  );
};

export default page;
