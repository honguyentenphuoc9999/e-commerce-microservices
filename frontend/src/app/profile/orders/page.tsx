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
  Loader2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { reviewService } from "@/services/reviewService";
import axios from "axios";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'DELIVERED':
    case 'COMPLETED':
      return { text: 'Đã nhận hàng', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', dot: 'bg-indigo-400', message: 'Kiện hàng đã được giao thành công' };
    case 'SHIPPING':
    case 'SHIPPED':
    case 'IN_TRANSIT':
      return { text: 'Đang giao hàng', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400', message: 'Kiện hàng đang được luân chuyển bởi Atelier Express' };
    case 'PENDING':
    case 'PAYMENT_EXPECTED':
      return { text: 'Chờ thanh toán', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400', message: 'Vui lòng hoàn tất thanh toán để chúng tôi xử lý đơn hàng' };
    case 'PAID':
      return { text: 'Đã thanh toán', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400', message: 'Thanh toán thành công, chúng tôi đang chuẩn bị hàng' };
    case 'CANCELLED':
      return { text: 'Đã hủy', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', dot: 'bg-rose-400', message: 'Đơn hàng này đã được hủy bỏ' };
    case 'REFUND_PENDING':
      return { text: 'Chờ hoàn tiền', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400', message: 'Đang xử lý yêu cầu hoàn tiền của bạn' };
    case 'REFUNDED':
      return { text: 'Đã hoàn tiền', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400', message: 'Đã hoàn tất hoàn trả số tiền giao dịch' };
    default:
      return { text: 'Đang xử lý', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400', message: 'Đơn hàng đang trong trạng thái xử lý' };
  }
};

const OrderHistory = () => {
  const queryClient = React.useMemo(() => new (require("@tanstack/react-query").QueryClient)(), []);
  const { user, token } = useAuthStore();
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  const { data: orders = [], isLoading: ordersLoading, refetch } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8900/api/shop/orders/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!user
  });

  const handleCancelOrder = async (order: any) => {
    const confirmMsg = order.orderStatus === 'PAID' 
      ? "Đơn hàng đã thanh toán. Nếu hủy, chúng tôi sẽ tiến hành hoàn tiền cho bạn. Tiếp tục?" 
      : "Bạn có chắc chắn muốn hủy đơn hàng này?";
    
    if (!confirm(confirmMsg)) return;

    try {
      const newStatus = order.orderStatus === 'PAID' ? 'REFUND_PENDING' : 'CANCELLED';
      await axios.put(`http://localhost:8900/api/shop/orders/${order.id}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Đã gửi yêu cầu hủy đơn hàng thành công");
      refetch();
    } catch (error) {
      console.error("Failed to cancel order", error);
      alert("Có lỗi xảy ra khi hủy đơn hàng");
    }
  };

  const { data: userReviews = [] } = useQuery({
    queryKey: ["userReviews", user?.id],
    queryFn: () => reviewService.getUserReviews(user!.id as string | number),
    enabled: !!user?.id
  });

  const hasReviewed = (productId: any) => {
    return userReviews.some((rev: any) => rev.productId === productId);
  };

  const toggleOrder = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (ordersLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-[#e9c349] animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải lịch sử...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tighter text-white italic">Lịch sử đơn hàng</h1>
          <p className="text-slate-500 mt-2 font-medium">Theo dõi các đơn hàng và quản lý tài sản đã sở hữu.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                className="bg-[#131b2e] border border-white/5 text-sm rounded-xl pl-12 pr-4 py-3 w-64 focus:ring-1 focus:ring-[#e9c349]/40 placeholder:text-slate-600 transition-all outline-none" 
                placeholder="Tìm mã đơn hàng..." 
                type="text"
                suppressHydrationWarning
              />
           </div>
           <button 
             className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all outline-none"
             suppressHydrationWarning
           >
              <Filter size={20} />
           </button>
        </div>
      </header>

      <div className="space-y-6">
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
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className={`bg-[#131b2e]/40 rounded-[2rem] border transition-all duration-500 ${isExpanded ? 'border-[#e9c349]/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'border-white/5 hover:border-white/10'}`}>
                {/* Order Meta Header (Clickable) */}
                <div 
                  onClick={() => toggleOrder(order.id)}
                  className={`px-10 py-6 flex flex-wrap justify-between items-center gap-6 cursor-pointer transition-colors ${isExpanded ? 'bg-[#171f33]/50' : 'hover:bg-[#171f33]/20'}`}
                >
                  <div className="flex gap-12">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Mã đơn</p>
                      <p className="text-sm font-black text-white italic">#ATL-{order.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Thời gian</p>
                      <p className="text-sm font-bold text-slate-300">{new Date(order.orderedDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Tổng cộng</p>
                      <p className="text-sm font-black text-[#e9c349] italic">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusInfo.color} shadow-inner`}>
                       {statusInfo.text}
                    </span>
                    <div className={`p-2 rounded-full bg-white/5 text-slate-500 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-[#e9c349] bg-[#e9c349]/10' : ''}`}>
                       <ChevronRight size={18} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Collapsible Content */}
                <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                  <div className="overflow-hidden">
                    {/* Order Items */}
                    <div className="px-10 py-10 space-y-8 border-t border-white/5">
                      {order.items.map((item: any, idx: number) => {
                        const reviewed = hasReviewed(item.product?.id);
                        return (
                          <div key={idx} className="flex flex-col md:flex-row items-center gap-8 group">
                            <div className="w-20 h-24 bg-[#0b1326] rounded-2xl border border-white/10 overflow-hidden flex-shrink-0 shadow-2xl">
                              <img src={item.product?.image} alt={item.product?.productName} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
                            </div>
                            <div className="flex-1">
                               <h4 className="text-lg font-bold text-white italic mb-2 group-hover:text-[#e9c349] transition-colors">{item.product?.productName}</h4>
                               <div className="flex items-center gap-8">
                                 <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded">SL: 0{item.quantity}</span>
                                 <span className="text-sm text-[#e9c349] font-black italic">{formatPrice(item.subTotal)}</span>
                               </div>
                            </div>
                            {/* Item Specific Actions */}
                            <div className="flex gap-3">
                               <Link 
                                 href={`/product/${item.product?.id}`}
                                 className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-white hover:bg-white/10 hover:border-[#e9c349]/30 transition-all active:scale-95"
                               >
                                 Mua lại
                               </Link>
                               {reviewed ? (
                                 <Link 
                                   href={`/profile/reviews?productId=${item.product?.id}`}
                                   className="px-6 py-2.5 rounded-xl bg-emerald-400/5 border border-emerald-400/20 text-emerald-400 font-black text-[9px] uppercase tracking-widest hover:bg-emerald-400 hover:text-[#0b1326] transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                 >
                                   <CheckCircle size={12} /> Xem đánh giá
                                 </Link>
                               ) : (
                                 <Link 
                                   href={`/profile/reviews?productId=${item.product?.id}&mode=create`}
                                   className="px-6 py-2.5 rounded-xl bg-[#e9c349]/5 border border-[#e9c349]/20 text-[#e9c349] font-black text-[9px] uppercase tracking-widest hover:bg-[#e9c349] hover:text-[#0b1326] transition-all shadow-lg active:scale-95"
                                 >
                                   Đánh giá
                                 </Link>
                               )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Status Bar Section */}
                    <div className="px-12 py-6 bg-[#0b1326]/60 flex justify-between items-center border-t border-white/5">
                       <div className="flex gap-4 items-center">
                          <span className={`w-2 h-2 rounded-full ${statusInfo.dot} shadow-[0_0_8px_rgba(52,211,153,0.5)]`}></span>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.1em]">{statusInfo.message}</p>
                       </div>
                       <div className="flex gap-6">
                          {(order.orderStatus === 'PAYMENT_EXPECTED' || order.orderStatus === 'PAID') && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelOrder(order);
                              }}
                              className="text-[10px] font-black text-rose-400 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group/cancel"
                            >
                               <XCircle size={14} className="group-hover/cancel:rotate-90 transition-transform" /> Hủy đơn hàng
                            </button>
                          )}
                          <button className="text-[10px] font-black text-[#e9c349] hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group/track">
                             <MapPin size={14} className="group-hover/track:animate-bounce" /> Theo dõi hành trình
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {orders.length > 0 && (
        <footer className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] tracking-widest">End of History</p>
        </footer>
      )}
    </div>
  );
};

export default OrderHistory;
