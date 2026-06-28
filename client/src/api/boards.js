import api from './axios';

export const getBoards = () => api.get('/boards');
export const createBoard = (data) => api.post('/boards', data);
export const getBoard = (id) => api.get(`/boards/${id}`);
export const updateBoard = (id, data) => api.put(`/boards/${id}`, data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`);