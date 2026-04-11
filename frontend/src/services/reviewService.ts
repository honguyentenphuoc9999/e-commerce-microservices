import { apiClient } from '@/lib/apiClient';

export const reviewService = {
  // Lấy danh sách đánh giá của user
  getUserReviews: async (userId: string | number) => {
    const res = await apiClient.get(`/review/${userId}/recommendations`);
    return res.data;
  }
};
