"use client";
import React from "react";
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Truck, 
  Package, 
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams } from "next/navigation";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const getStatusInfo = (status: string, paymentStatus?: string) => {
  switch (status) {
    case 'COMPLETED':
    case 'DELIVERED':
      return { text: 'Đã giao hàng', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' };
    case 'SHIPPING':
    case 'IN_TRANSIT':
      return { text: 'Đang vận chuyển', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' };
    case 'PENDING':
    case 'PAYMENT_EXPECTED':
    case 'PENDING_PAYMENT':
      return { text: 'Chờ thanh toán', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' };
    case 'CANCELLED':
      return paymentStatus === 'REFUNDED'
        ? { text: 'Đã hủy (Đã hoàn tiền)', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400' }
        : { text: 'Đã hủy', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', dot: 'bg-rose-400' };
    case 'REFUNDED':
      return { text: 'Đã hoàn tiền', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400' };
    case 'REFUND_PENDING':
    case 'CHỜ HOÀN TIỀN':
      return { text: 'Chờ hoàn tiền', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' };
    default:
      return { text: status, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400' };
  }
};

const OrderDetail = () => {
  const { token } = useAuthStore();
  const params = useParams();
  const orderId = params.id;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["userOrder", orderId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8900/api/shop/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!orderId && !!token
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <Loader2 className="w-12 h-12 text-[#e9c349] animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải chi tiết đơn hàng #{orderId}...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 text-center">
        <Package size={64} className="text-slate-700" />
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-slate-500 max-w-sm">Mã đơn hàng #{orderId} không tồn tại hoặc bạn không có quyền truy cập.</p>
        </div>
        <Link href="/profile/orders" className="px-8 py-3 bg-[#e9c349] text-[#0b1326] font-bold rounded-xl active:scale-95 transition-all">
          Quay lại lịch sử
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.orderStatus, order.paymentStatus);

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="space-y-4">
        <Link href="/profile/orders" className="flex items-center gap-2 text-slate-400 hover:text-[#e9c349] transition-all text-xs font-bold uppercase tracking-widest group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại lịch sử
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-headline font-extrabold text-white tracking-tighter italic">Chi tiết đơn #PT-{order.id}</h1>
            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${statusInfo.color}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
               {statusInfo.text}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Đặt ngày {new Date(order.orderedDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="px-10 py-6 border-b border-white/5 bg-[#171f33]/30">
              <h2 className="font-headline text-lg font-bold text-white uppercase tracking-widest italic">Sản phẩm</h2>
            </div>
            <div className="divide-y divide-white/5">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-10 flex items-center gap-8 group">
                  <div className="w-24 h-32 bg-[#0b1326] rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-[#e9c349]/30 transition-all duration-500 shadow-xl">
                    <img src={item.product?.image} alt={item.product?.productName} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-headline text-xl font-bold text-white group-hover:text-[#e9c349] transition-colors italic">{item.product?.productName}</h3>
                      <p className="text-white font-black italic">{formatPrice(item.subTotal)}</p>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">SKU: PT-ITEM-{item.product?.id}</p>
                    <div className="flex gap-10 pt-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Đơn giá</p>
                        <p className="text-sm font-bold text-slate-300">{formatPrice(item.product?.price || 0)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Số lượng</p>
                        <p className="text-sm font-bold text-slate-300">× 0{item.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="p-10 bg-[#0b1326]/50 border-t border-white/5 flex justify-end">
              <div className="w-72 space-y-4">
                <div className="flex justify-between text-sm text-slate-400 font-medium">
                  <span>Tạm tính</span>
                  <span className="text-white font-bold">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400 font-medium">
                  <span>Giảm giá</span>
                  <span className="text-rose-400 font-bold">-{formatPrice(order.discountAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400 font-medium">
                  <span>Vận chuyển</span>
                  <span className="text-emerald-400 font-black uppercase text-[10px] tracking-widest italic">Miễn phí</span>
                </div>
                <div className="flex justify-between text-2xl font-headline font-black text-[#e9c349] pt-6 border-t border-white/10 italic">
                  <span>Tổng cộng</span>
                  <span>{formatPrice((order.total || 0) - (order.discountAmount || 0))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Reason (If any) */}
          {(order.orderStatus === 'CANCELLED' || order.orderStatus === 'REFUND_PENDING' || order.orderStatus === 'REFUNDED') && order.cancellationReason && (
            <div className="bg-rose-500/5 rounded-[2.5rem] border border-rose-500/10 p-10 space-y-4 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-rose-500">
                <AlertCircle size={20} />
                <h2 className="font-headline text-lg font-bold uppercase tracking-widest italic">Thông tin hủy đơn</h2>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic ml-8">
                "{order.cancellationReason}"
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black ml-8 pt-2">
                Trạng thái hiện tại: {getStatusInfo(order.orderStatus).text}
              </p>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 shadow-2xl p-10 space-y-10 backdrop-blur-xl">
            <h2 className="font-headline text-lg font-bold text-white uppercase tracking-widest italic">Trạng thái xử lý</h2>
            <div className="relative space-y-10 before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-white/5">
              {/* Special Flow for Refunded/Cancelled */}
              {['REFUNDED', 'REFUND_PENDING', 'CANCELLED'].includes(order.orderStatus) ? (
                <>
                   <div className="relative pl-12">
                    <span className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[#0b1326] shadow-lg ${order.orderStatus === 'REFUNDED' || order.orderStatus === 'CANCELLED' ? 'bg-rose-400 shadow-rose-400/20' : 'bg-white/5 text-slate-600 border border-white/5'}`}>
                      <CheckCircle size={14} />
                    </span>
                    <p className={`text-sm font-black uppercase tracking-widest ${order.orderStatus === 'REFUNDED' || order.orderStatus === 'CANCELLED' ? 'text-white' : 'text-slate-600'}`}>
                      {order.orderStatus === 'REFUNDED' ? 'Hoàn tiền thành công' : 'Đã hủy đơn hàng'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Giao dịch đã kết thúc</p>
                  </div>
                  <div className="relative pl-12">
                    <span className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[#0b1326] shadow-lg ${['REFUND_PENDING', 'REFUNDED', 'CANCELLED'].includes(order.orderStatus) ? 'bg-amber-400 shadow-amber-400/20' : 'bg-white/5 text-slate-600 border border-white/5'}`}>
                      <Loader2 size={14} className={order.orderStatus === 'REFUND_PENDING' ? 'animate-spin' : ''} />
                    </span>
                    <p className={`text-sm font-black uppercase tracking-widest ${['REFUND_PENDING', 'REFUNDED', 'CANCELLED'].includes(order.orderStatus) ? 'text-white' : 'text-slate-600'}`}>
                      {order.orderStatus === 'CANCELLED' ? 'Đã tiếp nhận yêu cầu hủy' : 'Đang xử lý hoàn tiền'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Hệ thống đang kiểm tra</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative pl-12">
                    <span className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[#0b1326] shadow-lg ${order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED' ? 'bg-emerald-400 shadow-emerald-400/20' : 'bg-white/5 text-slate-600 border border-white/5'}`}>
                      <CheckCircle size={14} />
                    </span>
                    <p className={`text-sm font-black uppercase tracking-widest ${order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED' ? 'text-white' : 'text-slate-600'}`}>Giao hàng thành công</p>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Phuoc Techno Express Delivery</p>
                  </div>
                  <div className="relative pl-12">
                    <span className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[#0b1326] shadow-lg ${['SHIPPING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.orderStatus) ? 'bg-blue-400 shadow-blue-400/20' : 'bg-white/5 text-slate-600 border border-white/5'}`}>
                      <Truck size={14} />
                    </span>
                    <p className={`text-sm font-black uppercase tracking-widest ${['SHIPPING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.orderStatus) ? 'text-white' : 'text-slate-600'}`}>Đang giao hàng</p>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">In Transit</p>
                  </div>
                </>
              )}
              <div className="relative pl-12">
                <span className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[#0b1326] shadow-lg ${order.paymentStatus === 'PAID' ? 'bg-emerald-400 shadow-emerald-400/20' : 'bg-amber-400 shadow-amber-400/20'}`}>
                  <CreditCard size={14} />
                </span>
                <p className="text-sm font-black uppercase tracking-widest text-white">{order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Đang chờ thanh toán'}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Payment Verified</p>
              </div>
              <div className="relative pl-12">
                <span className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#0b1326] shadow-lg shadow-white/20">
                  <Package size={14} />
                </span>
                <p className="text-sm font-black uppercase tracking-widest text-white">Đơn hàng đã đặt</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Order Received</p>
              </div>
            </div>
          </div>

          {/* Journey Tracking Map */}
          <div className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="px-10 py-6 border-b border-white/5 bg-[#171f33]/30 flex justify-between items-center">
              <h2 className="font-headline text-lg font-bold text-white uppercase tracking-widest italic">Theo dõi hành trình</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#e9c349] animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đang cập nhật trực tiếp</span>
              </div>
            </div>
            <div className="h-[450px] relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14092.747951054587!2d86.91506696576941!3d27.98817501453479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e854a215bd9ebd%3A0x576dcf806abbab2!2zxJDhu4luaCBFdmVy Everest!5e0!3m2!1svi!2s!4v1777145449427!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              ></iframe>
              <div className="absolute bottom-8 left-8 right-8 bg-[#0b1326]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom-4 duration-1000">
                <div>
                  <p className="text-[10px] font-black text-[#e9c349] uppercase tracking-widest mb-1">Điểm đến hiện tại</p>
                  <p className="text-white font-bold italic">{order.shippingAddress || order.user?.address || "Địa chỉ khách hàng"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dự kiến nhận</p>
                  <p className="text-white font-bold italic">Trong 2 ngày tới</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Cards */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#131b2e]/60 rounded-[2.5rem] border border-white/5 shadow-2xl p-10 space-y-8 backdrop-blur-2xl">
            <h2 className="font-headline text-sm font-black text-white uppercase tracking-[0.2em] italic">Vận chuyển tới</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-3 bg-[#e9c349]/10 rounded-2xl text-[#e9c349] h-fit">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Địa chỉ</p>
                  <p className="text-sm font-bold text-slate-300 leading-relaxed italic">
                    {order.user?.address || "Địa chỉ đã lưu của khách hàng"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-3 bg-white/5 rounded-2xl text-slate-400 h-fit">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Phương thức</p>
                  <p className="text-sm font-bold text-slate-300 italic">Phuoc Techno Express (Ưu tiên)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#131b2e]/60 rounded-[2.5rem] border border-white/5 shadow-2xl p-10 space-y-8 backdrop-blur-2xl">
            <h2 className="font-headline text-sm font-black text-white uppercase tracking-[0.2em] italic">Thanh toán</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-3 bg-emerald-400/10 rounded-2xl text-emerald-400 h-fit">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Trạng thái</p>
                  <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">
                    {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ xử lý'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
