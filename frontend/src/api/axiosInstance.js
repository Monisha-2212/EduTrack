import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '',          // Vite dev proxy handles /api → localhost:3000
  withCredentials: true, // Send httpOnly cookies on every request
});

// ─── Response interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isLoginPage = window.location.pathname === '/login';

    // If the server responds with 401 and we're not already on /login, redirect
    if (status === 401 && !isLoginPage) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
