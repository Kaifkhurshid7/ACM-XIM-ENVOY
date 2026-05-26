import client from './client';

export const fetchComments = (postId) => client.get(`/comments/${postId}`);
export const addComment = (data) => client.post('/comments', data);
export const deleteComment = (id) => client.delete(`/comments/${id}`);
