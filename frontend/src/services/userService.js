import api from "./api";

export const getMyProfile = () => api.get("/auth/me");
export const updateAvatar = (avatar) =>
    api.patch("/users/avatar", { avatar });