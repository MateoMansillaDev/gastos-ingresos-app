import axios from 'axios';

// Use different base URL for Electron vs web development
const isElectron = (window as any).process && (window as any).process.versions && (window as any).process.versions.electron;
const API_URL = isElectron ? 'http://localhost:3000/api' : '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Override the authorization header handling for Electron
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // For Electron, we need to pass the userId in Authorization header
    // since the backend in Electron is simplified
    if (isElectron) {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      if (userId) {
        config.headers.Authorization = userId;
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password })
};

// Transactions
export const transactionsAPI = {
  create: (data: { type: string; amount: number; category: string; description: string }) =>
    api.post('/transactions', data),
  getAll: () => api.get('/transactions'),
  delete: (id: string) => api.delete(`/transactions/${id}`),
  getBalance: () => api.get('/transactions/balance')
};

// Automatic Rules
export const automaticRulesAPI = {
  create: (data: {
    type: string;
    amount: number;
    category: string;
    description: string;
    frequency: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  }) => api.post('/automatic-rules', data),
  getAll: () => api.get('/automatic-rules'),
  update: (id: string, data: any) => api.put(`/automatic-rules/${id}`, data),
  delete: (id: string) => api.delete(`/automatic-rules/${id}`),
  execute: () => api.post('/automatic-rules/execute')
};