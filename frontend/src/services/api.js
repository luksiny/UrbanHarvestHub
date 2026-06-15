import axios from 'axios';

// In development (port 3000), use relative /api so the CRA proxy forwards to the backend (5000)
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (process.env.NODE_ENV === 'production') return '/api';
  if (typeof window !== 'undefined' && window.location.port === '3000') return '/api';
  return 'http://127.0.0.1:5000/api';
};
const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout to accommodate free tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Workshops API
export const workshopsAPI = {
  getAll: (params) => api.get('/workshops', { params }),
  getById: (id) => api.get(`/workshops/${id}`),
  create: (data, token) => api.post('/workshops', data, { headers: { Authorization: `Bearer ${token}` } }),
  update: (id, data, token) => api.put(`/workshops/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  delete: (id, token) => api.delete(`/workshops/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data, token) => api.post('/products', data, { headers: { Authorization: `Bearer ${token}` } }),
  update: (id, data, token) => api.put(`/products/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  delete: (id, token) => api.delete(`/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data, token) => api.post('/events', data, { headers: { Authorization: `Bearer ${token}` } }),
  update: (id, data, token) => api.put(`/events/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  delete: (id, token) => api.delete(`/events/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getById: (id) => api.get(`/orders/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getByTarget: (type, id) => api.get(`/reviews/${type}/${id}`),
  create: (data, token) => api.post('/reviews', data, { headers: { Authorization: `Bearer ${token}` } }),
};

// Subscriptions API
export const subscriptionsAPI = {
  getMySubscriptions: (token) => api.get('/subscriptions/my-subscriptions', { headers: { Authorization: `Bearer ${token}` } }),
  create: (data, token) => api.post('/subscriptions', data, { headers: { Authorization: `Bearer ${token}` } }),
  updateStatus: (id, status, token) => api.patch(`/subscriptions/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } }),
};

// Users API
export const usersAPI = {
  login: (email, password) => api.post('/users/login', { email, password }),
  register: (name, email, password) => api.post('/users/register', { name, email, password }),
  getProfile: (token) => api.get('/users/profile', { headers: { Authorization: `Bearer ${token}` } }),
};

// Admin API (JWT in header via interceptor or per-call)
export const adminAPI = {
  login: (email, password) => api.post('/admin/login', { email, password }),
  getStats: (token) => api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
  getOrders: (token) => api.get('/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
  updateOrderStatus: (orderId, status, token) =>
    api.patch(`/admin/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } }),
};

export default api;
