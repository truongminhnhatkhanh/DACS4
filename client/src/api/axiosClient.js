import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cho phép trình duyệt gửi và nhận HttpOnly Cookie tự động
  headers: {
    'Content-Type': 'application/json'
  }
});

// Gắn thêm Authorization header nếu có token trong localStorage (lớp bảo vệ kép)
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('heli_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi phản hồi
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.reason || error.message || 'Lỗi kết nối máy chủ';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
