import { deleteSingleChat } from "@/functions/chatActions";
import { updateChatStatusAsBlockOUnblock } from "@/functions/messageActions";
import { useChatStore } from "@/store/useChat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useBlockMutation = () => {
  const queryClient = useQueryClient();
  const { setSelectedChat, selectedChat } = useChatStore();

  return useMutation({
    mutationFn: (data: any) => updateChatStatusAsBlockOUnblock(data),
    onSuccess: (data) => {
      console.log({ data });
      toast.success(data.status);
      setSelectedChat({
        ...selectedChat,
        status: data.status,
        chatUpdatedBy: { _id: data.updatedBy },
      } as any);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export const useDeleteSingleChatMutation = (chatId: string) => {
  const queryClient = useQueryClient();
  const { setSelectedChat, selectedChat } = useChatStore();
  return useMutation({
    mutationFn: () => deleteSingleChat(chatId),
    onSuccess: (data) => {
      toast.success("Chat deleted successfully!");
      setSelectedChat(null as any);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};
