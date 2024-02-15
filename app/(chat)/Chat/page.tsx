"use client";
import React, { useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
// Import components dynamically
const Topbar = dynamic(() => import("../conponents/Topbar"));
const LeftSide = dynamic(() => import("../conponents/LeftSide"));
const MainChat = dynamic(() => import("../conponents/MainChat"));
const EmptyChat = dynamic(() => import("../conponents/EmptyChat"));
import { useChatStore } from "@/store/useChat";

import { useRouter } from "next/navigation";
import { useChatContext } from "@/context/ChatContext/ChatContextProvider";
import { useUserStore } from "@/store/useUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTypingStore } from "@/store/useTyping";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import {
  updateAllMessageStatusAsDelivered,
  updateMessageStatus,
} from "@/functions/messageActions";

const Chat = () => {
  const { currentUser } = useUserStore();

  const router = useRouter();
  const queryclient = useQueryClient();
  const { startTyping, stopTyping } = useTypingStore();
  const { addOnlineUser, onlineUsers } = useOnlineUsersStore();
  const { socket } = useChatContext();
  const { selectedChat } = useChatStore();
  const selectedChatRef = useRef(selectedChat);
  const onlineUsersRef = useRef(onlineUsers);
  // Update the reference whenever selectedChat changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
    onlineUsersRef.current = onlineUsers;
  }, [selectedChat, onlineUsers]);
  const updateStatusMutation = useMutation({
    mutationKey: ["messages"],
    mutationFn: (data: any) => updateMessageStatus(data),
    onSuccess: (data) => {
      const receiver = data.chat?.users.find((u: any) => u._id !== currentUser?._id);
      const deliverData = {
        senderId: currentUser?._id,
        receiverId: receiver?._id,
        chatId: data.chat?._id,
        pic: currentUser?.pic,
      };
      socket.emit("deliveredMessage", deliverData);
      queryclient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const updateStatusAsDeliveredMutationAfterRejoined = useMutation({
    mutationKey: ["messages"],
    mutationFn: () => updateAllMessageStatusAsDelivered(currentUser?._id as any),
    onSuccess: (data) => {
      const deliverData = {
        senderId: currentUser?._id,
        pic: currentUser?.pic,
      };
      socket.emit("deliveredAllMessageAfterReconnect", deliverData);
      queryclient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
  // console.log({ selectedChat});
  const handleSocketMessage = useCallback((data: any) => {
    //  if (data.receiverId === currentUser?._id) {
      queryclient.invalidateQueries({ queryKey: ["messages"] });
    //  }
    // console.log({ data }, selectedChat);
    if (data.senderId === selectedChatRef.current?.userId) {
      console.log({ seenMessageCallback: data });
      const updateStatusData = {
        chatId: selectedChatRef.current?.chatId,
        status: "seen",
      };
      updateStatusMutation.mutateAsync(updateStatusData);
    } else if (
      data.receiverId === currentUser?._id &&
      onlineUsersRef.current.some((user: any) => user.id === currentUser?._id)
    ) {
      // console.log({ deliveredMessageCallback: data });
      const updateStatusData = {
        chatId: data?.chatId,
        status: "delivered",
      };
      updateStatusMutation.mutateAsync(updateStatusData);
    }
  }, []);
  const handleTyping = useCallback((data: any) => {
    // if (data.receiverId === currentUser?._id) {
      startTyping(data.senderId, data.receiverId, data.chatId,data.content);
    // }
  }, []);
  const handleStopTyping = useCallback((data: any) => {
    // if (data.receiverId === currentUser?._id) {
      stopTyping();
    // }
  }, []);

  const handleOnlineUsers = useCallback((users: any) => {
    if (users) {
      addOnlineUser(users);
    }
  }, []);

  const handleDeliverMessage = useCallback((data: any) => {
    // if (data.senderId === currentUser?._id) {
    queryclient.invalidateQueries({ queryKey: ["messages"] });
    // }
  }, []);
  useEffect(() => {
    updateStatusAsDeliveredMutationAfterRejoined.mutateAsync();
  }, [currentUser]);

  const handleAllDeliveredAfterReconnect = useCallback((data: any) => {
    console.log({ handleAllDeliveredAfterReconnect: data });
    queryclient.invalidateQueries({ queryKey: ["messages"] });
  }, []);
  useEffect(() => {
    // Add event listeners
    socket.on("receiveMessage", handleSocketMessage);
    socket.on("receiveDeliveredMessage", handleDeliverMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    socket.on("setup", handleOnlineUsers);

    socket.on(
      "receiveDeliveredAllMessageAfterReconnect",
      handleAllDeliveredAfterReconnect
    );

    // Emit "setup" event when the component mounts
    const setupData = {
      id: currentUser?._id,
    };
    socket.emit("setup", setupData);

    // Clean up event listeners when the component unmounts
    return () => {
      socket.off("setup", handleOnlineUsers);
      socket.off("receiveMessage", handleSocketMessage);
      socket.off("receiveDeliveredMessage", handleDeliverMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off(
        "receiveDeliveredAllMessageAfterReconnect",
        handleAllDeliveredAfterReconnect
      );
    };
  }, []); //
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    }
  }, []);
  return (
    <div className="p-1">
      <Topbar />
      <div className="flex">
        {" "}
        <LeftSide />
        <div className="basis-3/4">{selectedChat ? <MainChat /> : <EmptyChat />}</div>
      </div>
    </div>
  );
};

export default Chat;
