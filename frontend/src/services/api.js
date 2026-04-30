import axios from 'axios';

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://efficient-strength-production-03fc.up.railway.app/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pms_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("API ERROR:", err?.response?.data || err.message); // DEBUG

    if (err.response?.status === 401) {
      localStorage.removeItem('pms_token');
      localStorage.removeItem('pms_user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;