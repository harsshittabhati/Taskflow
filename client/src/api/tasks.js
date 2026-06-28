import api from './axios';

export const getTasks = (boardId) => api.get(`/tasks/board/${boardId}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const suggestEstimate = (data) => api.post('/ai/suggest', data);