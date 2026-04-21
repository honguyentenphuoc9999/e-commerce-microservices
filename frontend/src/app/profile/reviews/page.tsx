"use client";
import React from "react";
import {
  Star,
  Search,
  Filter,
  MessageSquare,
  Clock,
  Package,
  Edit,
  Trash2,
  CheckCircle,
  ImageIcon,
  ArrowRight,
  TrendingUp,
  Award,
  Inbox,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/reviewService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const UserReviews = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["userReviews", user?.id],
    queryFn: () => reviewService.getUserReviews(user!.id as string | number),
    enabled: !!user?.id
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, rating, comment }: { productId: any, rating: number, comment: string }) =>
      reviewService.updateReview(user!.id as any, productId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
      toast.success("Cập nhật đánh giá thành công!");
    },
    onError: () => toast.error("Có lỗi xảy ra khi cập nhật.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: any) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
      toast.success("Đã xóa đánh giá.");
    },
    onError: () => toast.error("Có lỗi xảy ra khi xóa.")
  });

  const handleEdit = (rev: any) => {
    const newRating = prompt("Nhập số sao (1-5):", rev.rating.toString());
    const newComment = prompt("Nhập nội dung đánh giá:", rev.comment || "");

    if (newRating !== null) {
      updateMutation.mutate({
        productId: rev.productId,
        rating: parseInt(newRating) || rev.rating,
        comment: newComment || ""
      });
    }
  };

  const handleDelete = (id: any) => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#e9c349] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#e9c349] font-bold tracking-widest uppercase text-xs">Đang đồng bộ phản hồi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Header Info */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 bg-linear-to-br from-[#131b2e]/60 to-[#0b1326]/60 p-12 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <MessageSquare size={180} className="text-[#e9c349]" />
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="font-headline text-6xl font-black tracking-tighter text-white italic">Đánh giá của tôi</h1>
          <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl">Cảm ơn quý khách đã chia sẻ trải nghiệm với cộng đồng Digital Atelier. Những phản ảnh thực tế giúp chúng tôi hoàn thiện chất lượng dịch vụ.</p>
          <div className="flex items-center gap-6 pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#e9c349]">Tổng đóng góp</span>
              <span className="text-2xl font-black text-white italic">{reviews.length} Phản hồi</span>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Tỷ lệ tương tác</span>
              <span className="text-2xl font-black text-white italic">100%</span>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <Award className="text-[#e9c349] drop-shadow-[0_0_10px_rgba(233,195,73,0.3)] shadow-amber-400" size={32} />
          </div>
        </div>

      </header>

      {/* Reviews List */}
      <section className="space-y-10">
        {reviews.length === 0 ? (
          <div className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl p-24 relative overflow-hidden flex flex-col items-center justify-center text-center group">
            <Inbox size={80} className="text-slate-600 mb-8 group-hover:scale-110 transition-transform duration-700" />
            <h2 className="text-3xl font-headline font-black text-white mb-4 italic">Chưa có đánh giá nào</h2>
            <p className="text-slate-400 font-medium max-w-md">Bạn chưa viết bất kỳ đánh giá nào. Hãy đánh giá các sản phẩm bạn đã mua để giúp cộng đồng hiểu hơn về chất lượng.</p>
          </div>
        ) : (
          reviews.map((rev: any) => (
            <div key={rev.id} className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl p-12 relative overflow-hidden group hover:border-[#e9c349]/20 hover:translate-y-[-4px] transition-all duration-500">
              {/* Background Texture Placeholder */}
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                <Star size={240} className="text-white fill-white" />
              </div>

              <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                <div className="lg:w-1/4 space-y-4">
                  <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 group-hover:border-[#e9c349]/30 transition-all duration-700 shadow-2xl group/img flex items-center justify-center bg-[#0b1326]">
                    {rev.productImage ? (
                      <img src={rev.productImage} alt={rev.productName} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                    ) : (
                      <ImageIcon className="text-white/10" size={64} />
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="font-headline font-black text-white text-lg italic group-hover:text-[#e9c349] transition-colors mt-2 leading-tight">{rev.productName}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-2">Mã SP: {rev.productId}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-8 flex flex-col justify-center">
                  <div className="flex flex-wrap justify-between items-center gap-6">
                    <div className="flex text-[#e9c349] gap-1.5 bg-[#0b1326] px-5 py-2.5 rounded-full border border-white/5 shadow-inner">
                      {[...Array(rev.rating)].map((_, i) => <Star key={`filled-${i}`} size={18} className="fill-[#e9c349]" />)}
                      {[...Array(5 - rev.rating)].map((_, i) => <Star key={`empty-${i}`} size={18} className="opacity-10" />)}
                    </div>
                    <span className="px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
                      Phản hồi đã xác thực
                    </span>
                  </div>

                  <div className="bg-white/5 p-10 rounded-[2rem] border border-white/5 shadow-inner relative italic text-white text-lg font-light leading-relaxed group-hover:bg-[#e9c349]/5 transition-colors duration-500">
                    {rev.comment ? `"${rev.comment}"` : `"(Ẩn) Chưa có nội dung đánh giá"`}
                    {/* Quote highlight */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#0b1326] rounded-full flex items-center justify-center text-[#e9c349]/40">
                      <MessageSquare size={24} />
                    </div>
                  </div>

                  {rev.adminResponse && (
                    <div className="ml-10 p-6 bg-[#e9c349]/10 border-l-4 border-[#e9c349] rounded-2xl animate-in slide-in-from-left-4">
                      <p className="text-[10px] font-black text-[#e9c349] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Shield size={12} /> Admin Phản hồi:
                      </p>
                      <p className="text-slate-300 text-sm italic">"{rev.adminResponse}"</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEdit(rev)}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all bg-[#0b1326] px-8 py-3.5 rounded-xl border border-white/5 shadow-xl hover:bg-white/5 disabled:opacity-50"
                    >
                      <Edit size={16} />
                      {updateMutation.isPending && updateMutation.variables?.productId === rev.productId ? "Đang lưu..." : "Chỉnh sửa"}
                    </button>
                    <button
                      onClick={() => handleDelete(rev.id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-400 transition-all bg-[#0b1326] px-8 py-3.5 rounded-xl border border-white/5 shadow-xl hover:bg-white/5 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deleteMutation.isPending && deleteMutation.variables === rev.id ? "Đang xóa..." : "Gỡ bỏ"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )))}
      </section>

      {/* Footer / Empty State */}
      <footer className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
        <span className="text-slate-500 text-[10px] uppercase font-black tracking-[0.5em] tracking-widest">Atelier Review Feedback Loop Protocol</span>
        <button className="group flex items-center gap-3 text-[#e9c349] font-black text-xs uppercase tracking-[0.2em] hover:translate-x-1 transition-transform">
          Khám phá đánh giá khác từ cộng đồng
          <ArrowRight size={16} />
        </button>
      </footer>
    </div>
  );
};

export default UserReviews;
