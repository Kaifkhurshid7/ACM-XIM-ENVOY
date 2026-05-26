import client from './client';

export const fetchPosts = () => client.get('/posts');
export const createPost = (data) => client.post('/posts', data);
export const likePost = (id) => client.put(`/posts/like/${id}`);
export const deletePost = (id) => client.delete(`/posts/${id}`);
