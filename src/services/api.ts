import axios from 'axios';

const API_URL = 'https://devlog-1.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export const register = (data: RegisterData) => api.post('/auth/register', data);
export interface LoginData {
    email: string;
    password: string;
}

export const login = (data: LoginData) => api.post('/auth/login', data);

export interface ProfileData {
  name?: string;
  email?: string;
  password?: string;
  team?: string;
}

export const getProfile = () => api.get('/profile/me');
export const updateProfile = (profileData: { name: string; email: string; team?: string }) => api.put('/profile', profileData);

import type { CreateDailyEntryRequest } from '../types';

export const getEntries = () => api.get('/entries');
export const createEntry = (data: CreateDailyEntryRequest) => api.post('/entries', data);
export const deleteEntry = (id: string) => api.delete(`/entries/${id}`);
export const getEntry = (id: string) => api.get(`/entries/${id}`);
export const updateEntry = (id: string, data: CreateDailyEntryRequest) => api.put(`/entries/${id}`, data);

export const getStats = () => api.get('/analytics/stats');
export const getTeam = () => api.get('/analytics/team');
