import { apiClient } from '@/lib/apiClient';

export const shopService = {
  // Lấy thông tin giỏ hàng hiện tại (yêu cầu bộ nhớ có Bearer token)
  getCart: async () => {
    const res = await apiClient.get('/shop/cart');
    return res.data;
  },

  // Thêm sản phẩm vào giỏ
  addToCart: async (productId: string | number, quantity: number = 1) => {
    const res = await apiClient.post(`/shop/cart?productId=${productId}&quantity=${quantity}`);
    return res.data;
  },

  // Xóa sản phẩm khỏi giỏ
  removeFromCart: async (productId: string | number) => {
    const res = await apiClient.delete(`/shop/cart?productId=${productId}`);
    return res.data;
  },

  // Cập nhật số lượng sản phẩm (Tuyệt đối)
  updateCartQuantity: async (productId: string | number, quantity: number) => {
    const res = await apiClient.put(`/shop/cart?productId=${productId}&quantity=${quantity}`);
    return res.data;
  },

  // Thực hiện đặt hàng (Chốt đơn)
  checkout: async (userId: string | number, voucherCodes?: string, shippingMethod: string = "standard", shippingAddress?: string, itemIds?: (string | number)[]) => {
    const params = new URLSearchParams();
    if (voucherCodes) params.append("voucherCodes", voucherCodes);
    if (shippingMethod) params.append("shippingMethod", shippingMethod);
    if (shippingAddress) params.append("shippingAddress", shippingAddress);
    if (itemIds && itemIds.length > 0) params.append("itemIds", itemIds.join(','));
    
    const res = await apiClient.post(`/shop/order/${userId}?${params.toString()}`);
    return res.data;
  },

  // Lấy danh sách đơn hàng của người dùng
  getUserOrders: async (userId: string | number, page: number = 0, size: number = 10) => {
    const res = await apiClient.get(`/shop/orders/user/${userId}?page=${page}&size=${size}`);
    return res.data;
  },

  // Cập nhật trạng thái đơn hàng (Dành cho User/System)
  updateOrderStatus: async (orderId: string | number, status: string) => {
    const res = await apiClient.put(`/shop/orders/${orderId}/status?status=${status}`);
    return res.data;
  },

  // Lấy Link Thanh toán VNPay
  getVNPayPayment: async (orderId: string | number) => {
    const res = await apiClient.post(`/payment/create-vnpay-payment/${orderId}`);
    return res.data; // Trả về { paymentUrl: "..." }
  },

  // --- ADMIN METHODS ---
  adminGetAllOrders: async () => {
    const res = await apiClient.get('/admin-bff/orders');
    return res.data;
  },

  adminUpdateOrderStatus: async (orderId: number | string, status: string) => {
    const res = await apiClient.put(`/admin-bff/orders/${orderId}`, { orderStatus: status });
    return res.data;
  },

  // Kiểm tra voucher
  validateVoucher: async (code: string, amount: number) => {
    const res = await apiClient.get(`/shop/vouchers/validate?code=${code}&amount=${amount}`);
    return res.data;
  },

  getAvailableVouchers: async () => {
    const res = await apiClient.get('/shop/vouchers/available');
    return res.data;
  },

  adminGetAllVouchers: async (page = 0, size = 10) => {
    const res = await apiClient.get('/shop/vouchers/admin/all', {
      params: { page, size }
    });
    return res.data;
  },

  adminCreateVoucher: async (voucherData: any) => {
    const res = await apiClient.post('/shop/vouchers/admin/create', voucherData);
    return res.data;
  },

  adminUpdateVoucher: async (id: number | string, voucherData: any) => {
    const res = await apiClient.put(`/shop/vouchers/admin/${id}`, voucherData);
    return res.data;
  },

  adminDeleteVoucher: async (id: number | string) => {
    const res = await apiClient.delete(`/shop/vouchers/admin/${id}`);
    return res.data;
  },

  mergeCart: async () => {
    const res = await apiClient.post('/shop/cart/merge');
    return res.data;
  }
};
