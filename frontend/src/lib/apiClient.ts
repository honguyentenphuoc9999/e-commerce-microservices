import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Lấy API Gateway URL từ biến môi trường
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Token xác thực nếu có
apiClient.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || '';
    const isAuthRequest =
      requestUrl.includes('/accounts/login') ||
      requestUrl.includes('/accounts/registration');

    // Với CSR (Client-side rendering), an toàn nhất là lấy từ localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && !isAuthRequest) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else if (config.headers?.Authorization) {
        delete config.headers.Authorization;
      }

      // Xử lý giỏ hàng riêng biệt (Guest Cart)
      let cartId = localStorage.getItem('cartId');
      if (!cartId) {
        cartId = 'GUEST_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('cartId', cartId);
      }
      config.headers['cartId'] = cartId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Biến để ngăn chặn việc gọi chuyển hướng nhiều lần cùng một lúc
let isRedirecting = false;

// Response Interceptor: Bắt lỗi Global (nhân diện token hết hạn)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !isRedirecting) {
        const token = localStorage.getItem('token');

        // Chỉ thực hiện logout nếu thực sự đang có token (tránh loop khi trang không cần token cũng lỗi 401)
        if (token) {
          isRedirecting = true;
          console.warn("Token hết hạn hoặc không hợp lệ (401). Đang tự động đăng xuất...");

          // Xóa token ngay lập tức khỏi localStorage và instance hiện tại
          localStorage.removeItem('token');
          delete apiClient.defaults.headers.common['Authorization'];

          // Gọi hàm logout từ store để xóa sạch state
          useAuthStore.getState().logout();

          // Chuyển hướng người dùng về trang chủ (sử dụng replace để tránh lỗi Back button)
          window.location.replace('/');
        }
      }
    }
    return Promise.reject(error);
  }
);
