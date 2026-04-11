import axios from 'axios';
import CONFIG from '../config';

const api = axios.create({
  baseURL: CONFIG.API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMenu = () => api.get('/menu');
export const addMenuItem = (data) => api.post('/menu', data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);
export const placeOrder = (data) => api.post('/orders', data);
export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const markOrderPaid = (id) => api.put(`/orders/${id}/pay`);
export const createBatch = (orderIds) => api.post('/batches', { orderIds });
export const getBatches = () => api.get('/batches');
export const completeBatch = (id) => api.put(`/batches/${id}/complete`);
export const loginAdmin = (data) => api.post('/auth/login', data);
export const submitFeedback = (data) => api.post('/feedback', data);
export const getFeedback = () => api.get('/feedback');