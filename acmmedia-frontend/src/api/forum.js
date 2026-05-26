import client from './client';

export const fetchThreads = () => client.get('/forum');
export const createThread = (data) => client.post('/forum', data);
export const deleteThread = (id) => client.delete(`/forum/${id}`);
export const replyToThread = (id, data) => client.post(`/forum/reply/${id}`, data);
