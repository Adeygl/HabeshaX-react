import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', // ⚠️ CHANGE THIS if needed
  timeout: 10000,
});

// ✅ Add token safely
API.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      alert("Token error: " + (e as any).message);
    }
    return config;
  },
  (error) => {
    alert("Request error: " + error.message);
    return Promise.reject(error);
  }
);

// ✅ Global response error handler (IMPORTANT)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Unknown error";

    if (error.response) {
      message = error.response.data?.message || "Server error";
    } else if (error.request) {
      message = "No response from server (check backend)";
    } else {
      message = error.message;
    }

    alert("API Error: " + message);

    return Promise.reject(error);
  }
);

export default API;