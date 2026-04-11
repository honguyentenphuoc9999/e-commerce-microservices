import axios from 'axios';

// Lấy API Gateway URL từ biến môi trường
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY || 'http://localhost:8900/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Token xác thực nếu có
apiClient.interceptors.request.use(
  (config) => {
    // Với CSR (Client-side rendering), an toàn nhất là lấy từ localStorage (hoặc thư viện cookies tương tự)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Bắt lỗi Global (nhân diện token hết hạn)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ (401).");
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Có thể kích hoạt chuyển người dùng về trang đăng nhập bằng lệnh:
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
