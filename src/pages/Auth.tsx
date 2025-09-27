import React, { useState } from 'react';
import { register, login as loginApi } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// ...existing code...
import { validateEmail, validatePassword, validateRequired } from '../utils/auth';
import './Auth.css';

type AuthMode = 'login' | 'register';

interface FormData {
  email: string;
  password: string;
  name: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  general?: string;
}

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validateRequired(formData.password)) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (mode === 'register' && !validateRequired(formData.name)) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let response;
      if (mode === 'register') {
        response = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
                // Registration does not return user/token, so just show success or auto-login
        if (response.status === 201) {
          // Optionally, auto-login after registration
          const loginResp = await loginApi({ email: formData.email, password: formData.password });
          const { token, user } = loginResp.data;
          login(token, user);
          navigate(from, { replace: true });
        }
      } else {
        response = await loginApi({ email: formData.email, password: formData.password });
        const { token, user } = response.data;
        login(token, user);
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error(`${mode} error:`, error);
      setErrors({
        general: error.response?.data?.error || `${mode} failed. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    // Bypass API and login with mock data for testing
    const mockUser = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
    };
    const mockToken = 'mock-jwt-token-for-testing';
    
    login(mockToken, mockUser);
    navigate(from, { replace: true });
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setErrors({});
    setFormData({
      email: '',
      password: '',
      name: '',
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Mini DevLog</h1>
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>

          <button
            type="button"
            onClick={handleTestLogin}
            className="test-login-btn"
            disabled={loading}
          >
            🚀 Quick Test Login
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-btn"
              disabled={loading}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};