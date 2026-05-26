import client from './client';

export const fetchExternalNews = () => client.get('/external-news');
