import { axiosClient } from "@/config/AxiosConfig";
//all Messages
export const allMessages = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axiosClient.get(
    `/allMessages/${queryKey[1]}?skip=${pageParam}&limit=${10}`,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};
// export const allMessages = async (chatId: string) => {
//   const { data } = await axiosClient.get(`/allMessages/${chatId}`, {
//     headers: { "Content-Type": "application/json" },
//     withCredentials: true,
//   });
//   const messages = data.messages;
//   return messages;
// };
//sent message
export const sentMessage = async (body: any) => {
  const { data } = await axiosClient.post(`/sentMessage`, body, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};


type TupdateStatus = {
  chatId: string;
  status: string;
}

//update  message status
export const updateMessageStatus = async (body: TupdateStatus) => {
  const { data } = await axiosClient.patch(`/updateMessageStatus`, body, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//update all  message status
export const updateAllMessageStatusAsSeen = async (chatId:string) => {
  const { data } = await axiosClient.put(`/updateMessageStatusSeen/${chatId}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//update all  message status as Delivered
export const updateAllMessageStatusAsDelivered = async (userId: string) => {
  const { data } = await axiosClient.put(`/updateMessageStatusDelivered/${userId}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
