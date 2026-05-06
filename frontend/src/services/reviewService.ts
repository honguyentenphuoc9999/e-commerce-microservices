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

  // Cập nhật đánh giá đã có
  updateReview: async (userId: string | number, productId: string | number, rating: number, comment: string) => {
    const res = await apiClient.put(`/review/${userId}/recommendations/${productId}?rating=${rating}&comment=${comment}`);
    return res.data;
  },

  // Xóa đánh giá
  deleteReview: async (id: string | number) => {
    const res = await apiClient.delete(`/review/recommendations/${id}`);
    return res.data;
  },

  // Lấy 1 đánh giá cụ thể của user cho sản phẩm
  getRecommendationByUserIdAndProductId: async (userId: string | number, productId: string | number) => {
    try {
      const res = await apiClient.get(`/review/${userId}/recommendations/${productId}`);
      return res.data;
    } catch (error) {
      return null;
    }
  },

  // Lấy đánh giá của sản phẩm
  getReviewsByProduct: async (productName: string) => {
    const res = await apiClient.get(`/review/recommendations?name=${productName}`);
    return res.data;
  }
};
