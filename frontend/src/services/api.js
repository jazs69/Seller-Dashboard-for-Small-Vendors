import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend.onrender.com/api'
    : '/api'
});

// Add a request interceptor to add auth token to requests
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);
export const getCurrentUser = () => API.get('/auth/user');
export const updateProfile = (profileData) => API.put('/auth/profile', profileData);
export const changePassword = (passwordData) => API.put('/auth/password', passwordData);

// Orders API calls
export const getOrders = () => API.get('/orders');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const getOrderById = (id) => API.get(`/orders/${id}`); // Alias for getOrder
export const createOrder = (orderData) => API.post('/orders', orderData);
export const updateOrder = (id, orderData) => API.put(`/orders/${id}`, orderData);
export const deleteOrder = (id) => API.delete(`/orders/${id}`);
export const getInvoice = (id) => API.get(`/orders/invoice/${id}`, { responseType: 'blob' });
export const generateInvoice = (id) => API.get(`/orders/invoice/${id}`, { responseType: 'blob' }); // Alias for getInvoice

// Stock API calls
export const getStock = () => API.get('/stock');
export const getStockItems = () => API.get('/stock'); // Alias for getStock
export const getLowStock = () => API.get('/stock/low');
export const getStockItem = (id) => API.get(`/stock/${id}`);
export const getStockItemById = (id) => API.get(`/stock/${id}`); // Alias for getStockItem
export const createStockItem = (stockData) => API.post('/stock', stockData);
export const updateStockItem = (id, stockData) => API.put(`/stock/${id}`, stockData);
export const deleteStockItem = (id) => API.delete(`/stock/${id}`);
export const updateStockQuantity = (id, quantityData) => API.put(`/stock/${id}/quantity`, quantityData);

// Dashboard API calls
export const getDashboardSummary = () => API.get('/dashboard/summary');
export const getSalesChart = (period) => API.get(`/dashboard/sales-chart?period=${period}`);
export const getInventoryStatus = () => API.get('/dashboard/inventory-status');

// Reports API calls
export const getSalesReport = (timeframe = 'month') => API.get(`/reports/sales?timeframe=${timeframe}`);
export const getInventoryReport = (sortBy = 'value') => API.get(`/reports/inventory?sortBy=${sortBy}`);
export const getLowStockReport = () => API.get('/reports/low-stock');

export default API;