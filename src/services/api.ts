import axios, { type AxiosResponse } from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  DailyEntry, 
  CreateDailyEntryRequest, 
  UpdateDailyEntryRequest 
} from '../types';

const API_BASE_URL = 'http://localhost:3001'; // Adjust this to your backend URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Daily entries API calls
export const dailyEntriesAPI = {
  getAll: async (): Promise<DailyEntry[]> => {
    const response: AxiosResponse<DailyEntry[]> = await api.get('/api/daily-entries');
    return response.data;
  },

  create: async (entryData: CreateDailyEntryRequest): Promise<DailyEntry> => {
    const response: AxiosResponse<DailyEntry> = await api.post('/api/daily-entries', entryData);
    return response.data;
  },

  update: async (id: string, entryData: UpdateDailyEntryRequest): Promise<DailyEntry> => {
    const response: AxiosResponse<DailyEntry> = await api.put(`/api/daily-entries/${id}`, entryData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/daily-entries/${id}`);
  },
};

export default api;