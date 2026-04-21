"use client";
import React from "react";
import { 
  ArrowLeft, 
  Printer, 
  Mail, 
  MapPin, 
  CreditCard, 
  Truck, 
  Package, 
  ChevronRight,
  MoreVertical,
  CheckCircle,
  Clock,
  User,
  ExternalLink,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'COMPLETED':
    case 'DELIVERED':
      return { text: 'Đã giao hàng', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' };
    case 'SHIPPING':
    case 'IN_TRANSIT':
      return { text: 'Đang vận chuyển', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' };
    case 'PENDING':
    case 'PAYMENT_EXPECTED':
      return { text: 'Chờ thanh toán', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' };
    case 'CANCELLED':
      return { text: 'Đã hủy', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', dot: 'bg-rose-400' };
    default:
      return { text: status, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400' };
  }
};

const OrderDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: orderId } = React.use(params);
  const { token } = useAuthStore();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["adminOrder", orderId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8900/api/admin-bff/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!orderId && !!token
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="w-12 h-12 text-[#e9c349] animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải chi tiết đơn hàng #{orderId}...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 text-center">
        <Package size={64} className="text-slate-700" />
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-slate-500 max-w-sm">Mã đơn hàng #{orderId} không tồn tại hoặc bạn không có quyền truy cập.</p>
        </div>
        <Link href="/admin/orders" className="px-8 py-3 bg-[#e9c349] text-[#0b1326] font-bold rounded-xl active:scale-95 transition-all">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.orderStatus);

  return (
    <div className="p-12 space-y-12 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <Link href="/admin/orders" className="flex items-center gap-2 text-slate-400 hover:text-[#e9c349] transition-all text-xs font-bold uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Quay lại danh sách
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-headline font-extrabold text-white tracking-tighter">Đơn hàng #ATL-{order.id}</h1>
            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${statusInfo.color}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
               {statusInfo.text}
            </span>
          </div>
          <p className="text-slate-500 text-sm">Thanh toán vào ngày {new Date(order.orderedDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })} lúc 14:32</p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
            <Printer size={20} />
          </button>
          <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
            <Mail size={20} />
          </button>
          <button className="px-6 py-3 bg-[#e9c349] text-[#0b1326] font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#e9c349]/20 flex items-center gap-2">
            Thay đổi trạng thái
          </button>
        </div>
      </header>

      {/* Order Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Order Items */}
        <div className="lg:col-span-8 space-y-8">
          {/* Items Card */}
          <div className="bg-[#131b2e] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 bg-[#171f33]/30 flex justify-between items-center">
              <h2 className="font-headline text-xl font-bold text-white">Sản phẩm đơn hàng</h2>
              <span className="text-slate-500 text-xs uppercase tracking-widest font-bold">{order.items.length} Sản phẩm</span>
            </div>
            <div className="divide-y divide-white/5">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-8 flex items-center gap-8 group">
                  <div className="w-24 h-32 bg-[#171f33] rounded-xl overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-[#e9c349]/30 transition-all duration-500 shadow-xl">
                    <img src={item.product?.image} alt={item.product?.productName} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-headline text-lg font-bold text-white group-hover:text-[#e9c349] transition-colors">{item.product?.productName || 'Sản phẩm không xác định'}</h3>
                      <p className="text-white font-bold">{formatPrice(item.subTotal)}</p>
                    </div>
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">SKU-{item.product?.id || 'N/A'}</p>
                    <p className="text-xs text-slate-400 bg-white/5 inline-block px-2 py-1 rounded-md">Mặc định</p>
                    <div className="flex gap-8 pt-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Đơn giá</p>
                        <p className="text-sm font-medium text-slate-300">{formatPrice(item.product?.price || 0)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Số lượng</p>
                        <p className="text-sm font-medium text-slate-300">× {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals Section */}
            <div className="p-8 bg-[#0b1326]/50 border-t border-white/5 flex justify-end">
              <div className="w-72 space-y-4">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Tạm tính</span>
                  <span className="text-white">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Giảm giá voucher</span>
                  <span className="text-rose-400">-{formatPrice(order.discountAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Phí vận chuyển</span>
                  <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest">
                    {order.shippingMethod === 'express' ? formatPrice(50000) : formatPrice(20000)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-headline font-black text-[#e9c349] pt-4 border-t border-white/10">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(order.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Activity */}
          <div className="bg-[#131b2e] rounded-2xl border border-white/5 shadow-2xl p-8 space-y-8">
            <h2 className="font-headline text-xl font-bold text-white">Theo dõi hành trình</h2>
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-white/5">
              {/* Step 4: Delivered */}
              <div className="relative pl-10">
                <span className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[#0b1326] shadow-lg transition-all duration-700 ${order.orderStatus === 'DELIVERED' ? 'bg-indigo-400 shadow-indigo-400/40 animate-pulse' : 'bg-[#171f33] border border-white/10 text-slate-500'}`}>
                  <CheckCircle size={14} />
                </span>
                <p className={`text-sm font-bold uppercase tracking-widest ${order.orderStatus === 'DELIVERED' ? 'text-white' : 'text-slate-500'}`}>Giao hàng thành công</p>
                <p className="text-xs text-slate-500 mt-1">{order.orderStatus === 'DELIVERED' ? 'Khách đã nhận kiện hàng' : 'Chưa hoàn tất'}</p>
              </div>

              {/* Step 3: Shipped */}
              <div className="relative pl-10">
                <span className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[#0b1326] shadow-lg transition-all duration-700 ${order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED' ? 'bg-blue-400 shadow-blue-400/40' : 'bg-[#171f33] border border-white/10 text-slate-500'}`}>
                  <Truck size={14} />
                </span>
                <p className={`text-sm font-bold uppercase tracking-widest ${order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED' ? 'text-white' : 'text-slate-500'}`}>Đang giao hàng</p>
                <p className="text-xs text-slate-500 mt-1">{order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED' ? 'Kiện hàng đang trên đường' : 'Chờ vận chuyển'}</p>
              </div>

              {/* Step 2: Paid */}
              <div className="relative pl-10">
                <span className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[#0b1326] shadow-lg transition-all duration-700 ${order.paymentStatus === 'PAID' ? 'bg-emerald-400 shadow-emerald-400/40' : 'bg-[#171f33] border border-white/10 text-slate-500'}`}>
                  <CreditCard size={14} />
                </span>
                <p className={`text-sm font-bold uppercase tracking-widest ${order.paymentStatus === 'PAID' ? 'text-white' : 'text-slate-500'}`}>Đã thanh toán</p>
                <p className="text-xs text-slate-500 mt-1">{order.paymentStatus === 'PAID' ? 'Giao dịch đã được xác nhận' : 'Đang chờ tiền vào ví'}</p>
              </div>

              {/* Step 1: Placed */}
              <div className="relative pl-10">
                <span className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#0b1326] shadow-lg shadow-white/20">
                  <Package size={14} />
                </span>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Đơn hàng đã đặt</p>
                <p className="text-xs text-slate-500 mt-1">Hệ thống đã tiếp nhận đơn hàng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Customer & Shipping Info */}
        <div className="lg:col-span-4 space-y-8">
          {/* Customer Card */}
          <div className="bg-[#131b2e] rounded-2xl border border-white/5 shadow-2xl p-8 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="font-headline text-lg font-bold text-white uppercase tracking-widest">Khách hàng</h2>
              <button className="text-slate-500 hover:text-white transition-colors"><MoreVertical size={18} /></button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#2d3449] border-2 border-[#e9c349]/20 flex items-center justify-center text-xl font-bold text-[#e9c349] font-headline shadow-2xl uppercase">
                {order.user?.userName?.slice(0, 2) || 'US'}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{order.user?.userName || 'Khách hàng'}</h4>
                <p className="text-xs text-slate-500">Mã khách hàng: #USR-{order.user?.id}</p>
              </div>
            </div>
            <div className="space-y-6 pt-8 border-t border-white/5">
              <div className="flex gap-4">
                <span className="p-2 bg-white/5 rounded-lg text-slate-500 h-fit"><Mail size={16} /></span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-300">{order.user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="p-2 bg-white/5 rounded-lg text-slate-500 h-fit"><User size={16} /></span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Họ tên</p>
                  <p className="text-sm font-medium text-slate-300">{order.user?.userName}</p>
                </div>
              </div>
              <Link href={`/admin/users/${order.user?.id}`} className="w-full py-4 bg-[#222a3d] text-white text-center rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#2d3449] transition-all flex items-center justify-center gap-2 border border-white/5">
                Xem hồ sơ khách hàng
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>

          {/* Shipping Card */}
          <div className="bg-[#131b2e] rounded-2xl border border-white/5 shadow-2xl p-8 space-y-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
              <MapPin size={80} />
            </div>
            <h2 className="font-headline text-lg font-bold text-white uppercase tracking-widest">Thông tin vận chuyển</h2>
            <div className="space-y-6 relative z-10">
              <div className="flex gap-4">
                <span className="p-2 bg-[#e9c349]/10 rounded-lg text-[#e9c349] h-fit"><MapPin size={16} /></span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Địa chỉ giao hàng</p>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed italic opacity-80">
                    {order.shippingAddress || 'Chưa cập nhật địa chỉ'}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="p-2 bg-[#e9c349]/10 rounded-lg text-[#e9c349] h-fit"><Truck size={16} /></span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Phương thức</p>
                  <p className="text-sm font-medium text-slate-300">
                    {order.shippingMethod === 'express' ? 'Giao hàng Hỏa tốc (Express)' : 'Giao hàng Tiêu chuẩn (Standard)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-[#131b2e] rounded-2xl border border-white/5 shadow-2xl p-8 space-y-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
              <CreditCard size={80} />
            </div>
            <h2 className="font-headline text-lg font-bold text-white uppercase tracking-widest">Thanh toán</h2>
            <div className="space-y-6 relative z-10">
              <div className="flex gap-4">
                <span className={`p-2 rounded-lg h-fit ${order.paymentStatus === 'PAID' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-[#e9c349]/10 text-[#e9c349]'}`}>
                  <CreditCard size={16} />
                </span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Trạng thái</p>
                  <p className={`text-sm font-bold uppercase ${order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-[#e9c349]'}`}>
                    {order.paymentStatus === 'PAID' ? 'Đã thanh toán (Captured)' : 'Chờ thanh toán (Pending)'}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="p-2 bg-emerald-400/10 rounded-lg text-emerald-400 h-fit"><CheckCircle size={16} /></span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Giao dịch</p>
                  <p className="text-sm font-medium text-slate-300 font-mono">txn_ATL_{order.id}_{order.user?.id}</p>
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
