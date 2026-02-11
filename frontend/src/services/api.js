import axios from 'axios';

// In development (port 3000), use relative /api so the CRA proxy forwards to the backend (5000)
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (process.env.NODE_ENV === 'production') return 'https://urbanharvesthub.onrender.com/api'; // Primary fallback for production
  if (typeof window !== 'undefined' && window.location.port === '3000') return '/api';
  return 'http://localhost:5000/api';
};
const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
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
  create: (data) => api.post('/workshops', data),
  update: (id, data) => api.put(`/workshops/${id}`, data),
  delete: (id) => api.delete(`/workshops/${id}`),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
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

// Admin API (JWT in header via interceptor or per-call)
export const adminAPI = {
  login: (email, password) => api.post('/admin/login', { email, password }),
  getStats: (token) => api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
  getOrders: (token) => api.get('/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
  updateOrderStatus: (orderId, status, token) =>
    api.patch(`/admin/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } }),
};

export default api;
