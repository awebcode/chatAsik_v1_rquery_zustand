import { useChatContext } from "@/context/ChatContext/ChatContextProvider";
import { addRemoveEmojiReactions } from "@/functions/messageActions";
import { useChatStore } from "@/store/useChat";
import { useUserStore } from "@/store/useUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
export const useAddRemoveReactionMutation = () => {
  const { socket } = useChatContext();
  const queryClient = useQueryClient();
  const { selectedChat } = useChatStore();
  const { currentUser } = useUserStore();
  return useMutation({
    mutationFn: (reactionData: any) => addRemoveEmojiReactions(reactionData),
    onSuccess: (data) => {
      toast.success("React added successfully!");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      socket.emit("sentMessage", {
        senderId: currentUser?._id,
        receiverId: selectedChat?.userId,
      });
    },
  });
};
