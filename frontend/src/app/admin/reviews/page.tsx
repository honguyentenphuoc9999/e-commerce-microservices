"use client";
import React, { useState } from "react";
import {
  Search,
  Filter,
  Star,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreVertical,
  StarOff,
  StarHalf,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Pin,
  Image as ImageIcon,
  X,
  Save,
  Loader2,
  Shield
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const AdminReviews = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: reviewsPage, isLoading } = useQuery({
    queryKey: ['admin-reviews', currentPage, ratingFilter],
    queryFn: () => adminService.getReviews(currentPage, pageSize, ratingFilter)
  });

  const { data: productsData = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminService.getProducts(0, 1000) // Lấy nhiều hơn để map product info
  });

  const reviewsData = reviewsPage?.content || [];
  const totalPages = reviewsPage?.totalPages || 0;
  const totalElements = reviewsPage?.totalElements || 0;

  const reviews = Array.isArray(reviewsData) ? [...reviewsData].sort((a, b) => {
    const currentUserId = useAuthStore.getState().user?.id;
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  }).map((r: any) => {
    const productInfo = Array.isArray(productsData.content)
      ? productsData.content.find((p: any) => p.productName === r.productName)
      : null;

    return {
      id: `#REV-${r.id}`,
      product: r.productName,
      category: r.categoryName || productInfo?.category?.categoryName || "Đang tải danh mục...",
      user: `USR-${r.userId}`,
      userName: r.userName || `Người dùng ${r.userId}`,
      rating: r.rating || 0,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
      content: r.comment || "",
      adminResponse: r.adminResponse,
      image: r.productImage || productInfo?.image,
      reviewPhotos: []
    };
  }) : [];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenResponse = (revId: string, existingResponse?: string) => {
    setActiveReviewId(revId.includes('-') ? revId.split('-')[1] : revId);
    setCurrentResponse(existingResponse || "");
    setIsResponseModalOpen(true);
  };

  const submitResponse = async () => {
    if (!activeReviewId) return;
    setIsSubmitting(true);
    try {
      await adminService.respondToReview(activeReviewId, currentResponse);
      toast.success("Đã gửi phản hồi thành công!");
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setIsResponseModalOpen(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi phản hồi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-12 space-y-12 bg-gradient-to-b from-[#0b1326] to-[#0f172a] animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[#e9c349] font-headline tracking-widest text-xs uppercase mb-2">Phản hồi khách hàng</p>
          <h1 className="font-headline text-5xl font-black tracking-tighter text-white uppercase mb-2">Quản lý Đánh giá</h1>
          <div className="flex items-center gap-3">
            <p className="text-slate-500 font-body text-sm">Giám sát trải nghiệm người dùng và phản hồi dịch vụ.</p>
            <span className="px-3 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-bold tracking-widest uppercase border border-amber-400/20 shadow-[0_0_10px_rgba(233,195,73,0.1)]">Live Feed</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#e9c349] transition-colors" />
            <input
              className="bg-[#131b2e] border-none rounded-xl pl-12 pr-6 py-3.5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 placeholder:text-slate-600 transition-all outline-none w-64 shadow-2xl shadow-black/40 border border-white/5"
              placeholder="Tìm kiếm đánh giá..."
              type="text"
            />
          </div>
        </div>
      </header>

      {/* Overview Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#131b2e] rounded-2xl p-8 relative overflow-hidden group border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-blue-400/10"></div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3">Tổng số đánh giá</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-headline font-black text-white tracking-tighter">{totalElements}</h3>
          </div>
          <div className="mt-6 h-1 w-full bg-[#171f33] rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div className="h-full bg-blue-400 w-full rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
          </div>
        </div>
        <div className="bg-[#131b2e] rounded-2xl p-8 relative overflow-hidden group border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e9c349]/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-[#e9c349]/10"></div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3">Điểm trung bình</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-headline font-black text-white tracking-tighter">
              {reviews.length > 0 ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}/5
            </h3>
            <div className="flex text-[#e9c349] mb-1.5 gap-1">
              <Star size={16} className="fill-[#e9c349] text-[#e9c349]" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-5 italic uppercase tracking-wider">Dựa trên dữ liệu thực tế</p>
        </div>
        <div className="bg-[#131b2e] rounded-2xl p-8 relative overflow-hidden group border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-emerald-400/10"></div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3">Lượt đánh giá tốt</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-headline font-black text-white tracking-tighter">
              {reviews.filter((r: any) => r.rating >= 4).length}
            </h3>
            <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-black rounded-full mb-1.5 uppercase tracking-widest border border-emerald-400/20">Active</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-5 italic uppercase tracking-wider">Đánh giá từ 4-5 sao</p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="flex flex-col md:flex-row gap-6 items-center justify-between bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-[#0b1326] rounded-xl border border-white/5">
            <button
              onClick={() => { setRatingFilter(""); setCurrentPage(0); }}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${ratingFilter === "" ? "bg-[#222a3d] text-white shadow-lg shadow-black/40 border border-[#e9c349]/20" : "text-slate-500 hover:text-white"}`}>
              Tất cả
            </button>
            <button
              onClick={() => { setRatingFilter("5"); setCurrentPage(0); }}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${ratingFilter === "5" ? "bg-[#222a3d] text-white shadow-lg shadow-black/40 border border-[#e9c349]/20" : "text-slate-500 hover:text-white"}`}>
              5 Sao
            </button>
            <button
              onClick={() => { setRatingFilter("4"); setCurrentPage(0); }}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${ratingFilter === "4" ? "bg-[#222a3d] text-white shadow-lg shadow-black/40 border border-[#e9c349]/20" : "text-slate-500 hover:text-white"}`}>
              4 Sao
            </button>
            <button
              onClick={() => { setRatingFilter("1-3"); setCurrentPage(0); }}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${ratingFilter === "1-3" ? "bg-[#222a3d] text-white shadow-lg shadow-black/40 border border-[#e9c349]/20" : "text-slate-500 hover:text-white"}`}>
              1-3 Sao
            </button>
          </div>
        </div>
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trang {currentPage + 1} / {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0b1326] text-slate-500 hover:text-white transition-all border border-white/5 shadow-xl hover:bg-[#222a3d] disabled:opacity-20">
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0b1326] text-slate-500 hover:text-white transition-all border border-white/5 shadow-xl hover:bg-[#222a3d] disabled:opacity-20">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Reviews Table Section */}
      <section className="bg-[#131b2e] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#171f33]/50 text-slate-500 font-label text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5">
              <th className="py-6 px-10">ID Đánh giá</th>
              <th className="py-6 px-10">Sản phẩm</th>
              <th className="py-6 px-10">Khách hàng</th>
              <th className="py-6 px-10 text-center">Xếp hạng</th>
              <th className="py-6 px-10">Ngày gửi</th>
              <th className="py-6 px-10 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="w-8 h-8 border-4 border-[#e9c349] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500 mt-4 tracking-widest uppercase font-black">Curating customer feedback...</p>
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-24 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="text-slate-600" size={28} />
                  </div>
                  <h3 className="text-xl font-headline font-black text-white italic">Không có đánh giá nào</h3>
                  <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">Hệ thống chưa ghi nhận phản hồi nào từ người dùng</p>
                </td>
              </tr>
            ) : (
              reviews.map((rev) => {
                const isExpanded = expandedId === rev.id;
                return (
                  <React.Fragment key={rev.id}>
                    <tr
                      onClick={() => toggleExpand(rev.id)}
                      className={`group transition-all cursor-pointer ${isExpanded ? 'bg-[#e9c349]/5' : 'hover:bg-white/[0.02]'}`}
                    >
                      <td className="py-8 px-10 font-mono text-xs text-slate-500 group-hover:text-[#e9c349] transition-colors font-bold uppercase">{rev.id}</td>
                      <td className="py-8 px-10">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-16 rounded-xl bg-[#0b1326] overflow-hidden flex-shrink-0 border border-white/10 shadow-xl group-hover:border-[#e9c349]/30 transition-all duration-300 flex items-center justify-center">
                            {rev.image ? (
                              <img src={rev.image} alt={rev.product} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 px-1 py-1" />
                            ) : (
                              <ImageIcon size={16} className="text-white/5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white group-hover:text-[#e9c349] transition-colors leading-tight">{rev.product}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">{rev.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-10">
                        <p className="text-sm font-black text-white">{rev.userName}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono">ID: {rev.user}</p>
                      </td>
                      <td className="py-8 px-10">
                        <div className="flex text-[#e9c349] gap-1 justify-center items-center h-full">
                          {[...Array(Math.max(0, Math.floor(rev.rating)))].map((_, i) => <Star key={i} size={14} className="fill-[#e9c349] text-[#e9c349]" />)}
                          {[...Array(Math.max(0, 5 - Math.floor(rev.rating)))].map((_, i) => <Star key={i} size={14} className="opacity-10 text-slate-500" />)}
                        </div>
                      </td>
                      <td className="py-8 px-10 text-xs font-bold text-slate-400 uppercase tracking-widest">{rev.date}</td>
                      <td className="py-8 px-10 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <div className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-[#e9c349] text-[#0b1326] rotate-180' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
                            <ChevronDown size={14} />
                          </div>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[#0b1326]/60 border-l-[6px] border-[#e9c349] animate-in slide-in-from-top-2 duration-300">
                        <td className="px-10 py-0 overflow-hidden" colSpan={6}>
                          <div className="py-12 px-12 space-y-10">
                            <div className="flex flex-col lg:flex-row gap-16">
                              <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-3">
                                  <MessageSquare size={18} className="text-[#e9c349]" />
                                  <h4 className="text-[11px] font-black text-[#e9c349] uppercase tracking-[0.25em]">Nội dung phản hồi:</h4>
                                </div>
                                <div className="relative">
                                  <div className="absolute top-0 left-0 w-8 h-8 -translate-x-4 -translate-y-4 opacity-10">
                                    <MessageSquare size={32} />
                                  </div>
                                  <div className="space-y-4">
                                    <p className="text-white text-lg leading-relaxed font-light italic bg-white/5 p-10 rounded-4xl border border-white/5 shadow-inner relative z-10">
                                      "{rev.content}"
                                    </p>
                                    {rev.adminResponse && (
                                      <div className="ml-12 p-6 bg-[#e9c349]/10 border-l-4 border-[#e9c349] rounded-2xl animate-in fade-in slide-in-from-left-4">
                                        <p className="text-[10px] font-black text-[#e9c349] uppercase tracking-widest mb-2 flex items-center gap-2">
                                          <Shield size={12} /> Admin Phản hồi:
                                        </p>
                                        <p className="text-slate-300 text-sm italic">"{rev.adminResponse}"</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-10 flex gap-6">
                                  <button
                                    onClick={() => handleOpenResponse(rev.id, rev.adminResponse)}
                                    className="px-10 py-4 rounded-xl bg-[#e9c349] text-[#0b1326] text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all">
                                    Trả lời khách hàng
                                  </button>
                                </div>
                              </div>
                              {rev.reviewPhotos && (
                                <div className="lg:w-[400px] grid grid-cols-2 gap-6">
                                  {rev.reviewPhotos.map((photo, i) => (
                                    <div key={i} className="group/photo relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-3xl cursor-zoom-in">
                                      {photo ? (
                                        <img src={photo} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover grayscale opacity-70 group-hover/photo:grayscale-0 group-hover/photo:opacity-100 group-hover/photo:scale-110 transition-all duration-1000" />
                                      ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                          <ImageIcon size={24} className="text-white/10" />
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-end p-6">
                                        <div className="flex items-center gap-2">
                                          <ImageIcon size={16} className="text-[#e9c349]" />
                                          <span className="text-[10px] font-bold text-white uppercase tracking-widest text-[#e9c349]">Đính kèm {i + 1}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {/* Admin Response Modal */}
      {isResponseModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#02040a]/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#131b2e] w-full max-w-2xl rounded-4xl border border-white/10 shadow-4xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#171f33]">
              <div>
                <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight italic">Phản hồi khách hàng</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Protocol: Administrative Customer Engagement</p>
              </div>
              <button
                onClick={() => setIsResponseModalOpen(false)}
                className="p-3 rounded-full hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all border border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#e9c349] uppercase tracking-[0.3em] ml-1">Nội dung phản hồi</label>
                <textarea
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  placeholder="Nhập nội dung phản hồi chuyên nghiệp tại đây..."
                  className="w-full h-48 bg-[#0b1326] border border-white/5 rounded-3xl p-8 text-white text-base focus:ring-1 focus:ring-[#e9c349]/40 outline-none resize-none placeholder:text-slate-700 font-medium italic shadow-inner"
                />
              </div>

              <div className="flex items-center gap-4 p-6 bg-amber-400/5 rounded-2xl border border-amber-400/10">
                <Shield size={20} className="text-[#e9c349]" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Lưu ý: Phản hồi này sẽ được hiển thị công khai dưới tên quản trị viên PHUOC TECHNO. Hãy đảm bảo ngôn từ tinh tế và sang trọng.
                </p>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-[#171f33]/30 flex justify-end gap-4">
              <button
                onClick={() => setIsResponseModalOpen(false)}
                className="px-8 py-3 rounded-xl text-slate-500 font-bold text-xs uppercase hover:text-white transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitResponse}
                disabled={isSubmitting}
                className="px-10 py-4 bg-[#e9c349] text-[#0b1326] rounded-xl font-black text-xs uppercase shadow-2xl shadow-[#e9c349]/10 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Support */}
      <footer className="pt-12 flex justify-between items-center opacity-30 border-t border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.5em]">Protocol v4.2.1 Stable</p>
        <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest">
          <span className="text-slate-400">Chính sách bảo mật</span>
          <span className="text-slate-400">Trung tâm hỗ trợ</span>
        </div>
      </footer>
    </div>
  );
};

export default AdminReviews;

