"use client";
import React, { useState } from "react";
import {
  CreditCard,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Banknote,
  Wallet,
  Settings2,
  Save,
  Building,
  Loader2,
  Inbox,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Users
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import Link from "next/link";

const PaymentsPage = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const pageSize = 10;

  // Fetch paginated orders for table
  const { data: ordersPage, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['adminPayments', currentPage],
    queryFn: () => adminService.getOrders(currentPage, pageSize)
  });

  // Fetch dashboard stats for summary
  const { data: dashboardData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats
  });

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const confirmMsg = newStatus === 'REFUNDED'
        ? "Xác nhận đã hoàn tiền cho khách hàng qua hệ thống?"
        : `Xác nhận chuyển trạng thái đơn hàng sang ${newStatus}?`;

      if (!confirm(confirmMsg)) return;

      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      queryClient.invalidateQueries({ queryKey: ['adminPayments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setActiveMenuId(null);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const exportToCSV = () => {
    if (!ordersPage?.content) return;
    
    const headers = ["Mã GD", "Mã Đơn", "Khách hàng", "Phương thức", "Số tiền", "Ngày", "Trạng thái"];
    const rows = ordersPage.content.map((o: any) => [
      `PAY-${1000 + o.id}`,
      `ATL-${80000 + o.id}`,
      o.user?.userName || o.user?.email || "Khách Vãng Lai",
      o.paymentMethod || "VNPay",
      o.total,
      o.orderedDate,
      o.paymentStatus
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e: any) => e.join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_cao_thanh_toan_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất báo cáo CSV thành công");
  };

  const payments = (ordersPage?.content?.map((o: any) => {
    const isRefundPending = o.orderStatus === 'REFUND_PENDING';

    let statusText = "Chờ xử lý";
    let statusColor = "text-amber-400 bg-amber-400/10 border-amber-400/20";

    if (isRefundPending) {
      statusText = "Chờ hoàn tiền";
      statusColor = "text-orange-400 bg-orange-400/10 border-orange-400/20";
    } else if (o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED') {
      statusText = "Hoàn tất";
      statusColor = "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
    } else if (o.paymentStatus === 'PAID') {
      statusText = "Đã thanh toán";
      statusColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    } else if (o.orderStatus === 'SHIPPED' || o.orderStatus === 'IN_TRANSIT') {
      statusText = "Đang giao";
      statusColor = "text-blue-400 bg-blue-400/10 border-blue-400/20";
    } else if (o.paymentStatus === 'REFUNDED') {
      statusText = "Đã hoàn tiền";
      statusColor = "text-slate-400 bg-slate-400/10 border-slate-400/20";
    } else if (o.paymentStatus === 'FAILED' || o.orderStatus === 'CANCELLED') {
      statusText = "Đã hủy";
      statusColor = "text-rose-400 bg-rose-400/10 border-rose-400/20";
    }

    return {
      id: `PAY-${1000 + o.id}`,
      realId: o.id,
      orderId: `ATL-${80000 + o.id}`,
      customer: o.user?.userName || o.user?.email || "Khách Vãng Lai",
      method: o.paymentMethod || "VNPay",
      amount: `${(o.total || 0).toLocaleString('vi-VN')}đ`,
      date: o.orderedDate ? new Date(o.orderedDate).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
      status: statusText,
      statusColor: statusColor,
      isRefundable: isRefundPending,
      rawStatus: o.orderStatus,
      rawPaymentStatus: o.paymentStatus
    };
  }) || []).filter((p: any) =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = ordersPage?.totalPages || 0;

  // Stats for cards from dashboard data
  const actualRevenue = dashboardData?.totalRevenue || 0;
  const processingRevenue = dashboardData?.processingRevenue || 0;
  const totalOrdersCount = dashboardData?.totalOrders || 0;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-1000 bg-linear-to-b from-[#0b1326] to-[#0f172a] min-h-screen" onClick={() => setActiveMenuId(null)}>
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[#e9c349] font-headline tracking-widest text-xs uppercase mb-2">Tài chính hệ thống</p>
          <h1 className="text-5xl font-black font-headline text-white tracking-tighter uppercase">Quản lý thanh toán</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-3 px-8 py-4 bg-white/5 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl border border-white/10 hover:bg-[#e9c349] hover:text-[#0b1326] transition-all font-headline shadow-2xl"
          >
            <Download size={18} /> Xuất báo cáo CSV
          </button>
        </div>
      </header>

      {/* Admin VNPay Config Info Section */}
      <section className="bg-linear-to-br from-[#171f33] to-[#131b2e] p-10 rounded-3xl border border-blue-500/20 shadow-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start lg:items-center justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                 <Settings2 className="text-blue-400" size={20} />
              </div>
              <h2 className="text-white font-headline font-black text-2xl tracking-tight uppercase">Cổng VNPay</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-body italic">Hệ thống đang vận hành qua môi trường VNPay Sandbox dành cho mô hình bán lẻ đơn nhất. </p>
          </div>

          <div className="flex-1 w-full max-w-2xl flex justify-end">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-md w-full">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle className="text-emerald-400" size={24} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Trạng thái kết nối</p>
                      <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Online & Đang nhận tiền</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Mã kết nối</p>
                    <p className="text-white font-mono text-xs">VNP_SB_2026_ATL</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full"></div>
          <ShoppingCart className="text-blue-400 mb-4" size={32} />
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Lượng đơn</p>
          <h3 className="text-xl font-headline font-black text-slate-400 uppercase mb-1">Tổng đơn hàng</h3>
          <h3 className="text-3xl font-headline font-black text-white italic">{totalOrdersCount}</h3>
        </div>
        <div className="bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <Users className="text-purple-400 mb-4" size={32} />
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Khách hàng</p>
          <h3 className="text-xl font-headline font-black text-slate-400 uppercase mb-1">Người mua hàng</h3>
          <h3 className="text-3xl font-headline font-black text-white italic">{dashboardData?.totalUsers || 0}</h3>
        </div>
        <div className="bg-[#131b2e] p-8 rounded-3xl border border-[#e9c349]/20 shadow-2xl relative overflow-hidden group hover:border-[#e9c349]/40 transition-all cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#e9c349]/5 blur-2xl rounded-full"></div>
          <Banknote className="text-[#e9c349] mb-4" size={32} />
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Doanh thu</p>
          <h3 className="text-xl font-headline font-black text-[#e9c349] uppercase mb-1">Thực thu (Net)</h3>
          <h3 className="text-3xl font-headline font-black text-white italic">{actualRevenue.toLocaleString('vi-VN')}đ</h3>
        </div>
        <div className="bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <Clock className="text-orange-400 mb-4" size={32} />
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Tạm giữ</p>
          <h3 className="text-xl font-headline font-black text-slate-400 uppercase mb-1">Đang xử lý</h3>
          <h3 className="text-3xl font-headline font-black text-white italic">{processingRevenue.toLocaleString('vi-VN')}đ</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#131b2e]/50 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#e9c349] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Tìm theo mã GD, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all shadow-inner placeholder:text-slate-700 italic"
          />
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-4 px-6 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-widest">
              Bộ lọc: <span className="text-[#e9c349]">Tất cả giao dịch</span>
           </div>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-[#131b2e] rounded-3xl overflow-hidden border border-white/5 shadow-3xl bg-linear-to-b from-[#131b2e] to-[#0b1326]">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.25em] font-headline border-b border-white/5 bg-[#171f33]/30">
                <th className="px-10 py-6 font-black">Mã giao dịch</th>
                <th className="px-10 py-6 font-black">Khách hàng</th>
                <th className="px-10 py-6 font-black text-center">Phương thức</th>
                <th className="px-10 py-6 font-black text-right">Số tiền</th>
                <th className="px-10 py-6 font-black text-center">Trạng thái</th>
                <th className="px-10 py-6 font-black text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-headline">
              {isOrdersLoading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                    <Loader2 className="mx-auto mb-4 animate-spin" size={32} />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-12 text-center text-slate-600">
                    <Inbox className="mx-auto mb-4 opacity-50" size={32} />
                    <p className="font-bold uppercase tracking-widest text-xs">Không có dữ liệu</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-all group relative">
                    <td className="px-10 py-8">
                      <p className="font-mono text-xs text-[#e9c349] font-bold tracking-widest">{payment.id}</p>
                      <Link
                        href={`/admin/orders/${payment.realId}`}
                        className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight hover:text-[#e9c349] transition-colors flex items-center gap-1"
                      >
                        Mã đơn: <span className="underline decoration-dotted">{payment.orderId}</span>
                      </Link>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-headline font-black text-white text-sm group-hover:text-[#e9c349] transition-colors italic">{payment.customer}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">{payment.date}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <CreditCard size={14} className="text-[#e9c349]" />
                        </div>
                        {payment.method}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right font-headline font-black text-white text-lg italic">{payment.amount}</td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border inline-flex items-center gap-2 shadow-2xl ${payment.statusColor}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${payment.statusColor.split(' ')[0].replace('text', 'bg')}`}></div>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right relative">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === payment.id ? null : payment.id); }}
                          className={`p-3 transition-all rounded-xl border border-white/5 shadow-lg ${activeMenuId === payment.id ? 'bg-[#e9c349] text-[#0b1326]' : 'text-slate-500 hover:text-white bg-white/5 hover:bg-white/10'}`}
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeMenuId === payment.id && (
                          <div className="absolute top-full right-10 mt-2 w-56 bg-[#171f33] border border-white/10 rounded-2xl shadow-3xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                             <div className="p-2 border-b border-white/5">
                                <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tác vụ đơn {payment.id}</p>
                             </div>
                             <div className="p-2 space-y-1">
                                <Link href={`/admin/orders/${payment.realId}`} className="flex items-center gap-3 px-4 py-3 text-xs text-white hover:bg-[#e9c349] hover:text-[#0b1326] rounded-xl transition-all font-bold">
                                   <Search size={14} /> Chi tiết giao dịch
                                </Link>
                                <button onClick={() => toast.info("Tính năng in hóa đơn sẽ khả dụng ở bản cập nhật tới")} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-white hover:bg-white/5 rounded-xl transition-all font-bold">
                                   <Download size={14} /> In hóa đơn (PDF)
                                </button>
                                {payment.isRefundable && (
                                   <button 
                                      onClick={() => handleUpdateStatus(payment.realId, 'REFUNDED')}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-xs text-orange-400 hover:bg-orange-500 hover:text-white rounded-xl transition-all font-bold"
                                   >
                                      <RotateCcw size={14} /> Xác nhận hoàn tiền
                                   </button>
                                )}
                             </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {!isOrdersLoading && totalPages > 1 && (
          <div className="px-10 py-6 bg-[#171f33]/30 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-3 bg-[#0b1326] border border-white/5 rounded-xl text-slate-500 hover:text-[#e9c349] disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-2 mx-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all border ${currentPage === i
                      ? "bg-[#e9c349] border-[#e9c349] text-[#0b1326] shadow-lg shadow-[#e9c349]/20"
                      : "bg-[#0b1326] border-white/5 text-slate-500 hover:text-white"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-3 bg-[#0b1326] border border-white/5 rounded-xl text-slate-500 hover:text-[#e9c349] disabled:opacity-20 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Trang {currentPage + 1} / {totalPages} • {ordersPage?.totalElements} giao dịch
            </p>
          </div>
        )}
      </div>

      <footer className="pt-8 text-center opacity-30 pb-12">
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.5em]">Phuoc Techno Financial Suite v2.0</p>
      </footer>
    </div>
  );
};

export default PaymentsPage;
