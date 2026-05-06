"use client";
import React, { useEffect } from "react";
import {
  Package,
  ChevronLeft,
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

const getStatusInfo = (status: string, paymentStatus?: string) => {
  switch (status) {
    case 'DELIVERED':
    case 'COMPLETED':
      return { text: 'Đã nhận hàng', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', dot: 'bg-indigo-400', message: 'Kiện hàng đã được giao thành công' };
    case 'SHIPPING':
    case 'SHIPPED':
    case 'IN_TRANSIT':
      return { text: 'Đang giao hàng', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400', message: 'Kiện hàng đang được luân chuyển bởi PHUOC TECHNO Express' };
    case 'PENDING':
    case 'PAYMENT_EXPECTED':
    case 'PENDING_PAYMENT':
      return { text: 'Chờ thanh toán', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400', message: 'Vui lòng hoàn tất thanh toán để chúng tôi xử lý đơn hàng' };
    case 'PAID':
      return { text: 'Đã thanh toán', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400', message: 'Thanh toán thành công, chúng tôi đang chuẩn bị hàng' };
    case 'CANCELLED':
      return paymentStatus === 'REFUNDED'
        ? { text: 'Đã hủy (Đã hoàn tiền)', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400', message: 'Đơn hàng đã được hủy và hoàn tiền thành công' }
        : { text: 'Đã hủy', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', dot: 'bg-rose-400', message: 'Đơn hàng này đã được hủy bỏ' };
    case 'REFUND_PENDING':
      return { text: 'Chờ hoàn tiền', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400', message: 'Đang xử lý yêu cầu hoàn tiền của bạn' };
    case 'REFUNDED':
      return { text: 'Đã hoàn tiền', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400', message: 'Đã hoàn tất hoàn trả số tiền giao dịch' };
    default:
      return { text: 'Đang xử lý', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400', message: 'Đơn hàng đang trong trạng thái xử lý' };
  }
};

const OrderHistory = () => {
  const { user, token } = useAuthStore();
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const [showMapId, setShowMapId] = React.useState<number | null>(null);
  const [mapKey, setMapKey] = React.useState(0);
  const [mapCoords, setMapCoords] = React.useState<Record<number, { lat: number, lon: number } | null>>({});
  const [page, setPage] = React.useState(0);
  const size = 10;

  const { data: paginationData, isLoading: ordersLoading, refetch } = useQuery({
    queryKey: ["orders", user?.id, page],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8900/api/shop/orders/user/${user?.id}?page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!user
  });

  const orders = paginationData?.content || [];
  const totalPages = paginationData?.totalPages || 0;
  const totalElements = paginationData?.totalElements || 0;

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

  const geocodeAddress = async (orderId: number, address: string) => {
    if (mapCoords[orderId] !== undefined) return;

    const tryGeocode = async (query: string) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Việt Nam")}&countrycodes=vn&limit=1`,
          { headers: { 'Accept-Language': 'vi' } }
        );
        return await res.json();
      } catch (e) {
        return [];
      }
    };

    // Lọc địa chỉ trước khi tìm tọa độ
    const cleanAddress = address?.split(',')
      .map((s: string) => s.trim())
      .filter((p: string) => !/^\d+/.test(p) && !p.toLowerCase().includes('hồ chí minh'))
      .join(', ');

    // Lần 1: Thử tìm địa chỉ đã lọc
    let data = await tryGeocode(cleanAddress || address);

    // Fallback: Nếu không tìm thấy, thử chỉ lấy Xã/Huyện
    if (data.length === 0 && address.includes(",")) {
      const parts = address.split(",");
      if (parts.length > 1) {
        const fallbackQuery = parts.slice(1).join(",").trim();
        data = await tryGeocode(fallbackQuery);
      }
    }

    if (data.length > 0) {
      setMapCoords(prev => ({ ...prev, [orderId]: { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } }));
    } else {
      setMapCoords(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const handlePayOrder = async (orderId: number) => {
    try {
      // Đặt cờ đang thanh toán trước khi đi
      sessionStorage.setItem("pendingPayment", "true");
      sessionStorage.setItem("pendingOrderId", orderId.toString());

      const { shopService } = await import('@/services/shopService');
      const paymentRes = await shopService.getVNPayPayment(orderId);
      const url = paymentRes?.paymentUrl || paymentRes;

      if (typeof url === 'string') {
        window.location.href = url;
      } else if (url?.paymentUrl) {
        window.location.href = url.paymentUrl;
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo link thanh toán");
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Tự động đồng bộ trạng thái khi quay lại từ VNPay (Back Button hoặc Redirect)
  useEffect(() => {
    const pendingPayment = sessionStorage.getItem("pendingPayment");
    const pendingOrderId = sessionStorage.getItem("pendingOrderId");

    if (pendingPayment && pendingOrderId) {
      // Đợi một chút để Backend xử lý IPN nếu có, sau đó xóa cờ và refetch
      setTimeout(() => {
        sessionStorage.removeItem("pendingPayment");
        sessionStorage.removeItem("pendingOrderId");
        refetch();
      }, 500);
    }
  }, []);

  if (ordersLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-[#e9c349] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tighter text-white italic uppercase">Lịch sử đơn hàng</h1>
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
            <p className="text-slate-500 mb-8 max-w-md">Bạn chưa thực hiện bất kỳ giao dịch nào tại PHUOC TECHNO. Hãy khám phá ngay các bộ sưu tập để bắt đầu mua sắm.</p>
            <Link href="/collections" className="px-10 py-4 bg-[#e9c349] text-[#0b1326] font-black uppercase tracking-widest text-xs rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(233,195,73,0.3)]">
              Khám phá không gian
            </Link>
          </div>
        ) : (
          <>
            {orders.map((order: any) => {
              const statusInfo = getStatusInfo(order.orderStatus, order.paymentStatus);
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
                        <p className="text-sm font-black text-white italic">#PT-{order.id}</p>
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
                          {(order.orderStatus === 'PENDING' || order.orderStatus === 'PAYMENT_EXPECTED' || order.orderStatus === 'PENDING_PAYMENT') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePayOrder(order.id);
                              }}
                              className="text-[10px] font-black text-[#0b1326] bg-[#e9c349] hover:bg-white transition-colors uppercase tracking-[0.2em] flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg"
                            >
                              <ArrowRight size={14} className="animate-pulse" /> Thanh toán ngay
                            </button>
                          )}
                          {(order.orderStatus === 'PENDING' || order.orderStatus === 'PAYMENT_EXPECTED' || order.orderStatus === 'PENDING_PAYMENT' || order.orderStatus === 'PAID') && (
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
                          {order.orderStatus !== 'CANCELLED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = showMapId === order.id ? null : order.id;
                                setShowMapId(next);
                                if (next !== null) geocodeAddress(order.id, order.shippingAddress);
                              }}
                              className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 group/track transition-colors ${showMapId === order.id ? 'text-white' : 'text-[#e9c349] hover:text-white'}`}
                            >
                              <MapPin size={14} className={showMapId === order.id ? '' : 'group-hover/track:animate-bounce'} />
                              {showMapId === order.id ? 'Đóng bản đồ' : 'Theo dõi hành trình'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tracking Map Section */}
                      {showMapId === order.id && (
                        <div className="px-10 pb-10 animate-in fade-in zoom-in duration-500">
                          <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl h-[400px] bg-[#0b1326] relative">
                            {mapCoords[order.id] === undefined ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#0b1326]">
                                <Loader2 className="w-10 h-10 text-[#e9c349] animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Đang tìm tọa độ...</p>
                              </div>
                            ) : (
                              <iframe
                                key={mapKey}
                                src={mapCoords[order.id]
                                  ? `https://maps.google.com/maps?q=${mapCoords[order.id]!.lat},${mapCoords[order.id]!.lon}&hl=vi&z=15&t=m&ie=UTF8&iwloc=A&output=embed`
                                  : `https://maps.google.com/maps?q=${encodeURIComponent(
                                    order.shippingAddress?.split(',')
                                      .map((s: string) => s.trim())
                                      .filter((p: string) => !/^\d+/.test(p) && !p.toLowerCase().includes('hồ chí minh'))
                                      .join(', ') || order.shippingAddress
                                  ) + ", Việt Nam"}&hl=vi&gl=vn&z=15&t=m&ie=UTF8&iwloc=A&output=embed`
                                }
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="opacity-80 hover:opacity-100 transition-opacity duration-500"
                              ></iframe>
                            )}

                            <div className="absolute top-6 left-6 bg-[#0b1326]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between gap-6 max-w-[calc(100%-3rem)]">
                              <div className="min-w-0">
                                <p className="text-[10px] font-black text-[#e9c349] uppercase tracking-widest mb-1">Vị trí hiện tại</p>
                                <p className="text-xs text-white font-bold truncate">Đang trung chuyển: {order.shippingAddress || "Địa chỉ khách hàng"}</p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMapCoords(prev => { const n = { ...prev }; delete n[order.id]; return n; });
                                    geocodeAddress(order.id, order.shippingAddress);
                                    setMapKey(prev => prev + 1);
                                  }}
                                  className="p-2 bg-[#e9c349] text-[#0b1326] rounded-xl hover:bg-white transition-all shadow-lg flex items-center gap-2 group"
                                  title="Định vị lại"
                                >
                                  <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                  <span className="text-[9px] font-black uppercase">Tâm vị trí</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Premium Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-16 bg-[#131b2e]/40 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-[#e9c349] hover:border-[#e9c349]/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex gap-2 mx-4">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`w-12 h-12 rounded-2xl font-black text-[10px] transition-all border ${page === i
                            ? 'bg-[#e9c349] border-[#e9c349] text-[#0b1326] shadow-[0_0_20px_rgba(233,195,73,0.3)]'
                            : 'bg-[#0b1326]/50 border-white/5 text-slate-500 hover:text-white hover:border-white/20'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                    className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-[#e9c349] hover:border-[#e9c349]/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                    Trang {page + 1} / {totalPages} • {totalElements} đơn hàng
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>


      <footer className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] tracking-widest">
          {orders.length > 0 ? `Trang ${page + 1} / ${totalPages}` : "End of History"}
        </p>
      </footer>
    </div>
  );
};

export default OrderHistory;

