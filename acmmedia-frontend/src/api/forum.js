import client from "./client";

export const fetchThreads = (params = {}) => client.get("/discussions", { params });
export const fetchThread = (id) => client.get(`/discussions/${id}`);
export const fetchCommunityMeta = () => client.get("/discussions/meta");
export const createThread = (data) => client.post("/discussions", data);
export const deleteThread = (id) => client.delete(`/discussions/${id}`);
export const replyToThread = (id, data) => client.post(`/discussions/${id}/replies`, data);
export const likeThread = (id) => client.post(`/discussions/${id}/like`);
export const likeReply = (replyId) => client.post(`/discussions/replies/${replyId}/like`);
export const moderateThread = (id, data) => client.patch(`/discussions/${id}/moderation`, data);
