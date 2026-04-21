"use client";
import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  Package,
  Edit,
  Trash2,
  ArrowRight,
  Award,
  Inbox,
  Shield,
  X,
  Check,
  Send,
  Save
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/reviewService";
import { catalogService } from "@/services/catalogService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

const UserReviews = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const filterProductId = searchParams.get("productId");
  const modeParam = searchParams.get("mode"); // 'create' or 'update'

  // State for Edit/Create Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [modalMode, setModalMode] = useState<'create' | 'update'>('update');

  // Scroll Lock logic
  useEffect(() => {
    if (isEditModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditModalOpen]);

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["userReviews", user?.id],
    queryFn: () => reviewService.getUserReviews(user!.id as string | number),
    enabled: !!user?.id
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ["allProducts"],
    queryFn: () => catalogService.getProducts(),
  });

  // Auto-open modal if mode is create
  useEffect(() => {
    if (filterProductId && modeParam === 'create' && allProducts.length > 0) {
      // Check if already reviewed first
      const existing = reviews.find((r: any) => r.productId.toString() === filterProductId);
      if (existing) {
        handleOpenEdit(existing, 'update');
      } else {
        const product = allProducts.find((p: any) => p.id.toString() === filterProductId);
        if (product) {
          handleOpenEdit({ productId: product.id, productName: product.productName, rating: 5, comment: "" }, 'create');
        }
      }
      // Remove mode param from URL without refreshing
      const params = new URLSearchParams(window.location.search);
      params.delete('mode');
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
  }, [filterProductId, modeParam, allProducts, reviews]);

  const getProductImage = (productId: any) => {
    const product = allProducts.find((p: any) => p.id.toString() === productId.toString());
    return product?.image;
  };

  const getProductName = (productId: any, fallbackName: string) => {
    const product = allProducts.find((p: any) => p.id.toString() === productId.toString());
    return product?.productName || fallbackName;
  };

  const filteredReviews = filterProductId
    ? reviews.filter((rev: any) => rev.productId.toString() === filterProductId)
    : reviews;

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Rất tệ";
      case 2: return "Tệ";
      case 3: return "Bình thường";
      case 4: return "Hài lòng";
      case 5: return "Tuyệt vời";
      default: return "";
    }
  };

  const saveMutation = useMutation({
    mutationFn: ({ productId, rating, comment }: { productId: any, rating: number, comment: string }) =>
      modalMode === 'create'
        ? reviewService.saveReview(user!.id as any, productId, rating, comment)
        : reviewService.updateReview(user!.id as any, productId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
      toast.success(modalMode === 'create' ? "Đã gửi đánh giá thành công!" : "Cập nhật đánh giá thành công!");
      setIsEditModalOpen(false);
    },
    onError: () => toast.error("Có lỗi xảy ra.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: any) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
      toast.success("Đã xóa đánh giá.");
    },
    onError: () => toast.error("Có lỗi xảy ra khi xóa.")
  });

  const handleOpenEdit = (rev: any, mode: 'create' | 'update' = 'update') => {
    setModalMode(mode);
    setEditingReview(rev);
    setEditRating(rev.rating || 5);
    setEditComment(rev.comment || "");
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!editingReview) return;
    saveMutation.mutate({
      productId: editingReview.productId,
      rating: editRating,
      comment: editComment
    });
  };

  const handleDelete = (id: any) => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      deleteMutation.mutate(id);
    }
  };

  if (reviewsLoading) {
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
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <MessageSquare size={180} className="text-[#e9c349]" />
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="font-headline text-6xl font-black tracking-tighter text-white">
            {filterProductId ? "Phản hồi chi tiết" : "Đánh giá của tôi"}
          </h1>
          <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl">
            {filterProductId
              ? "Đang hiển thị phản hồi cụ thể mà quý khách dành cho sản phẩm này."
              : "Cảm ơn quý khách đã chia sẻ trải nghiệm với cộng đồng Phuoc Techno."}
          </p>
          <div className="flex items-center gap-6 pt-2">
            {filterProductId ? (
              <button
                onClick={() => router.push("/profile/reviews")}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#e9c349] text-[#0b1326] font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl active:scale-95 shadow-[#e9c349]/10"
              >
                <ArrowRight className="rotate-180" size={14} /> Xem tất cả đánh giá
              </button>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#e9c349]">Tổng đóng góp</span>
                  <span className="text-2xl font-black text-white">{reviews.length} Phản hồi</span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Tỷ lệ tương tác</span>
                  <span className="text-2xl font-black text-white">100%</span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <Award className="text-[#e9c349] drop-shadow-[0_0_10px_rgba(233,195,73,0.3)] shadow-amber-400" size={32} />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Reviews List */}
      <section className="space-y-10">
        {filteredReviews.length === 0 ? (
          <div className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl p-24 relative overflow-hidden flex flex-col items-center justify-center text-center group">
            <Inbox size={80} className="text-slate-600 mb-8 group-hover:scale-110 transition-transform duration-700" />
            <h2 className="text-3xl font-headline font-black text-white mb-4">Chưa có đánh giá nào</h2>
            <p className="text-slate-400 font-medium max-w-md">Quý khách chưa có đánh giá nào cho bộ sưu tập này.</p>
          </div>
        ) : (
          filteredReviews.map((rev: any) => {
            const productImage = getProductImage(rev.productId);
            const productName = getProductName(rev.productId, rev.productName);
            return (
              <div key={rev.id} className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl p-12 relative overflow-hidden group hover:border-[#e9c349]/20 hover:translate-y-[-4px] transition-all duration-500">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                  <Star size={240} className="text-white fill-white" />
                </div>

                <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                  <div className="lg:w-1/4 space-y-4">
                    <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 group-hover:border-[#e9c349]/30 transition-all duration-700 shadow-2xl group/img flex items-center justify-center bg-[#0b1326]">
                      {productImage ? (
                        <img src={productImage} alt={productName} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                      ) : (
                        <Package className="text-white/10" size={64} />
                      )}
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="font-headline font-black text-white text-lg group-hover:text-[#e9c349] transition-colors mt-2 leading-tight">{productName}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-2">Mã SP: ATL-ITEM-{rev.productId}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-8 flex flex-col justify-center">
                    <div className="flex flex-wrap justify-between items-center gap-6">
                      <div className="flex text-[#e9c349] gap-1.5 bg-[#0b1326] px-5 py-2.5 rounded-full border border-white/5 shadow-inner">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} className={i < rev.rating ? "fill-[#e9c349]" : "opacity-10"} />
                        ))}
                      </div>
                      <span className="px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
                        Phản hồi đã xác thực
                      </span>
                    </div>

                    <div className="bg-white/5 p-10 rounded-[2rem] border border-white/5 shadow-inner relative text-white text-lg font-light leading-relaxed group-hover:bg-[#e9c349]/5 transition-colors duration-500">
                      {rev.comment ? `"${rev.comment}"` : `"Chưa có nội dung đánh giá"`}
                      <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#0b1326] rounded-full flex items-center justify-center text-[#e9c349]/40">
                        <MessageSquare size={24} />
                      </div>
                    </div>

                    {rev.adminResponse && (
                      <div className="ml-10 p-6 bg-[#e9c349]/10 border-l-4 border-[#e9c349] rounded-2xl animate-in slide-in-from-left-4">
                        <p className="text-[10px] font-black text-[#e9c349] uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Shield size={12} /> Admin Phản hồi:
                        </p>
                        <p className="text-slate-300 text-sm">"{rev.adminResponse}"</p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleOpenEdit(rev, 'update')}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all bg-[#0b1326] px-8 py-3.5 rounded-xl border border-white/5 shadow-xl hover:bg-white/5"
                      >
                        <Edit size={16} />
                        Chỉnh sửa
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
            );
          })
        )}
      </section>

      {/* Edit/Create Modal (Unified - Exact match with Product Detail Page) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-2xl transition-all duration-500">
          {/* Bluish Glow Background */}
          <div className="absolute inset-0 bg-[#020617]/80" />
          <div className="absolute inset-0 bg-radial-at-c from-blue-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="bg-[#131b2e] w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            {/* Modal Header */}
            <div className="px-12 py-10 flex justify-between items-center border-b border-white/5 bg-linear-to-r from-white/[0.02] to-transparent">
              <div>
                <h2 className="text-3xl font-headline font-black text-white tracking-tighter uppercase">
                  {modalMode === 'create' ? "ĐÁNH GIÁ SẢN PHẨM" : "CẬP NHẬT ĐÁNH GIÁ"}
                </h2>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">
                  {modalMode === 'create'
                    ? `CHIA SẺ TRẢI NGHIỆM CỦA QUÝ KHÁCH VỀ ${editingReview?.productName || "SẢN PHẨM"}`
                    : "Lần cập nhật cuối sẽ được ghi nhận vào lịch sử."}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-12 space-y-10">
              {/* Product Mini Info */}
              {editingReview && (
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-[#0b1326] border border-white/5">
                  <div className="w-16 h-20 bg-[#131b2e] rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={getProductImage(editingReview.productId)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{getProductName(editingReview.productId, editingReview.productName)}</h4>
                  </div>
                </div>
              )}

              {/* Star Rating Selection */}
              <div className="space-y-6 text-center">
                <label className="text-[10px] font-black uppercase text-[#e9c349] tracking-[0.3em] block">CHẤT LƯỢNG SẢN PHẨM</label>
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setEditRating(star)}
                      className="group relative transition-transform active:scale-90"
                    >
                      <Star
                        size={48}
                        className={`transition-all duration-300 ${star <= editRating ? "fill-[#e9c349] text-[#e9c349] drop-shadow-[0_0_15px_rgba(233,195,73,0.5)]" : "text-white/5"}`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-slate-400 text-sm font-medium">
                  {getRatingText(editRating)}
                </p>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">BÌNH LUẬN CHI TIẾT</label>
                <div className="relative group">
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={4}
                    placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này nhé..."
                    className="w-full bg-[#0b1326] border border-white/5 rounded-2xl p-6 text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-[#e9c349]/30 transition-all resize-none shadow-inner text-base font-light"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-12 py-10 bg-white/[0.02] border-t border-white/5 flex gap-4 items-center justify-between">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all px-6"
              >
                HỦY
              </button>
              <button
                onClick={handleUpdate}
                disabled={saveMutation.isPending}
                className="flex-[1.5] py-4 bg-[#e9c349] rounded-2xl text-[#0b1326] font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-[0_0_40px_rgba(233,195,73,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <span className="w-4 h-4 border-2 border-[#0b1326] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  modalMode === 'create' ? <Send size={18} /> : <Save size={18} />
                )}
                {modalMode === 'create' ? "GỬI ĐÁNH GIÁ" : "LƯU THAY ĐỔI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReviews;
