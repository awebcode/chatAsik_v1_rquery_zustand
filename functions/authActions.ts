import { axiosClient } from "@/config/AxiosConfig";

export const registerUser = async (formdata: any) => {
  const { data } = await axiosClient.post("/register", formdata, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return data;
};

export const loginUser = async (formdata: any) => {
  const { data } = await axiosClient.post("/login", formdata, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

export const getAllUsers = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axiosClient.get(
    `/getUsers?search=${queryKey[1]}&skip=${pageParam}&limit=${10}`,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};


