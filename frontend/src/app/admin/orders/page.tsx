"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Truck,
  FileDown,
  ShoppingBag,
  CheckCircle2,
  Gift,
  RotateCcw,
  XCircle
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const AdminOrders = () => {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Lấy dữ liệu từ API khi Component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8900/api/admin-bff/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  // Hàm helper để định dạng trạng thái
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PAYMENT_EXPECTED":
        return { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", dot: "bg-amber-400", label: "Chờ thanh toán" };
      case "PAID":
        return { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400", label: "Đã thanh toán" };
      case "SHIPPED":
        return { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", dot: "bg-blue-400", label: "Đang giao hàng" };
      case "DELIVERED":
        return { color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20", dot: "bg-indigo-400", label: "Đã nhận hàng" };
      case "CANCELLED":
        return { color: "text-rose-400 bg-rose-400/10 border-rose-400/20", dot: "bg-rose-400", label: "Đã hủy" };
      case "REFUND_PENDING":
        return { color: "text-orange-400 bg-orange-400/10 border-orange-400/20", dot: "bg-orange-400", label: "Chờ hoàn tiền" };
      case "REFUNDED":
        return { color: "text-slate-500 bg-slate-500/10 border-slate-500/20", dot: "bg-slate-500", label: "Đã hoàn tiền" };
      default:
        return { color: "text-slate-400 bg-slate-400/10 border-white/5", dot: "bg-slate-400", label: "Đang xử lý" };
    }
  };

  const updateStatus = async (orderId: string | number, newStatus: string) => {
    try {
      if (!confirm(`Xác nhận chuyển trạng thái đơn hàng sang ${newStatus}?`)) return;

      await axios.put(`http://localhost:8900/api/admin-bff/orders/${orderId}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh data
      const res = await axios.get('http://localhost:8900/api/admin-bff/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Lỗi khi cập nhật trạng thái đơn hàng");
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
        <div className="flex-1">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              Đang tải dữ liệu...
            </div>
          ) : orders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
              <div className="w-16 h-16 rounded-3xl bg-[#171f33] border border-white/5 flex items-center justify-center mb-2">
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
                  <th className="px-8 py-5 font-medium text-right">Thao tác nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => {
                  const style = getStatusStyle(order.orderStatus);
                  const status = order.orderStatus;
                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-[#e9c349] font-bold hover:underline">#ORD-{order.id}</Link>
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
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          {/* Nút xác nhận thanh toán */}
                          {status === 'PAYMENT_EXPECTED' && (
                            <button
                              onClick={() => updateStatus(order.id, 'PAID')}
                              className="p-2 bg-emerald-400/10 text-emerald-400 rounded-lg hover:bg-emerald-400 hover:text-[#131b2e] transition-all border border-emerald-400/20 shadow-lg"
                              title="Xác nhận đã nhận tiền"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}

                          {/* Nút Giao hàng */}
                          {(status === 'PAID' || status === 'PENDING') && (
                            <button
                              onClick={() => updateStatus(order.id, 'SHIPPED')}
                              className="p-2 bg-blue-400/10 text-blue-400 rounded-lg hover:bg-blue-400 hover:text-[#131b2e] transition-all border border-blue-400/20 shadow-lg"
                              title="Bắt đầu giao hàng"
                            >
                              <Truck size={16} />
                            </button>
                          )}

                          {/* Nút Hoàn tất */}
                          {status === 'SHIPPED' && (
                            <button
                              onClick={() => updateStatus(order.id, 'DELIVERED')}
                              className="p-2 bg-indigo-400/10 text-indigo-400 rounded-lg hover:bg-indigo-400 hover:text-[#131b2e] transition-all border border-indigo-400/20 shadow-lg"
                              title="Xác nhận đã nhận hàng"
                            >
                              <Gift size={16} />
                            </button>
                          )}

                          {/* Nút Hoàn tiền (Nếu đã trả tiền hoặc khách yêu cầu hủy) */}
                          {(status === 'PAID' || status === 'REFUND_PENDING') && (
                            <button
                              onClick={() => updateStatus(order.id, 'REFUNDED')}
                              className="p-2 bg-emerald-400/10 text-emerald-400 rounded-lg hover:bg-emerald-400 hover:text-[#131b2e] transition-all border border-emerald-400/20 shadow-lg"
                              title="Xử lý hoàn tiền"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="p-2 bg-[#222a3d] text-slate-400 rounded-lg hover:text-[#e9c349] transition-all border border-white/5 shadow-lg"
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
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
