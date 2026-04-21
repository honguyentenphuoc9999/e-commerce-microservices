import { apiClient } from '@/lib/apiClient';

export const adminService = {
  // --- USER MANAGEMENT ---
  getUsers: async () => {
    const res = await apiClient.get('/admin-bff/users');
    return res.data;
  },

  updateUser: async (id: number | string, userData: any) => {
    const res = await apiClient.put(`/admin-bff/users/${id}`, userData);
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
  },

  // --- PRODUCT MANAGEMENT ---
  getProducts: async () => {
    const res = await apiClient.get('/admin-bff/products');
    return res.data;
  },

  // --- EMAIL MANAGEMENT ---
  getEmails: async () => {
    // Vì notification-service thường không lưu DB, chúng ta lấy từ lịch sử đơn hàng 
    // để giả lập các email "Xác nhận đơn hàng" đã gửi đi.
    const res = await apiClient.get('/admin-bff/orders');
    const orders = res.data;
    
    if (!Array.isArray(orders)) return [];
    
    return orders.map((o: any) => ({
      id: `MSG-${1000 + o.id}`,
      subject: `Xác nhận đơn hàng #${o.id}`,
      recipient: o.user?.userName || o.user?.email || "Khách ẩn danh",
      date: new Date(o.orderDate || Date.now()).toLocaleDateString('vi-VN'),
      rawDate: o.orderDate || Date.now(),
      status: o.status === 'CANCELLED' ? "Lỗi" : "Đã gửi",
      statusColor: o.status === 'CANCELLED' 
        ? "text-rose-400 bg-rose-400/10 border-rose-400/20" 
        : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    }));
  }
};
