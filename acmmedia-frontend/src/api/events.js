import client from './client';

export const fetchEvents = () => client.get('/events');
export const createEvent = (data) => client.post('/events', data);
export const deleteEvent = (id) => client.delete(`/events/${id}`);
