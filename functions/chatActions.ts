import { axiosClient } from "@/config/AxiosConfig";
export const accessChats = async (body: any) => {
  //body users and group name
  const { data } = await axiosClient.post(`/accessChats`, body, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
export const getChats = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axiosClient.get(
    `/fetchChats?search=${queryKey[1]}&skip=${pageParam}&limit=${10}`,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};
//create group

export const createGroup = async (data: any) => {
  const { data: groupData } = await axiosClient.post(`/group`, data, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return groupData;
};

//rename
export const renameGroup = async (id: string) => {
  const { data } = await axiosClient.put(`/rename/${id}}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//remove
export const removeFromGroup = async (id: string) => {
  const { data } = await axiosClient.put(`/removefromgroup/${id}}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//addTo group
export const addToGroup = async (id: string) => {
  const { data } = await axiosClient.put(`/addTogroup/${id}}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};


//Delete Single Chat
export const deleteSingleChat = async (id: string) => {
  const { data } = await axiosClient.delete(`/deleteSingleChat/${id}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
