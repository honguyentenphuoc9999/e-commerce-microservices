import { apiClient } from '@/lib/apiClient';

export const reviewService = {
  // Lấy danh sách đánh giá của user
  getUserReviews: async (userId: string | number) => {
    const res = await apiClient.get(`/review/${userId}/recommendations`);
    return res.data;
  },

  // Gửi đánh giá mới
  saveReview: async (userId: string | number, productId: string | number, rating: number, comment: string) => {
    const res = await apiClient.post(`/review/${userId}/recommendations/${productId}?rating=${rating}&comment=${comment}`);
    return res.data;
  },

  // Lấy đánh giá của sản phẩm
  getReviewsByProduct: async (productName: string) => {
    const res = await apiClient.get(`/review/recommendations?name=${productName}`);
    return res.data;
  }
};
