import type { User } from '../types';

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const storeAuthData = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  return !!token;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateGitHubLink = (url: string): boolean => {
  if (!url.trim()) return true; // Optional field
  const githubRegex = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/commit\/[a-f0-9]{40}$/i;
  return githubRegex.test(url);
};