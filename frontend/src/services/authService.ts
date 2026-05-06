import { apiClient } from '@/lib/apiClient';

export const authService = {
  login: async (credentials: any) => {
    // POST /api/accounts/login
    // Expecting body: { userName: "...", userPassword: "..." }
    const res = await apiClient.post('/accounts/login', credentials);
    return res.data; // Thường trả về chuỗi Token hoặc Object chứa Token
  },

  register: async (userData: any) => {
    // POST /api/accounts/registration
    const res = await apiClient.post('/accounts/registration', userData);
    return res.data;
  },

  getProfile: async (userId: string | number) => {
    // GET /api/accounts/users/{id}
    const res = await apiClient.get(`/accounts/users/${userId}`);
    return res.data;
  },

  updateProfile: async (userId: string | number, data: any) => {
    // PUT /api/accounts/users/{id}
    const res = await apiClient.put(`/accounts/users/${userId}`, data);
    return res.data;
  }
};
