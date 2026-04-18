"use client";
import React from "react";
import { 
  Package, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Search,
  Filter,
  CheckCircle,
  Truck,
  RotateCcw,
  ArrowRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'COMPLETED':
    case 'DELIVERED':
      return { text: 'Đã giao hàng', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
    case 'SHIPPING':
    case 'IN_TRANSIT':
      return { text: 'Đang vận chuyển', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
    case 'PENDING':
    case 'PAYMENT_EXPECTED':
      return { text: 'Chờ thanh toán', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
    case 'CANCELLED':
      return { text: 'Đã hủy', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' };
    default:
      return { text: status, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' };
  }
};

const OrderHistory = () => {
  const { user, token } = useAuthStore();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8900/api/shop/orders/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-[#e9c349] animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải lịch sử...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tighter text-white italic">Lịch sử mua hàng</h1>
          <p className="text-slate-500 mt-2 font-medium">Theo dõi các đơn hàng và quản lý tài sản đã sở hữu.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                className="bg-[#131b2e] border border-white/5 text-sm rounded-xl pl-12 pr-4 py-3 w-64 focus:ring-1 focus:ring-[#e9c349]/40 placeholder:text-slate-600 transition-all outline-none" 
                placeholder="Tìm mã đơn hàng..." 
                type="text"
              />
           </div>
           <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
              <Filter size={20} />
           </button>
        </div>
      </header>

      <div className="space-y-8">
        {orders.length === 0 ? (
          <div className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 shadow-2xl p-24 flex flex-col items-center justify-center text-center">
            <Package size={64} className="text-slate-600 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Không có lịch sử mua hàng</h2>
            <p className="text-slate-500 mb-8 max-w-md">Bạn chưa thực hiện bất kỳ giao dịch nào tại Atelier. Hãy khám phá ngay các bộ sưu tập để bắt đầu mua sắm.</p>
            <Link href="/collections" className="px-10 py-4 bg-[#e9c349] text-[#0b1326] font-black uppercase tracking-widest text-xs rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(233,195,73,0.3)]">
               Khám phá không gian
            </Link>
          </div>
        ) : (
          orders.map((order: any) => {
            const statusInfo = getStatusInfo(order.orderStatus);
            return (
              <div key={order.id} className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden group hover:border-[#e9c349]/10 transition-all duration-500">
                {/* Order Meta Header */}
                <div className="px-12 py-8 border-b border-white/5 bg-[#171f33]/30 flex flex-wrap justify-between items-center gap-6">
                  <div className="flex gap-12">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Đơn hàng</p>
                      <p className="text-sm font-black text-white italic group-hover:text-[#e9c349] transition-colors">#ATL-{order.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Ngày đặt</p>
                      <p className="text-sm font-bold text-slate-300">{new Date(order.orderedDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Tổng thanh toán</p>
                      <p className="text-sm font-bold text-white italic">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusInfo.color} shadow-inner`}>
                       {statusInfo.text}
                    </span>
                    <Link href={`/profile/orders/${order.id}`} className="text-[#e9c349] hover:text-white transition-all text-sm font-black flex items-center gap-2 group/link">
                       Chi tiết
                       <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-12 space-y-8">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col md:flex-row items-center gap-10">
                      <div className="w-24 h-32 bg-[#0b1326] rounded-2xl border border-white/10 group-hover:border-[#e9c349]/20 transition-all duration-500 overflow-hidden flex-shrink-0 shadow-xl group/img">
                        <img src={item.product?.image} alt={item.product?.productName} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 group-hover/img:scale-110" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-xl font-bold text-white italic group-hover:text-[#e9c349] transition-colors">{item.product?.productName}</h4>
                          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">Mã sản phẩm: ATL-ITEM-{item.product?.id}</p>
                        </div>
                        <div className="flex items-center gap-8 pt-2">
                           <span className="text-sm font-bold text-slate-300">Số lượng: 0{item.quantity}</span>
                           <span className="text-sm font-black text-white italic">{formatPrice(item.subTotal)}</span>
                        </div>
                      </div>
                      <div className="flex gap-4">
                         <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all hover:bg-white/10">Mua lại</button>
                         <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all hover:bg-white/10">Viết đánh giá</button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Quick Status Bar */}
                <div className="px-12 py-6 bg-[#0b1326]/40 flex justify-between items-center border-t border-white/5">
                   <div className="flex gap-4 items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Giao thành công bởi Atelier Express</p>
                   </div>
                   <button className="text-[10px] font-black text-slate-400 hover:text-[#e9c349] transition-all uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} /> Xem hành trình vận chuyển
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {orders.length > 0 && (
        <footer className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] tracking-widest">Đang hiển thị {orders.length} đơn hàng gần nhất</p>
           <button className="px-12 py-4 rounded-full bg-linear-to-br from-[#171f33] to-[#0b1326] text-white border border-white/10 font-black text-xs uppercase tracking-widest hover:border-[#e9c349]/30 transition-all shadow-xl active:scale-95">Xem toàn bộ lịch sử</button>
        </footer>
      )}
    </div>
  );
};

export default OrderHistory;
