import client from './client';

export const login = (formData) => client.post('/auth/login', formData);
export const signup = (formData) => client.post('/auth/register', formData);
export const getCurrentUser = () => client.get('/auth/me');
