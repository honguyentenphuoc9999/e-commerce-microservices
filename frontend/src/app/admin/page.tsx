"use client";
import React from "react";
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  MoreVertical,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import Link from "next/link";

const AdminDashboard = () => {
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats
  });

  const { data: recentOrdersData = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders-recent'],
    queryFn: adminService.getOrders
  });

  const stats = [
    {
      title: "Tổng đơn hàng",
      value: dashboardData?.totalOrders || "0",
      trend: "+12.5%",
      icon: <ShoppingCart size={24} />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      title: "Người dùng hệ thống",
      value: dashboardData?.totalUsers || "0",
      trend: "+8.2%",
      icon: <Users size={24} />,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      title: "Doanh thu",
      value: `${(dashboardData?.totalRevenue || 0).toLocaleString()}đ`,
      trend: "+24.1%",
      icon: <DollarSign size={24} />,
      color: "text-[#e9c349]",
      bg: "bg-[#e9c349]/10",
    },
  ];

  const recentOrders = Array.isArray(recentOrdersData) ? recentOrdersData.slice(0, 5).map((o: any) => ({
    id: `ORD-${o.id}`,
    customer: o.user?.userName || "Khách ẩn danh",
    email: o.user?.userDetails?.email || "N/A",
    product: o.items?.[0]?.product?.productName || "Đơn hàng mới",
    date: new Date(o.orderDate).toLocaleDateString('vi-VN'),
    amount: `${(o.totalPrice || 0).toLocaleString()}đ`,
    status: o.status === "COMPLETED" ? "Hoàn tất" : (o.status === "PENDING" ? "Chờ xử lý" : o.status),
    statusColor: o.status === "COMPLETED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-slate-400 bg-slate-400/10 border-white/5",
    initials: (o.user?.userName || "U").substring(0, 2).toUpperCase(),
  })) : [];

  return (
    <div className="p-12 space-y-12">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[#e9c349] font-headline tracking-widest text-xs uppercase mb-2">Tóm tắt điều hành</p>
          <h1 className="text-5xl font-black font-headline text-white tracking-tighter">Tổng quan</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#171f33] p-2 rounded-full px-6 flex items-center gap-3 backdrop-blur-md border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(139,214,182,0.5)]"></span>
            <span className="text-xs font-label text-slate-400 uppercase tracking-widest">Hệ thống: 99.9%</span>
          </div>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#131b2e] p-8 rounded-2xl relative overflow-hidden group border border-white/5 shadow-2xl">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <span className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-lg`}>
                  {stat.icon}
                </span>
                <span className="text-emerald-400 text-xs font-bold flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  {stat.trend}
                </span>
              </div>
              <p className="text-slate-400 font-label text-xs uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-4xl font-headline font-bold text-white">{stat.value}</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-white">
              {React.cloneElement(stat.icon as React.ReactElement, { size: 120 })}
            </div>
          </div>
        ))}
      </section>

      {/* Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trends */}
        <div className="lg:col-span-2 bg-[#131b2e] p-8 rounded-2xl border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h4 className="font-headline text-xl font-bold text-white">Xu hướng bán hàng</h4>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-full bg-[#222a3d] text-xs font-medium text-[#e9c349] border border-[#e9c349]/20">Hàng tháng</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:bg-[#222a3d] transition-colors hover:text-white">Hàng tuần</button>
            </div>
          </div>
          <div className="h-64 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 800 200">
              <defs>
                <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#e9c349", stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: "#e9c349", stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path d="M0,180 Q100,160 200,120 T400,140 T600,60 T800,100 L800,200 L0,200 Z" fill="url(#grad)" />
              <path d="M0,180 Q100,160 200,120 T400,140 T600,60 T800,100" fill="none" stroke="#e9c349" strokeWidth="3" />
              <circle cx="200" cy="120" fill="#e9c349" r="4" />
              <circle cx="400" cy="140" fill="#e9c349" r="4" />
              <circle cx="600" cy="60" fill="#e9c349" r="4" />
            </svg>
            <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-slate-500 font-label uppercase tracking-widest pt-4">
              <span>Th1</span><span>Th2</span><span>Th3</span><span>Th4</span><span>Th5</span><span>Th6</span><span>Th7</span>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-[#131b2e] p-8 rounded-2xl flex flex-col border border-white/5 shadow-2xl">
          <h4 className="font-headline text-xl font-bold text-white mb-8">Phân bổ tăng trưởng</h4>
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-label uppercase tracking-wider text-slate-400">
                <span>Trực tiếp</span>
                <span className="text-white font-bold">65%</span>
              </div>
              <div className="h-1.5 w-full bg-[#222a3d] rounded-full overflow-hidden">
                <div className="h-full bg-[#e9c349] w-[65%] rounded-full shadow-[0_0_8px_rgba(233,195,73,0.4)]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-label uppercase tracking-wider text-slate-400">
                <span>Mạng xã hội</span>
                <span className="text-white font-bold">20%</span>
              </div>
              <div className="h-1.5 w-full bg-[#222a3d] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[20%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-label uppercase tracking-wider text-slate-400">
                <span>Giới thiệu</span>
                <span className="text-white font-bold">15%</span>
              </div>
              <div className="h-1.5 w-full bg-[#222a3d] rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-[15%] rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#e9c349]" />
              <span className="text-xs font-label text-slate-400 uppercase">Hạng toàn cầu</span>
            </div>
            <span className="font-headline font-bold text-white text-2xl">#12</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <section className="bg-[#131b2e] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="p-8 flex justify-between items-center border-b border-white/5">
          <h4 className="font-headline text-xl font-bold text-white">Đơn hàng gần đây</h4>
          <button className="text-xs font-label uppercase tracking-widest text-[#e9c349] hover:text-white transition-all underline underline-offset-8 decoration-[#e9c349]/30">Xem tất cả hoạt động</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-label border-b border-white/5 bg-[#171f33]/30">
                <th className="px-8 py-5 font-medium">Khách hàng</th>
                <th className="px-8 py-5 font-medium">Sản phẩm</th>
                <th className="px-8 py-5 font-medium">Ngày</th>
                <th className="px-8 py-5 font-medium text-right">Số tiền</th>
                <th className="px-8 py-5 font-medium text-center">Trạng thái</th>
                <th className="px-8 py-5 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ordersLoading ? (
                 <tr>
                    <td colSpan={6} className="py-20 text-center">
                       <div className="w-8 h-8 border-4 border-[#e9c349] border-t-transparent rounded-full animate-spin mx-auto"></div>
                       <p className="text-xs text-slate-500 mt-4 tracking-widest uppercase font-black">Syncing digital transactions...</p>
                    </td>
                 </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#2d3449] flex items-center justify-center text-[#e9c349] font-bold text-xs border border-white/10 group-hover:border-[#e9c349]/30 transition-colors">
                          {order.initials}
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-[#e9c349] transition-colors">{order.customer}</p>
                          <p className="text-[11px] text-slate-500">{order.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400">{order.product}</td>
                    <td className="px-8 py-6 text-sm text-slate-400">{order.date}</td>
                    <td className="px-8 py-6 text-right font-headline font-bold text-white">{order.amount}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-slate-500 hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Action Footer */}
      <div className="flex justify-end gap-4">
        <button className="px-8 py-4 bg-white/5 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
          Xuất báo cáo PDF
        </button>
        <button className="px-8 py-4 bg-[#e9c349] text-[#0b1326] font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#e9c349]/20 flex items-center gap-2">
          <Plus size={18} />
          Thêm sản phẩm mới
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
