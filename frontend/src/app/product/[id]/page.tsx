"use client";
import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, Truck, RefreshCcw, Minus, Plus, Heart, Share2, ChevronRight, Shield, MessageSquare, X, Save, Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService } from "@/services/catalogService";
import { shopService } from "@/services/shopService";
import { reviewService } from "@/services/reviewService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const ProductDetailPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("global");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, percentageX: 0, percentageY: 0, width: 0, height: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: async () => {
      const p = await catalogService.getProductById(params.id as string);
      if (p && !selectedImage) setSelectedImage(p.image || (p.images && p.images[0]) || null);
      return p;
    },
    enabled: !!params.id,
  });

  // Helper to get all product images
  const allImages = product?.images && product.images.length > 0
    ? product.images
    : (product?.image ? [product.image] : []);

  const currentImage = selectedImage || product?.image || (allImages.length > 0 ? allImages[0] : null);

  const cartMutation = useMutation({
    mutationFn: () => shopService.addToCart(product!.id!, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng.");
    }
  });

  const buyNowMutation = useMutation({
    mutationFn: () => shopService.addToCart(product!.id!, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      router.push("/checkout");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xử lý mua hàng.");
    }
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['productReviews', product?.productName],
    queryFn: () => reviewService.getReviewsByProduct(product!.productName),
    enabled: !!product?.productName,
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  // Calculate rating stats
  const ratingStats = React.useMemo(() => {
    const stats = { 
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 
      total: reviews.length 
    };
    reviews.forEach((r: any) => {
      const rating = Math.round(Number(r.rating || 0));
      if (rating >= 1 && rating <= 5) {
        // @ts-ignore
        stats[rating]++;
      }
    });
    return stats;
  }, [reviews]);

  // Sort reviews: current user's review at top
  const sortedReviews = React.useMemo(() => {
    if (!reviews || !Array.isArray(reviews)) return [];
    return [...reviews].sort((a, b) => {
      if (a.userId === user?.id) return -1;
      if (b.userId === user?.id) return 1;
      // Default: Newest first
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [reviews, user?.id]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng.");
      return;
    }
    cartMutation.mutate();
  };

  const { data: userReview } = useQuery({
    queryKey: ['userProductReview', user?.id, params.id],
    queryFn: () => reviewService.getRecommendationByUserIdAndProductId(user!.id as any, params.id as any),
    enabled: !!user?.id && !!params.id,
  });

  const saveReviewMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number, comment: string }) =>
      reviewService.saveReview(user!.id!, product!.id!, rating, comment),
    onSuccess: () => {
      toast.success("Cám ơn bạn đã đánh giá!");
      queryClient.invalidateQueries({ queryKey: ['productReviews'] });
      queryClient.invalidateQueries({ queryKey: ['userProductReview'] });
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        toast.error("Bạn đã đánh giá sản phẩm này rồi! Hãy chỉnh sửa ở trang Cá nhân.");
      } else {
        toast.error("Có lỗi xảy ra khi lưu đánh giá.");
      }
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number, comment: string }) =>
      reviewService.updateReview(user!.id!, product!.id!, rating, comment),
    onSuccess: () => {
      toast.success("Đã cập nhật đánh giá của bạn!");
      queryClient.invalidateQueries({ queryKey: ['productReviews'] });
      queryClient.invalidateQueries({ queryKey: ['userProductReview'] });
    },
    onError: () => toast.error("Có lỗi xảy ra khi cập nhật đánh giá.")
  });

  const handleReviewAction = () => {
    if (!user) return toast.error("Vui lòng đăng nhập để đánh giá.");
    setReviewRating(userReview?.rating || 5);
    setReviewComment(userReview?.comment || "");
    setIsReviewModalOpen(true);
  };

  const submitReview = () => {
    const isEditing = !!userReview;
    if (isEditing) {
      updateReviewMutation.mutate({ rating: reviewRating, comment: reviewComment });
    } else {
      saveReviewMutation.mutate({ rating: reviewRating, comment: reviewComment });
    }
    setIsReviewModalOpen(false);
  };

  // Scroll Lock logic
  React.useEffect(() => {
    if (isReviewModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isReviewModalOpen]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.pageX - left - window.scrollX;
    const y = e.pageY - top - window.scrollY;
    setMousePos({ 
      x, 
      y, 
      percentageX: (x / width) * 100, 
      percentageY: (y / height) * 100,
      width,
      height
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua hàng.");
      return;
    }
    buyNowMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#e9c349] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-bold">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-12">
          <Link href="/" className="hover:text-white transition">TRANG CHỦ</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/collections" className="hover:text-white transition">BỘ SƯU TẬP</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">{product.productName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Product Images (Left) */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              className="relative h-[640px] lg:h-[800px] w-full bg-linear-to-b from-white/5 to-transparent rounded-[40px] overflow-hidden group shadow-2xl border border-white/5 flex items-center justify-center p-6 lg:p-12 cursor-none"
            >
              {currentImage ? (
                <>
                  <img 
                    src={currentImage} 
                    alt={product.productName} 
                    className="object-contain w-full h-full rounded-[30px] shadow-inner opacity-100 transition-opacity duration-300" 
                  />
                  
                  {/* Magnifying Glass Lens */}
                  {isZooming && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute pointer-events-none z-50"
                      style={(function() {
                        const lensSize = 288;
                        const left = Math.max(0, Math.min(mousePos.width - lensSize, mousePos.x - lensSize/2));
                        const top = Math.max(0, Math.min(mousePos.height - lensSize, mousePos.y - lensSize/2));
                        return { left, top, width: lensSize, height: lensSize };
                      })()}
                    >
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#020617'
                      }}>
                        <img
                          src={currentImage!}
                          alt="Zoomed"
                          className="absolute object-contain max-w-none"
                          style={{
                            width: mousePos.width,
                            height: mousePos.height,
                            left: -mousePos.x + 144,
                            top: -mousePos.y + 144,
                            transform: `scale(2.5)`,
                            transformOrigin: `${mousePos.x}px ${mousePos.y}px`,
                          }}
                        />
                        <div style={{
                          position: 'absolute', inset: 0,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.35) 100%)',
                          pointerEvents: 'none',
                        }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          borderRadius: '50%',
                          background: 'radial-gradient(ellipse at 30% 22%, rgba(255,255,255,0.22) 0%, transparent 50%)',
                          pointerEvents: 'none',
                        }} />
                      </div>
                      <div style={{
                        position: 'absolute', inset: 0,
                        borderRadius: '50%',
                        boxShadow: `
                          inset 0 0 0 2px rgba(180, 100, 255, 0.35),
                          inset 0 0 0 4px rgba(255, 80,  80,  0.15),
                          inset 0 0 8px 2px rgba(100, 180, 255, 0.12)
                        `,
                        pointerEvents: 'none',
                      }} />
                      <div style={{
                        position: 'absolute', inset: 0,
                        borderRadius: '50%',
                        border: '3px solid rgba(255,255,255,0.20)',
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 12px 50px rgba(0,0,0,0.8)',
                        pointerEvents: 'none',
                      }} />
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white animate-spin"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              {!isZooming && (
                <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#e9c349] animate-pulse"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Rê chuột để soi chi tiết</span>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-5 md:grid-cols-9 gap-4">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-[#e9c349] scale-105 shadow-lg shadow-[#e9c349]/20' : 'border-white/5 hover:border-white/20'}`}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info (Right) */}
          <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-32 self-start">
            <div className="space-y-4">
              <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">{product.category?.categoryName || ""}</span>
              <h1 className="text-6xl font-black tracking-tighter leading-tight">{product.productName}</h1>
              <div className="flex items-center space-x-6 pt-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={14} className={i >= Math.floor(Number(averageRating)) ? "opacity-30" : ""} />)}
                </div>
                <span className="text-[10px] font-bold text-slate-500 tracking-[0.15em] border-l border-white/10 pl-6 uppercase">Đánh giá sản phẩm</span>
              </div>
            </div>

            <div className="text-5xl font-bold tracking-tight text-white mb-6">
              {product.price.toLocaleString()}đ
            </div>

            <p className="text-slate-400 font-medium leading-relaxed max-w-lg">
              {product.discription || ""}
            </p>

            <div className="flex items-center space-x-3 py-4 text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{product.availability > 0 ? `Sẵn hàng (${product.availability} sản phẩm)` : "Hết hàng"}</span>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <label className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Số lượng</label>
                   <span className="text-[10px] font-bold text-slate-600 uppercase">Kho: {product.availability}</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 px-6">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-blue-500 transition"><Minus size={16} /></button>
                  <span className="text-lg font-bold">{quantity.toString().padStart(2, "0")}</span>
                  <button onClick={() => setQuantity(Math.min(product.availability, quantity + 1))} className="hover:text-blue-500 transition"><Plus size={16} /></button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Bảo hành</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 px-6 text-sm font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                >
                  <option className="bg-[#0f172a]" value="12m">12 tháng chính hãng</option>
                  <option className="bg-[#0f172a]" value="24m">24 tháng Premier Care</option>
                  <option className="bg-[#0f172a]" value="global">Bảo hành toàn cầu</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col space-y-4 pt-10">
              <button
                onClick={handleAddToCart}
                disabled={cartMutation.isPending}
                className="premium-btn py-5 rounded-xl font-bold text-white shadow-2xl tracking-widest uppercase text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {cartMutation.isPending ? "ĐANG XỬ LÝ..." : "Thêm vào giỏ hàng"}
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={buyNowMutation.isPending}
                className="bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-xl font-bold text-white tracking-widest uppercase text-sm transition-all disabled:opacity-50"
              >
                {buyNowMutation.isPending ? "ĐANG XỬ LÝ..." : "Mua ngay"}
              </button>
            </div>

            <div className="flex justify-between items-center py-8 border-t border-white/5 mt-10">
              <div className="flex items-center space-x-4 text-[11px] font-bold text-slate-500 tracking-widest group">
                <Truck className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span>GIAO HÀNG HỎA TỐC GIÁ RẺ</span>
              </div>
              <div className="flex items-center space-x-4 text-[11px] font-bold text-slate-500 tracking-widest group">
                <RefreshCcw className="h-5 w-5 text-slate-400 group-hover:text-yellow-500 transition-colors" />
                <span>ĐỔI TRẢ TRONG 30 NGÀY</span>
              </div>
            </div>


          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-40 pt-20 border-t border-white/5">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3 space-y-10 sticky top-32 self-start">
              <h2 className="text-4xl font-bold tracking-tighter">Đánh giá Khách Hàng</h2>
              <div className="bg-white/5 rounded-[40px] p-12 border border-white/5 flex flex-col items-center text-center space-y-4">
                <div className="text-8xl font-black">{averageRating}</div>
                <div className="flex text-yellow-500 pb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={24} className={i >= Math.floor(Number(averageRating)) ? "opacity-20" : ""} />)}
                </div>
                <p className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Dựa trên {reviews.length} đánh giá thực tế</p>

                <div className="w-full pt-10 space-y-4">
                  {[5, 4, 3, 2, 1].map((n) => {
                    // @ts-ignore
                    const count = ratingStats[n];
                    const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
                    return (
                      <div key={n} className="flex items-center space-x-4">
                        <span className="text-[10px] font-bold text-slate-500">{n}</span>
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleReviewAction}
                  className="w-full mt-10 p-4 border border-white/10 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-white/5 transition">
                  {userReview ? "Chỉnh sửa đánh giá của bạn" : "Viết đánh giá"}
                </button>
              </div>
            </div>

            <div className="lg:w-2/3 space-y-12">
              {sortedReviews.length === 0 ? (
                <div className="p-20 border-2 border-dashed border-white/5 rounded-[40px] text-center text-slate-500 font-bold uppercase tracking-widest">
                  Chưa có đánh giá nào cho sản phẩm này.
                </div>
              ) : (
                sortedReviews.map((rev: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`p-10 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6 hover:bg-white/[0.04] transition-all ${rev.userId === user?.id ? 'ring-2 ring-[#e9c349]/40 bg-[#e9c349]/5' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex text-yellow-500">
                        {[...Array(Math.max(0, Math.min(5, Math.floor(rev.rating || 0))))].map((_, i) => <Star key={`fill-${i}`} fill="currentColor" size={14} />)}
                        {[...Array(Math.max(0, 5 - Math.floor(rev.rating || 0)))].map((_, i) => <Star key={`empty-${i}`} size={14} className="opacity-20" />)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : "Hôm nay"}
                      </span>
                    </div>
                    <h4 className="text-2xl font-bold tracking-tight uppercase">
                      {rev.userId === user?.id ? "Đánh giá của bạn" : `Đánh giá từ ${rev.userName || ""}`}
                    </h4>
                    <p className="text-slate-400 font-medium leading-relaxed">{rev.comment ? `"${rev.comment}"` : ""}</p>

                    {rev.adminResponse && (
                      <div className="ml-10 p-6 bg-[#e9c349]/10 border-l-2 border-[#e9c349] rounded-2xl animate-in slide-in-from-left-2">
                        <p className="text-[10px] font-black text-[#e9c349] uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Shield size={12} className="lucide lucide-shield" /> Phản hồi từ Admin:
                        </p>
                        <p className="text-slate-300 text-sm">"{rev.adminResponse}"</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 pt-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs uppercase">
                        {(rev.userName || "U")[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-widest text-white uppercase">
                          {rev.userId === user?.id ? "Bạn" : (rev.userName || "")}
                        </p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Nhà sưu tầm đã xác thực</p>
                      </div>
                    </div>
                  </motion.div>
                )))}

              <button className="w-full py-10 text-[11px] font-black tracking-[0.4em] text-slate-500 uppercase hover:text-white transition group border-t border-white/5">
                Xem thêm đánh giá <ChevronRight className="inline-block ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Atelier-style Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-2xl transition-all duration-500">
          {/* Bluish Glow Background */}
          <div className="absolute inset-0 bg-[#020617]/80" />
          <div className="absolute inset-0 bg-radial-at-c from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#131b2e] w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-12 py-10 flex justify-between items-center border-b border-white/5 bg-linear-to-r from-white/[0.02] to-transparent">
              <div>
                <h2 className="text-3xl font-headline font-black text-white tracking-tighter uppercase">
                  {userReview ? "CẬP NHẬT ĐÁNH GIÁ" : "ĐÁNH GIÁ SẢN PHẨM"}
                </h2>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">
                  {userReview 
                    ? "Lần cập nhật cuối sẽ được ghi nhận vào lịch sử." 
                    : `CHIA SẺ TRẢI NGHIỆM CỦA QUÝ KHÁCH VỀ ${product.productName}`}
                </p>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-12 space-y-10">
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-[#0b1326] border border-white/5">
                <div className="w-16 h-20 bg-[#131b2e] rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                  <img src={currentImage!} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{product.productName}</h4>
                </div>
              </div>

              <div className="space-y-6 text-center">
                <label className="text-[10px] font-black uppercase text-[#e9c349] tracking-[0.3em] block">CHẤT LƯỢNG SẢN PHẨM</label>
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="group relative transition-transform active:scale-90"
                    >
                      <Star
                        size={48}
                        className={`transition-all duration-300 ${star <= reviewRating ? "fill-[#e9c349] text-[#e9c349] drop-shadow-[0_0_15px_rgba(233,195,73,0.5)]" : "text-white/5"}`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-slate-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-500">
                  {reviewRating === 1 && "Rất tệ"}
                  {reviewRating === 2 && "Tệ"}
                  {reviewRating === 3 && "Bình thường"}
                  {reviewRating === 4 && "Hài lòng"}
                  {reviewRating === 5 && "Tuyệt vời"}
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">BÌNH LUẬN CHI TIẾT</label>
                <div className="relative group">
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này nhé..."
                    className="w-full bg-[#0b1326] border border-white/5 rounded-2xl p-6 text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-[#e9c349]/30 transition-all resize-none shadow-inner text-base font-light"
                  />
                </div>
              </div>
            </div>

            <div className="px-12 py-10 bg-white/[0.02] border-t border-white/5 flex gap-4 items-center justify-between">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all px-6"
              >
                HỦY
              </button>
              <button
                onClick={submitReview}
                disabled={saveReviewMutation.isPending || updateReviewMutation.isPending}
                className="flex-[1.5] py-4 bg-[#e9c349] rounded-2xl text-[#0b1326] font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-[0_0_40px_rgba(233,195,73,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saveReviewMutation.isPending || updateReviewMutation.isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  userReview ? <Save size={18} /> : <span><Send size={18} /></span>
                )}
                {userReview ? "LƯU THAY ĐỔI" : "GỬI ĐÁNH GIÁ"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
