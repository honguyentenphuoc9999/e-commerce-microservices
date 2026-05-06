import { apiClient } from '@/lib/apiClient';

export const adminService = {
  // --- USER MANAGEMENT ---
  getUsers: async (page = 0, size = 10) => {
    const res = await apiClient.get(`/admin-bff/users?page=${page}&size=${size}`);
    return res.data;
  },

  updateUser: async (id: number | string, userData: any) => {
    const res = await apiClient.put(`/admin-bff/users/${id}`, userData);
    return res.data;
  },

  // --- REVIEW MANAGEMENT ---
  getReviews: async (page = 0, size = 10, rating?: string) => {
    const res = await apiClient.get(`/admin-bff/reviews`, {
      params: { page, size, rating }
    });
    return res.data;
  },

  respondToReview: async (reviewId: number | string, response: string) => {
    const res = await apiClient.post(`/admin-bff/reviews/${reviewId}/respond?response=${response}`);
    return res.data;
  },

  // --- ORDER MANAGEMENT ---
  getOrders: async (page = 0, size = 10) => {
    const res = await apiClient.get('/admin-bff/orders', { params: { page, size } });
    return res.data;
  },

  updateOrderStatus: async (id: number | string, status: string) => {
    const res = await apiClient.put(`/admin-bff/orders/${id}/status?status=${status}`);
    return res.data;
  },

  // --- DASHBOARD STATS ---
  getStats: async () => {
    const [usersPage, ordersPage, productsPage, categoriesData] = await Promise.all([
      apiClient.get('/admin-bff/users?size=1').then(r => r.data),
      apiClient.get('/admin-bff/orders?size=100').then(r => r.data), // Get up to 100 for revenue calc
      apiClient.get('/admin-bff/products?size=1').then(r => r.data),
      apiClient.get('/admin-bff/categories').then(r => r.data)
    ]);

    const orders = ordersPage?.content || [];
    const actualRevenueStatuses = ['DELIVERED', 'COMPLETED'];
    const processingRevenueStatuses = ['PAID', 'SHIPPED', 'SHIPPING', 'IN_TRANSIT', 'REFUND_PENDING'];

    const totalRevenue = orders
      .filter((o: any) => actualRevenueStatuses.includes(o.orderStatus))
      .reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      
    const processingRevenue = orders
      .filter((o: any) => processingRevenueStatuses.includes(o.orderStatus))
      .reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.content || []);

    return {
      totalUsers: usersPage?.totalElements || 0,
      totalOrders: ordersPage?.totalElements || 0,
      totalProducts: productsPage?.totalElements || 0,
      totalRevenue: totalRevenue,
      processingRevenue: processingRevenue,
      categories: categories,
      rawOrders: orders // For trend analysis or other charts
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
  getProducts: async (page = 0, size = 10) => {
    const res = await apiClient.get(`/admin-bff/products?page=${page}&size=${size}`);
    return res.data;
  },

  // --- EMAIL MANAGEMENT ---
  getEmails: async (page = 0, size = 10) => {
    const res = await apiClient.get('/admin-bff/emails', { params: { page, size } });
    const logsData = res.data;
    const logs = logsData.content || [];
    
    return {
      ...logsData,
      content: logs.map((log: any) => ({
        id: `MSG-${log.id}`,
        rawId: log.id,
        subject: log.subject,
        recipient: log.recipient,
        date: new Date(log.sentAt).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        rawDate: log.sentAt,
        type: log.type,
        status: "Đã gửi",
        statusColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      }))
    };
  },

  getEmail: async (id: number | string) => {
    const res = await apiClient.get(`/admin-bff/emails/${id}`);
    return res.data;
  }
};
