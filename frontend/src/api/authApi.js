import axiosInstance from './axiosInstance.js';

/**
 * POST /api/auth/login
 */
export const login = (email, password, role) =>
  axiosInstance.post('/api/auth/login', { email, password, role });

/**
 * POST /api/auth/signup
 */
export const signup = (name, email, password, role) =>
  axiosInstance.post('/api/auth/signup', { name, email, password, role });

/**
 * POST /api/auth/logout
 */
export const logout = () =>
  axiosInstance.post('/api/auth/logout');

/**
 * GET /api/auth/me
 */
export const getMe = () =>
  axiosInstance.get('/api/auth/me');

/**
 * GET /api/auth/check-email?email=...
 */
export const checkEmail = (email) =>
  axiosInstance.get('/api/auth/check-email', { params: { email } });
