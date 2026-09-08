import { managerControllerHandleManagerAuth } from "@/shared/model/petstore";

type AuthPayload = Parameters<typeof managerControllerHandleManagerAuth>[0];

export const authApi = async (payload: AuthPayload): Promise<boolean> => {
  try {
    const data = await managerControllerHandleManagerAuth(payload);
    const token = data.status === 200 ? data.data.meta.jwt : undefined;
    if (!token) {
      return false;
    }
    localStorage.setItem("token", token);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
