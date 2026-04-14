import { apiClient } from '@/lib/apiClient';

export const adminService = {
  // --- USER MANAGEMENT ---
  getUsers: async () => {
    const res = await apiClient.get('/admin-bff/users');
    return res.data;
  },

  // --- REVIEW MANAGEMENT ---
  getReviews: async () => {
    const res = await apiClient.get('/admin-bff/reviews');
    return res.data;
  },

  respondToReview: async (reviewId: number | string, response: string) => {
    const res = await apiClient.post(`/admin-bff/reviews/${reviewId}/respond?response=${response}`);
    return res.data;
  },

  // --- ORDER MANAGEMENT ---
  getOrders: async () => {
    const res = await apiClient.get('/admin-bff/orders');
    return res.data;
  },

  updateOrderStatus: async (id: number | string, status: string) => {
    const res = await apiClient.put(`/admin-bff/orders/${id}/status?status=${status}`);
    return res.data;
  },

  // --- DASHBOARD STATS ---
  getStats: async () => {
    // In a real app, this might be a single endpoint. 
    // Here we can fetch from multiple if needed, but let's assume a BFF endpoint.
    // For now, let's mock the stats based on actual list lengths if needed, 
    // or just fetch from a summary endpoint if it exists.
    const [users, orders, products] = await Promise.all([
      apiClient.get('/admin-bff/users').then(r => r.data),
      apiClient.get('/admin-bff/orders').then(r => r.data),
      apiClient.get('/admin-bff/products').then(r => r.data)
    ]);

    return {
      totalUsers: Array.isArray(users) ? users.length : 0,
      totalOrders: Array.isArray(orders) ? orders.length : 0,
      totalProducts: Array.isArray(products) ? products.length : 0,
      totalRevenue: Array.isArray(orders) ? orders.reduce((acc: number, o: any) => acc + (o.totalPrice || 0), 0) : 0
    };
  },

  // --- PAYMENT MANAGEMENT ---
  getPaymentConfig: async () => {
    const res = await apiClient.get('/admin-bff/payments/config');
    return res.data;
  },

  updatePaymentConfig: async (configData: any) => {
    const res = await apiClient.put('/admin-bff/payments/config', configData);
    return res.data;
  }
};
