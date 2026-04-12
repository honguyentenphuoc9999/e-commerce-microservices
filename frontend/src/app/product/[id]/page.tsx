"use client";
import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, Truck, RefreshCcw, Minus, Plus, Heart, Share2, ChevronRight, Shield, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService } from "@/services/catalogService";
import { shopService } from "@/services/shopService";
import { reviewService } from "@/services/reviewService";
import { useAuthStore } from "@/store/useAuthStore";

const ProductDetailPage = () => {
  const params = useParams<{id: string}>();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Large");

  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => catalogService.getProductById(params.id as string),
    enabled: !!params.id,
  });

  const cartMutation = useMutation({
    mutationFn: () => shopService.addToCart(product!.id!, quantity),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    },
    onError: () => {
        alert("Có lỗi xảy ra khi thêm vào giỏ hàng.");
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

  const handleAddToCart = () => {
    if (!user) {
        alert("Vui lòng đăng nhập để thêm vào giỏ hàng.");
        return;
    }
    cartMutation.mutate();
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative h-[800px] w-full bg-white/5 rounded-[40px] overflow-hidden group shadow-2xl border border-white/5 flex items-center justify-center p-10"
            >
              {product.image ? (
                <img src={product.image} alt={product.productName} className="object-cover w-full h-full rounded-[30px]" />
              ) : (
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1591047139829-d91aec36caea?q=80&w=1200')] bg-cover bg-center grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </motion.div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="h-96 rounded-3xl overflow-hidden bg-white/5 border border-white/5">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1594932224036-9c23bc4a044f?q=80&w=800')] bg-cover bg-center opacity-70 hover:opacity-100 transition-opacity" />
              </div>
              <div className="h-96 rounded-3xl overflow-hidden bg-white/5 border border-white/5">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1617135671148-99cf2d53c59b?q=80&w=800')] bg-cover bg-center opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Product Info (Right) */}
          <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-32 self-start">
            <div className="space-y-4">
              <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">{product.category?.categoryName || "Default"}</span>
              <h1 className="text-6xl font-black tracking-tighter leading-tight">{product.productName}</h1>
              <div className="flex items-center space-x-6 pt-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={14} className={i === 4 ? "opacity-50" : ""} />)}
                </div>
                <span className="text-[10px] font-bold text-slate-500 tracking-[0.15em] border-l border-white/10 pl-6 uppercase">Đánh giá sản phẩm</span>
              </div>
            </div>

            <div className="text-5xl font-bold tracking-tight text-white mb-6">
              {product.price.toLocaleString()} $
            </div>

            <p className="text-slate-400 font-medium leading-relaxed max-w-lg">
              {product.discription || "Trải nghiệm chuẩn mực mới của sự tĩnh lặng và hiệu suất với tuyệt tác giới hạn của chúng tôi."}
            </p>

            <div className="flex items-center space-x-3 py-4 text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sẵn hàng & Có thể giao ngay</span>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Số lượng</label>
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 px-6">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-blue-500 transition"><Minus size={16}/></button>
                  <span className="text-lg font-bold">{quantity.toString().padStart(2, "0")}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="hover:text-blue-500 transition"><Plus size={16}/></button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Kích cỡ</label>
                <select 
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 px-6 text-sm font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                >
                  <option className="bg-slate-900">Small</option>
                  <option className="bg-slate-900">Medium</option>
                  <option className="bg-slate-900">Large</option>
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
              <button className="bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-xl font-bold text-white tracking-widest uppercase text-sm transition-all">
                Mua ngay
              </button>
            </div>

            <div className="flex justify-between items-center py-8 border-t border-white/5 mt-10">
              <div className="flex items-center space-x-4 text-[11px] font-bold text-slate-500 tracking-widest group">
                <Truck className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span>GIAO HÀNG HỎA TỐC MIỄN PHÍ</span>
              </div>
              <div className="flex items-center space-x-4 text-[11px] font-bold text-slate-500 tracking-widest group">
                <RefreshCcw className="h-5 w-5 text-slate-400 group-hover:text-yellow-500 transition-colors" />
                <span>ĐỔI TRẢ TRONG 30 NGÀY</span>
              </div>
            </div>
            
            <div className="flex space-x-6 pt-4">
              <button className="p-4 rounded-xl border border-white/10 hover:bg-white/10 transition group"><Heart size={20} className="group-hover:fill-pink-500 group-hover:text-pink-500" /></button>
              <button className="p-4 rounded-xl border border-white/10 hover:bg-white/10 transition group"><Share2 size={20} className="group-hover:text-blue-500" /></button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-40 pt-20 border-t border-white/5">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3 space-y-10 sticky top-32 self-start">
               <h2 className="text-4xl font-bold tracking-tighter">Ý Kiến Khách Hàng</h2>
               <div className="bg-white/5 rounded-[40px] p-12 border border-white/5 flex flex-col items-center text-center space-y-4">
                  <div className="text-8xl font-black">{averageRating}</div>
                  <div className="flex text-yellow-500 pb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={24} className={i >= Math.floor(Number(averageRating)) ? "opacity-20" : ""} />)}
                  </div>
                  <p className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Dựa trên {reviews.length} đánh giá thực tế</p>
                  
                  <div className="w-full pt-10 space-y-4">
                     {[5, 4, 3, 2, 1].map((n, i) => (
                       <div key={n} className="flex items-center space-x-4">
                         <span className="text-[10px] font-bold text-slate-500">{n}</span>
                         <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${90 - i * 15}%` }} />
                         </div>
                         <span className="text-[10px] font-bold text-slate-400 w-8">{100 - i * 20}</span>
                       </div>
                     ))}
                  </div>
                  
                  <button 
                    onClick={() => {
                        if(!user) return alert("Vui lòng đăng nhập để đánh giá.");
                        const rating = prompt("Nhập số sao (1-5):", "5");
                        const comment = prompt("Nhập nội dung đánh giá:");
                        if(rating && comment) {
                           reviewService.saveReview(user.id!, product.id!, parseInt(rating), comment)
                            .then(() => {
                                alert("Cảm ơn bạn đã đánh giá!");
                                queryClient.invalidateQueries({ queryKey: ['productReviews'] });
                            })
                            .catch(() => alert("Bạn đã đánh giá sản phẩm này rồi!"));
                        }
                    }}
                    className="w-full mt-10 p-4 border border-white/10 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-white/5 transition">
                    Viết đánh giá
                  </button>
               </div>
            </div>

            <div className="lg:w-2/3 space-y-12">
               {reviews.length === 0 ? (
                  <div className="p-20 border-2 border-dashed border-white/5 rounded-[40px] text-center text-slate-500 font-bold uppercase tracking-widest">
                    Chưa có đánh giá nào cho sản phẩm này.
                  </div>
               ) : (
                 reviews.map((rev: any, idx: number) => (
                 <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`p-10 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6 hover:bg-white/[0.04] transition-all ${rev.userId === user?.id ? 'ring-1 ring-[#e9c349]/20 bg-[#e9c349]/5' : ''}`}
                 >
                    <div className="flex justify-between items-start">
                       <div className="flex text-yellow-500">
                          {[...Array(rev.rating)].map((_, i) => <Star key={i} fill="currentColor" size={14} />)}
                          {[...Array(5 - rev.rating)].map((_, i) => <Star key={i} size={14} className="opacity-20" />)}
                       </div>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : "Hôm nay"}
                       </span>
                    </div>
                    <h4 className="text-2xl font-bold tracking-tight uppercase">Ý kiến từ {rev.userName || "Nhà sưu tầm"}</h4>
                    <p className="text-slate-400 font-medium leading-relaxed italic">"{rev.comment || "Sản phẩm thực sự chất lượng!"}"</p>
                    
                    {rev.adminResponse && (
                       <div className="ml-10 p-6 bg-[#e9c349]/10 border-l-2 border-[#e9c349] rounded-2xl animate-in slide-in-from-left-2">
                          <p className="text-[10px] font-black text-[#e9c349] uppercase tracking-widest mb-2 flex items-center gap-2">
                             <Shield size={12} className="lucide lucide-shield" /> Phản hồi từ Admin:
                          </p>
                          <p className="text-slate-300 text-sm italic">"{rev.adminResponse}"</p>
                       </div>
                    )}

                    <div className="flex items-center space-x-4 pt-4">
                       <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs uppercase">
                         {(rev.userName || "U")[0]}
                       </div>
                       <div>
                          <p className="text-xs font-bold tracking-widest text-white uppercase">{rev.userName || "Người dùng ẩn danh"} {rev.userId === user?.id && <span className="text-[#e9c349] ml-2">(Bạn)</span>}</p>
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

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
