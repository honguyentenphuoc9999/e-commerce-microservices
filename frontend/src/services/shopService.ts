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

  // Thực hiện đặt hàng (Chốt đơn)
  // Trong Postman guide yêu cầu truyền userId vào param (VD: /api/shop/order/2)
  checkout: async (userId: string | number, voucherCodes?: string) => {
    const url = voucherCodes 
      ? `/shop/order/${userId}?voucherCodes=${voucherCodes}` 
      : `/shop/order/${userId}`;
    const res = await apiClient.post(url);
    return res.data;
  },

  // Lấy Link Ảnh QR Thanh toán VietQR
  getVietQrPayment: async (orderId: string | number) => {
    const res = await apiClient.post(`/payment/create-vietqr-payment/${orderId}`);
    return res.data; // Trả về { paymentUrl: "..." }
  }
};
