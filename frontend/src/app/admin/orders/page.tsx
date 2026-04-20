"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Truck,
  Users,
  CheckCircle,
  FileDown,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { shopService } from "@/services/shopService";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Lấy dữ liệu từ API khi Component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await shopService.adminGetAllOrders();
        setOrders(data || []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Hàm helper để định dạng trạng thái
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "Đã giao":
        return { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400", label: "Đã giao" };
      case "PENDING":
      case "Chờ duyệt":
      case "PAYMENT_EXPECTED":
        return { color: "text-[#e9c349] bg-[#e9c349]/10 border-[#e9c349]/20", dot: "bg-[#e9c349]", label: "Chờ thanh toán" };
      case "CANCELLED":
      case "Đã hủy":
        return { color: "text-rose-400 bg-rose-400/10 border-rose-400/20", dot: "bg-rose-400", label: "Đã hủy" };
      default:
        return { color: "text-slate-400 bg-slate-400/10 border-white/5", dot: "bg-slate-400", label: status || "Đang xử lý" };
    }
  };

  return (
    <div className="p-12 space-y-12">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-label">Bảng điều khiển</span>
            <span className="text-[10px] text-slate-500">/</span>
            <span className="text-[10px] uppercase tracking-widest text-[#e9c349] font-label">Quản lý đơn hàng</span>
          </nav>
          <h1 className="text-5xl font-black font-headline tracking-tighter text-white uppercase">quản lý đơn hàng</h1>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              className="bg-[#131b2e] border-none text-sm rounded-xl pl-12 pr-4 py-3 w-64 focus:ring-1 focus:ring-[#e9c349]/40 placeholder:text-slate-500 transition-all outline-none" 
              placeholder="Tìm kiếm đơn hàng..." 
              type="text"
            />
          </div>
        </div>
      </header>

      {/* Orders Table Section */}
      <section className="bg-[#131b2e] rounded-2xl overflow-hidden shadow-2xl border border-white/5 min-h-[500px] flex flex-col">
        {/* Table Controls */}
        <div className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-[#171f33]/30">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-[#222a3d] rounded-lg text-xs font-label text-slate-300 hover:bg-[#2d3449] transition-colors flex items-center gap-2 border border-white/5">
              <Filter size={14} /> Bộ lọc
            </button>
            <button className="px-4 py-2 bg-[#222a3d] rounded-lg text-xs font-label text-slate-300 hover:bg-[#2d3449] transition-colors flex items-center gap-2 border border-white/5">
              <FileDown size={14} /> Xuất CSV
            </button>
          </div>
        </div>

        {/* Loading / Empty State / Table */}
        <div className="flex-1 overflow-x-auto relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-[#e9c349] font-label uppercase tracking-widest animate-pulse">
              Đang tải dữ liệu...
            </div>
          ) : orders.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <ShoppingBag size={32} className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-label uppercase tracking-widest text-sm font-bold">Đơn hàng trống</p>
              <p className="text-slate-600 text-xs">Hiện tại hệ thống chưa ghi nhận đơn hàng nào.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-label border-b border-white/5 bg-[#171f33]/10">
                  <th className="px-8 py-5 font-medium">Mã đơn hàng</th>
                  <th className="px-8 py-5 font-medium">Khách hàng</th>
                  <th className="px-8 py-5 font-medium">Ngày đặt</th>
                  <th className="px-8 py-5 font-medium">Số tiền</th>
                  <th className="px-8 py-5 font-medium text-center">Trạng thái</th>
                  <th className="px-8 py-5 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => {
                  const style = getStatusStyle(order.orderStatus);
                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs text-[#e9c349] font-bold">#ORD-{order.id}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#171f33] flex items-center justify-center text-[10px] font-bold text-[#e9c349] border border-white/10 group-hover:border-[#e9c349]/30 transition-all">
                            {order.user?.userName?.substring(0, 2).toUpperCase() || "UN"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-[#e9c349] transition-colors">{order.user?.userName || "Ẩn danh"}</p>
                            <p className="text-[10px] text-slate-500">{order.user?.email || "No Email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-400">{order.orderedDate}</td>
                      <td className="px-8 py-6 text-sm font-semibold text-white">${order.total?.toLocaleString()}</td>
                      <td className="px-8 py-6 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tight ${style.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                          {style.label}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <Link href={`/admin/orders/${order.id}`} className="p-2 text-slate-400 hover:text-[#e9c349] hover:bg-white/5 rounded-lg transition-all inline-block">
                            <Eye size={18} />
                         </Link>
                         <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all ml-1">
                            <MoreVertical size={18} />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination placeholder */}
        {!loading && orders.length > 0 && (
          <div className="px-8 py-6 bg-[#171f33]/30 border-t border-white/5">
            <p className="text-[10px] font-label text-slate-500 uppercase tracking-widest italic">
              * Dữ liệu được tải trực tiếp từ {orders.length} bản ghi trong Database thương mại.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminOrders;
