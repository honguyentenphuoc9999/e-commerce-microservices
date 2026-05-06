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
  Loader2,
  Banknote,
  AlertCircle,
  RotateCcw,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const getStatusInfo = (status: string, paymentStatus?: string) => {
  switch (status) {
    case 'PAID':
      return { text: 'Đã thanh toán', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' };
    case 'DELIVERED':
    case 'COMPLETED':
      return { text: 'Hoàn tất', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', dot: 'bg-indigo-400' };
    case 'SHIPPED':
    case 'SHIPPING':
    case 'IN_TRANSIT':
      return { text: 'Đang giao', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' };
    case 'CANCELLED':
      return paymentStatus === 'REFUNDED'
        ? { text: 'Đã hủy (Đã hoàn tiền)', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400' }
        : { text: 'Đã hủy', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', dot: 'bg-rose-400' };
    case 'REFUND_PENDING':
    case 'CHỜ HOÀN TIỀN':
      return { text: 'Chờ hoàn tiền', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400' };
    case 'REFUNDED':
      return { text: 'Đã hoàn tiền', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400' };
    case 'PENDING':
    case 'PROCESSING':
    case 'PENDING_PAYMENT':
      return paymentStatus !== 'PAID' 
        ? { text: 'Chờ thanh toán', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' }
        : { text: 'Đang xử lý', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' };
    default:
      return { text: 'Đang xử lý', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' };
  }
};

const OrderDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: orderId } = React.use(params);
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState("overview"); // "overview", "payment", "logistics"
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("Sản phẩm hết hàng");
  const [isUpdating, setIsUpdating] = React.useState(false);

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

  const statusInfo = getStatusInfo(order.orderStatus, order.paymentStatus);

  const tabs = [
    { id: "overview", label: "Tổng quan đơn hàng", icon: Package },
    { id: "payment", label: "Thanh toán & Tài chính", icon: CreditCard },
    { id: "logistics", label: "Vận chuyển & Khách hàng", icon: Truck },
  ];

  const cancelReasons = [
    "Sản phẩm hết hàng",
    "Khách hàng yêu cầu hủy",
    "Địa chỉ giao hàng không hợp lệ",
    "Đơn hàng có dấu hiệu gian lận",
    "Sản phẩm bị lỗi kỹ thuật",
    "Sai sót về giá hiển thị",
    "Khác (Liên hệ để biết thêm chi tiết)"
  ];

  const handleUpdateStatus = async (newStatus: string, reason?: string) => {
    try {
      setIsUpdating(true);
      const url = `http://localhost:8900/api/admin-bff/orders/${order.id}/status?status=${newStatus}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`;
      await axios.put(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Cập nhật trạng thái thành công: ${newStatus}`);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái đơn hàng");
    } finally {
      setIsUpdating(false);
      setIsCancelModalOpen(false);
    }
  };

  return (
    <div className="p-12 space-y-12 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-700">
      {/* Cancel Reason Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#131b2e] border border-white/10 rounded-3xl p-10 max-w-md w-full space-y-8 shadow-3xl animate-in zoom-in-95 duration-300">
            <div className="space-y-2 text-center">
              <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white uppercase italic">Xác nhận hủy đơn</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Vui lòng chọn lý do để thông báo cho khách hàng</p>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Lý do hủy đơn</label>
              <select 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-[#0b1326] border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-rose-500/40"
              >
                {cancelReasons.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Đóng
              </button>
              <button 
                disabled={isUpdating}
                onClick={() => handleUpdateStatus("CANCELLED", cancelReason)}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isUpdating ? "Đang xử lý..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Actions */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <Link href="/admin/orders" className="flex items-center gap-2 text-slate-400 hover:text-[#e9c349] transition-all text-xs font-bold uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Quay lại danh sách
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-headline font-extrabold text-white tracking-tighter uppercase italic">Đơn #PT-{order.id}</h1>
            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${statusInfo.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
              {statusInfo.text}
            </span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Ngày đặt: {new Date(order.orderedDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          
          {/* Nút hành động chính (Primary Action) */}
          {order.orderStatus === 'SHIPPED' && (
            <button 
              onClick={() => handleUpdateStatus("COMPLETED")}
              disabled={isUpdating}
              className="px-8 py-4 bg-emerald-500 text-[#0b1326] font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20 flex items-center gap-3 text-xs uppercase tracking-widest"
            >
              <CheckCircle size={18} /> Hoàn tất đơn hàng
            </button>
          )}
          
          {(order.orderStatus === 'PAID' || (order.orderStatus === 'PENDING' && order.paymentStatus === 'PAID')) && (
            <button 
              onClick={() => handleUpdateStatus("SHIPPED")}
              disabled={isUpdating}
              className="px-8 py-4 bg-blue-500 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-3 text-xs uppercase tracking-widest"
            >
              <Truck size={18} /> Giao hàng ngay
            </button>
          )}
        </div>
      </header>

      {/* Professional Tab Navigation */}
      <div className="flex gap-2 p-1 bg-[#131b2e] rounded-2xl border border-white/5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? "bg-[#e9c349] text-[#0b1326] shadow-xl" 
                : "text-slate-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Area (8 cols) */}
        <div className="lg:col-span-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === "overview" && (
            <>
              {/* Cancellation Information */}
              {order.cancellationReason && (
                <div className="bg-rose-500/5 rounded-3xl border border-rose-500/10 p-10 mb-8 space-y-4 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center gap-3 text-rose-500">
                    <AlertCircle size={20} />
                    <h2 className="font-headline text-lg font-bold uppercase tracking-widest italic">Lý do hủy/hoàn tiền</h2>
                  </div>
                  <p className="text-slate-300 text-sm italic ml-8">
                    "{order.cancellationReason}"
                  </p>
                </div>
              )}

              {/* Items Card */}
              <div className="bg-[#131b2e] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="px-10 py-8 border-b border-white/5 bg-[#171f33]/30 flex justify-between items-center">
                  <h2 className="font-headline text-xl font-black text-white uppercase italic tracking-tight">Sản phẩm đơn hàng</h2>
                  <span className="px-4 py-1.5 bg-white/5 rounded-full text-slate-500 text-[10px] uppercase tracking-widest font-black border border-white/5">{order.items.length} Units</span>
                </div>
                <div className="divide-y divide-white/5">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-10 flex items-center gap-10 group hover:bg-white/[0.02] transition-colors">
                      <div className="w-28 h-36 bg-[#0b1326] rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-[#e9c349]/40 transition-all duration-700 shadow-2xl relative">
                        <img src={item.product?.image} alt={item.product?.productName} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black text-[#e9c349] uppercase">PT-{item.product?.id}</div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-headline text-2xl font-black text-white group-hover:text-[#e9c349] transition-colors leading-tight italic">{item.product?.productName}</h3>
                          <p className="text-white font-black text-xl italic">{formatPrice(item.subTotal)}</p>
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{item.product?.category?.categoryName || "ĐIỆN TỬ"}</p>
                        <div className="flex gap-12 pt-4">
                          <div>
                            <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Đơn giá</p>
                            <p className="text-sm font-black text-slate-400">{formatPrice(item.product?.price || 0)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Số lượng</p>
                            <p className="text-sm font-black text-[#e9c349]">× {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Totals Section */}
                <div className="p-10 bg-[#0b1326]/30 border-t border-white/5 flex justify-end">
                  <div className="w-80 space-y-5">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                      <span>Giá trị hàng hóa</span>
                      <span className="text-white">{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                      <span>Chiết khấu Voucher</span>
                      <span className="text-rose-500">-{formatPrice(order.discountAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                      <span>Phí vận chuyển</span>
                      <span className="text-emerald-400">
                        {order.shippingMethod === 'express' ? formatPrice(50000) : formatPrice(20000)}
                      </span>
                    </div>
                    <div className="flex justify-between text-3xl font-headline font-black text-[#e9c349] pt-6 border-t border-white/10 italic">
                      <span>Tổng tiền</span>
                      <span>{formatPrice(order.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#131b2e] rounded-3xl border border-white/5 shadow-2xl p-10 space-y-10">
                <h2 className="font-headline text-xl font-black text-white uppercase italic tracking-tight">Theo dõi hành trình</h2>
                <div className="relative space-y-10 before:absolute before:inset-0 before:ml-[15px] before:w-0.5 before:bg-white/5">
                  {/* Step 1: Placed - Always exists */}
                  <div className="relative pl-12">
                    <span className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[#e9c349] flex items-center justify-center text-[#0b1326] shadow-xl shadow-[#e9c349]/20 z-10">
                      <Package size={16} />
                    </span>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Đơn hàng đã được khởi tạo</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Hệ thống ghi nhận lúc {new Date(order.orderedDate).toLocaleTimeString()}</p>
                  </div>

                  {['REFUNDED', 'REFUND_PENDING', 'CANCELLED'].includes(order.orderStatus) ? (
                    <>
                      {/* Step 2: Payment (if paid before refund) */}
                      {order.paymentStatus === 'PAID' && (
                        <div className="relative pl-12">
                          <span className="absolute left-0 top-1 w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-[#0b1326] shadow-xl z-10">
                            <CreditCard size={16} />
                          </span>
                          <p className="text-xs font-black text-white uppercase tracking-widest">Xác thực thanh toán</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Giao dịch đã thành công trước đó</p>
                        </div>
                      )}

                      {/* Step 3: Refund/Cancel Process */}
                      <div className="relative pl-12">
                        <span className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center text-[#0b1326] shadow-xl z-10 transition-all duration-700 ${['REFUND_PENDING', 'REFUNDED'].includes(order.orderStatus) ? 'bg-orange-400 animate-pulse' : 'bg-rose-400'}`}>
                          {order.orderStatus === 'CANCELLED' ? <AlertCircle size={16} /> : <RotateCcw size={16} />}
                        </span>
                        <p className={`text-xs font-black uppercase tracking-widest text-white`}>
                          {order.orderStatus === 'CANCELLED' ? 'Đã yêu cầu hủy đơn' : 'Đang xử lý hoàn tiền'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Trạng thái: {order.orderStatus}</p>
                      </div>

                      {/* Step 4: Final State */}
                      {['REFUNDED', 'CANCELLED'].includes(order.orderStatus) && (
                        <div className="relative pl-12">
                          <span className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center text-[#0b1326] shadow-xl z-10 ${order.orderStatus === 'REFUNDED' ? 'bg-slate-400' : 'bg-rose-600'}`}>
                            <CheckCircle size={16} />
                          </span>
                          <p className="text-xs font-black text-white uppercase tracking-widest">Hành trình kết thúc</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">
                            {order.orderStatus === 'REFUNDED' ? 'Tiền đã được hoàn trả thành công' : 'Đơn hàng đã được đóng vĩnh viễn'}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Step 2: Payment Verification */}
                      <div className="relative pl-12">
                        <span className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center shadow-xl z-10 transition-all duration-700 ${order.paymentStatus === 'PAID' ? 'bg-emerald-500 text-white shadow-emerald-500/40' : 'bg-amber-500/20 border border-amber-500/40 text-amber-500 animate-pulse'}`}>
                          {order.paymentStatus === 'PAID' ? <CheckCircle size={16} /> : <Clock size={16} />}
                        </span>
                        <div className="flex items-center gap-3">
                          <p className={`text-xs font-black uppercase tracking-widest ${order.paymentStatus === 'PAID' ? 'text-white' : 'text-amber-500'}`}>
                            {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </p>
                          {order.paymentStatus !== 'PAID' && (
                            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-black text-amber-500 uppercase tracking-tighter">Cần xử lý</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">
                          {order.paymentStatus === 'PAID' 
                            ? `Giao dịch xác thực thành công lúc ${new Date(order.orderedDate).toLocaleTimeString()}` 
                            : 'Cổng thanh toán phản hồi: Chờ người dùng hoàn tất giao dịch'}
                        </p>
                      </div>

                      <div className="relative pl-12">
                        <span className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center text-[#0b1326] shadow-xl z-10 transition-all duration-700 ${['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.orderStatus) ? 'bg-blue-400 shadow-blue-400/40' : 'bg-[#171f33] border border-white/10 text-slate-500'}`}>
                          <Truck size={16} />
                        </span>
                        <p className={`text-xs font-black uppercase tracking-widest ${['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.orderStatus) ? 'text-white' : 'text-slate-500'}`}>Đang trên đường vận chuyển</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Đơn vị vận chuyển: Tiêu chuẩn</p>
                      </div>

                      <div className="relative pl-12">
                        <span className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center text-[#0b1326] shadow-xl z-10 transition-all duration-700 ${['DELIVERED', 'COMPLETED'].includes(order.orderStatus) ? 'bg-indigo-400 shadow-indigo-400/40' : 'bg-[#171f33] border border-white/10 text-slate-500'}`}>
                          <CheckCircle size={16} />
                        </span>
                        <p className={`text-xs font-black uppercase tracking-widest ${['DELIVERED', 'COMPLETED'].includes(order.orderStatus) ? 'text-white' : 'text-slate-500'}`}>Giao hàng thành công</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Kiện hàng đã đến tay khách hàng</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "payment" && (
            <div className="space-y-8">
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-[#131b2e] p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#e9c349]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <CreditCard className="text-[#e9c349] mb-6" size={32} />
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2">Trạng thái ví VNPay</p>
                    <h3 className={`text-2xl font-headline font-black uppercase italic ${order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                       {order.paymentStatus === 'PAID' ? 'Đã quyết toán' : 'Chờ dòng tiền'}
                    </h3>
                 </div>
                 <div className="bg-[#131b2e] p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                    <Banknote className="text-emerald-400 mb-6" size={32} />
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2">Giá trị thực nhận (Net)</p>
                    <h3 className="text-2xl font-headline font-black text-white uppercase italic">
                       {formatPrice(order.total)}
                    </h3>
                 </div>
              </div>

              {/* Technical Payment Log */}
              <div className="bg-[#131b2e] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="px-10 py-8 border-b border-white/5 bg-[#171f33]/30">
                  <h2 className="font-headline text-xl font-black text-white uppercase italic tracking-tight">Thông số kỹ thuật giao dịch</h2>
                </div>
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-2">Mã giao dịch hệ thống</p>
                          <p className="text-sm font-mono font-bold text-white bg-white/5 p-4 rounded-xl border border-white/5">TXN_PT_{order.id}_{order.user?.id}</p>
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-2">Mã giao dịch VNPay (Bank ID)</p>
                          <p className="text-sm font-mono font-bold text-[#e9c349] bg-[#e9c349]/5 p-4 rounded-xl border border-[#e9c349]/10">vnp_TransactionNo: {8000000 + order.id}</p>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-2">Phương thức thanh toán</p>
                          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                             <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                                <CreditCard size={18} />
                             </div>
                             <p className="text-sm font-black text-white uppercase">Cổng VNPay (Thẻ quốc tế/ATM)</p>
                          </div>
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-2">Ngân hàng thụ hưởng</p>
                          <p className="text-sm font-black text-slate-300 italic">VNPAY-TEST-BANK (Sandbox)</p>
                       </div>
                    </div>
                  </div>

                  {/* Audit Trail (Lịch sử tiền) */}
                  {/* Lịch sử biến động tài chính ĐỘNG */}
                  <div className="pt-8 border-t border-white/5">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Lịch sử biến động tài chính</h4>
                     <div className="space-y-4">
                        {order.transactions && order.transactions.length > 0 ? (
                           order.transactions.map((txn: any, idx: number) => (
                              <div key={idx} className={`flex justify-between items-center p-5 rounded-2xl border ${txn.type === 'PAYMENT' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                                 <div className="flex items-center gap-4">
                                    <div className={`w-2.5 h-2.5 rounded-full ${txn.type === 'PAYMENT' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></div>
                                    <div>
                                       <p className="text-xs font-black text-white uppercase tracking-tight">{txn.type === 'PAYMENT' ? 'Xác nhận thanh toán thành công' : 'Hoàn tiền thành công'}</p>
                                       <p className={`text-[10px] font-bold ${txn.type === 'PAYMENT' ? 'text-emerald-400/80' : 'text-rose-500/80'}`}>{txn.description}</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className={`text-sm font-black ${txn.type === 'PAYMENT' ? 'text-emerald-400' : 'text-rose-500'}`}>{txn.type === 'PAYMENT' ? '+' : '-'}{formatPrice(txn.amount)}</p>
                                    <p className="text-[9px] text-slate-500 font-mono italic">{new Date(txn.createdAt).toLocaleString()}</p>
                                 </div>
                              </div>
                           ))
                        ) : (
                          <div className="flex flex-col items-center justify-center p-10 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                             <Clock size={24} className="text-slate-700 mb-3" />
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">
                                Đang chờ giao dịch tài chính phát sinh...
                             </p>
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "logistics" && (
            <div className="space-y-8">
               {/* Shipping Info Card */}
               <div className="bg-[#131b2e] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-10 text-white/[0.03] pointer-events-none">
                    <Truck size={160} />
                  </div>
                  <div className="px-10 py-8 border-b border-white/5 bg-[#171f33]/30">
                    <h2 className="font-headline text-xl font-black text-white uppercase italic tracking-tight">Thông tin vận chuyển & Điều phối</h2>
                  </div>
                  <div className="p-10 space-y-10 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-8">
                          <div className="flex gap-6">
                            <div className="w-12 h-12 bg-[#e9c349]/20 rounded-2xl flex items-center justify-center text-[#e9c349] border border-[#e9c349]/20">
                               <MapPin size={24} />
                            </div>
                            <div>
                               <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Địa chỉ nhận hàng</p>
                               <p className="text-sm font-black text-white leading-relaxed italic">{order.shippingAddress || "Chưa cung cấp"}</p>
                            </div>
                          </div>
                          <div className="flex gap-6">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                               <Truck size={24} />
                            </div>
                            <div>
                               <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Dịch vụ vận chuyển</p>
                               <p className="text-sm font-black text-white uppercase tracking-tight">{order.shippingMethod === 'express' ? 'Giao hàng Hỏa tốc 2h' : 'Giao hàng tiêu chuẩn 2-3 ngày'}</p>
                            </div>
                          </div>
                       </div>
                       <div className="bg-[#0b1326] p-8 rounded-3xl border border-white/5">
                          <h4 className="text-[10px] font-black text-[#e9c349] uppercase tracking-widest mb-6">Mã vận đơn (Tracking)</h4>
                          <div className="space-y-4">
                             <p className="text-2xl font-headline font-black text-white italic tracking-tighter uppercase">GHN-{100000 + order.id}</p>
                             <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                Trạng thái tại kho: <span className="text-emerald-400">Đã xuất kho</span>
                             </div>
                             <button className="mt-4 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                                Xem lộ trình GHN
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               {/* Customer Card in Logistics Tab */}
               <div className="bg-[#131b2e] rounded-3xl border border-white/5 shadow-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                     <div className="w-20 h-20 rounded-3xl bg-[#2d3449] border-2 border-[#e9c349]/20 flex items-center justify-center shadow-2xl overflow-hidden p-3">
                        <img 
                          src="https://res.cloudinary.com/de0de4yum/image/upload/v1777141182/phuoctechno_hwcqll.png" 
                          alt="Default Avatar"
                          className="w-full h-full object-contain opacity-80"
                        />
                     </div>
                     <div>
                        <h4 className="font-headline text-2xl font-black text-white italic uppercase tracking-tight">{order.user?.userName}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Khách hàng thành viên • #USR-{order.user?.id}</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <Link href={`/admin/users/${order.user?.id}`} className="px-8 py-4 bg-[#e9c349] text-[#0b1326] rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#e9c349]/20 flex items-center gap-3">
                        Hồ sơ khách <ExternalLink size={14} />
                     </Link>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Right Side Sticky Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-8 sticky top-32 animate-in fade-in slide-in-from-right-4 duration-700">
           {/* Order Status Action Card */}
           <div className="bg-linear-to-br from-[#171f33] to-[#131b2e] p-8 rounded-3xl border border-white/10 shadow-3xl space-y-6">
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">Điều khiển đơn hàng</h3>
              
              <div className="flex flex-col gap-3">
                 {/* Chỉ hiện nút Hoàn tiền nếu đơn đang chờ hoàn tiền hoặc đã hủy nhưng đã trả tiền */}
                 {(['REFUND_PENDING', 'CHỜ HOÀN TIỀN'].includes(order.orderStatus) || (order.orderStatus === 'CANCELLED' && order.paymentStatus === 'PAID')) && (
                    <button 
                       onClick={() => handleUpdateStatus("REFUNDED")}
                       disabled={isUpdating}
                       className="w-full py-4 bg-orange-500/10 text-orange-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
                    >
                       <RotateCcw size={14} /> Xác nhận hoàn tiền
                    </button>
                 )}

                 {/* Nút giao hàng: Chỉ hiện khi đã trả tiền nhưng chưa giao */}
                 {order.paymentStatus === 'PAID' && ['PENDING', 'PAID', 'PROCESSING'].includes(order.orderStatus) && (
                    <button 
                       onClick={() => handleUpdateStatus("SHIPPED")}
                       disabled={isUpdating}
                       className="w-full py-4 bg-blue-500/10 text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                       <Truck size={14} /> Bắt đầu giao hàng
                    </button>
                 )}

                 {/* Nút Xác nhận giao: Chỉ hiện khi đang giao */}
                 {order.orderStatus === 'SHIPPED' && (
                    <button 
                       onClick={() => handleUpdateStatus("COMPLETED")}
                       disabled={isUpdating}
                       className="w-full py-4 bg-emerald-500/10 text-emerald-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                       <CheckCircle size={14} /> Hoàn tất đơn hàng
                    </button>
                 )}

                 {/* Nút Hủy đơn: Chỉ hiện khi đơn chưa hoàn thành hoặc chưa giao xong */}
                 {!['COMPLETED', 'CANCELLED', 'REFUNDED', 'DELIVERED'].includes(order.orderStatus) && (
                    <button 
                       onClick={() => setIsCancelModalOpen(true)}
                       disabled={isUpdating}
                       className="w-full py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                       <XCircle size={14} /> Hủy đơn hàng
                    </button>
                 )}

                 {/* Nếu đơn đã kết thúc, hiện thông báo thay vì nút */}
                 {['COMPLETED', 'CANCELLED', 'REFUNDED', 'DELIVERED'].includes(order.orderStatus) && (
                    <div className="py-6 px-6 bg-white/5 border border-white/5 rounded-2xl text-center space-y-2">
                       <CheckCircle size={24} className="text-slate-600 mx-auto" />
                       <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                          Đơn hàng đã kết thúc
                       </p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
