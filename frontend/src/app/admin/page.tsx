"use client";
import React from "react";
import {
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  MoreVertical,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import Link from "next/link";

const AdminDashboard = () => {
  const [viewMode, setViewMode] = React.useState<"monthly" | "weekly">("monthly");
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [yearOffset, setYearOffset] = React.useState(0);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats
  });

  const { data: recentOrdersPage, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders-recent'],
    queryFn: () => adminService.getOrders(0, 5)
  });

  // Lấy toàn bộ đơn hàng để xuất báo cáo
  const { data: allOrdersPage } = useQuery({
    queryKey: ['admin-orders-all-export'],
    queryFn: () => adminService.getOrders(0, 500)
  });

  const chartData = React.useMemo(() => {
    const orders = dashboardData?.rawOrders || [];
    const completedStatuses = ['DELIVERED', 'COMPLETED'];
    const now = new Date();

    if (viewMode === "monthly") {
      const targetYear = now.getFullYear() + yearOffset;
      const labels = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];
      const values = new Array(12).fill(0);
      orders.forEach((o: any) => {
        const date = new Date(o.orderedDate);
        if (date.getFullYear() === targetYear && completedStatuses.includes(o.orderStatus)) {
          const month = date.getMonth();
          values[month] += (o.total || 0);
        }
      });
      return { labels, values, rangeText: `Năm ${targetYear}` };
    } else {
      // Xác định ngày bắt đầu của tuần mục tiêu
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + (weekOffset * 7));

      const startOfWeek = new Date(targetDate);
      const day = targetDate.getDay();
      const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
      const values = new Array(7).fill(0);

      orders.forEach((o: any) => {
        const date = new Date(o.orderedDate);
        if (date >= startOfWeek && date <= endOfWeek && completedStatuses.includes(o.orderStatus)) {
          const dayOfWeek = date.getDay();
          const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          values[index] += (o.total || 0);
        }
      });

      const rangeText = `${startOfWeek.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${endOfWeek.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
      return { labels, values, rangeText };
    }
  }, [dashboardData, viewMode, weekOffset, yearOffset]);

  const revenueStats = React.useMemo(() => {
    const orders = dashboardData?.rawOrders || [];
    const actualStatuses = ['DELIVERED', 'COMPLETED'];
    const processingStatuses = ['PAID', 'SHIPPED', 'SHIPPING', 'IN_TRANSIT', 'REFUND_PENDING', 'PROCESSING', 'PENDING'];

    const actual = orders.reduce((acc: number, o: any) => {
      return actualStatuses.includes(o.orderStatus) ? acc + (o.total || 0) : acc;
    }, 0);

    const processing = orders.reduce((acc: number, o: any) => {
      return processingStatuses.includes(o.orderStatus) ? acc + (o.total || 0) : acc;
    }, 0);

    return { actual, processing };
  }, [dashboardData]);

  const maxVal = Math.max(...chartData.values, 100000);
  const chartWidth = 800;
  const padding = 40;
  const usableWidth = chartWidth - (padding * 2);

  const points = chartData.values.map((v, i) => ({
    x: padding + (i / (chartData.values.length - 1)) * usableWidth,
    y: 180 - (v / maxVal) * 150
  }));

  const getCurvePath = (pts: { x: number, y: number }[]) => {
    if (pts.length < 2) return "";
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpx1 = curr.x + (next.x - curr.x) * 0.4;
      const cpx2 = next.x - (next.x - curr.x) * 0.4;
      d += ` C${cpx1},${curr.y} ${cpx2},${next.y} ${next.x},${next.y}`;
    }
    return d;
  };

  const pathData = points.length > 1 ? getCurvePath(points) : "";

  const recentOrdersData = recentOrdersPage?.content || [];

  const stats = [
    {
      title: "Tổng đơn hàng",
      value: dashboardData?.totalOrders || "0",
      trend: "Toàn hệ thống",
      icon: <ShoppingCart size={24} />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      title: "Người dùng hệ thống",
      value: dashboardData?.totalUsers || "0",
      trend: "Khách hàng đăng ký",
      icon: <Users size={24} />,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      title: "Doanh thu thực tế",
      value: `${(revenueStats.actual || 0).toLocaleString()}đ`,
      trend: "Tiền đã cầm",
      icon: <DollarSign size={24} />,
      color: "text-[#e9c349]",
      bg: "bg-[#e9c349]/10",
    },
    {
      title: "Đang xử lý",
      value: `${(revenueStats.processing || 0).toLocaleString()}đ`,
      trend: "Tiền đang treo",
      icon: <Activity size={24} />,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ];

  const recentOrders = Array.isArray(recentOrdersData) ? recentOrdersData.map((o: any) => {
    const getStatusVi = (status: string, paymentStatus: string) => {
      switch (status) {
        case 'PAID': return { text: "Đã thanh toán", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };
        case 'DELIVERED':
        case 'COMPLETED': return { text: "Hoàn tất", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" };
        case 'SHIPPED':
        case 'SHIPPING':
        case 'IN_TRANSIT': return { text: "Đang giao", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" };
        case 'CANCELLED': 
          return paymentStatus === 'REFUNDED'
            ? { text: "Đã hủy (Đã hoàn tiền)", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" }
            : { text: "Đã hủy", color: "text-rose-400 bg-rose-400/10 border-rose-400/20" };
        case 'REFUND_PENDING': return { text: "Chờ hoàn tiền", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" };
        case 'REFUNDED': return { text: "Đã hoàn tiền", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" };
        case 'PENDING':
        case 'PENDING_PAYMENT':
        case 'PAYMENT_EXPECTED':
        case 'PROCESSING':
          return paymentStatus !== 'PAID'
            ? { text: "Chờ thanh toán", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" }
            : { text: "Đang xử lý", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
        default: return { text: "Đang xử lý", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
      }
    };
    const statusInfo = getStatusVi(o.orderStatus, o.paymentStatus);
    const initials = (o.user?.userName || "U").substring(0, 2).toUpperCase();

    return {
      id: `PT-${80000 + o.id}`,
      customer: o.user?.userName || "Khách ẩn danh",
      email: o.user?.email || "N/A",
      product: o.items?.[0]?.product?.productName || "Đơn hàng mới",
      date: new Date(o.orderedDate || Date.now()).toLocaleDateString('vi-VN'),
      amount: `${(o.total || 0).toLocaleString()}đ`,
      status: statusInfo.text,
      statusColor: statusInfo.color,
      initials: initials,
    };
  }) : [];

  // Calculate category distribution
  const categories = dashboardData?.categories || [];
  const totalProducts = dashboardData?.totalProducts || 1;
  const distributionColors = ["#e9c349", "#34d399", "#60a5fa", "#f87171", "#a78bfa"];

  const getStatusLabel = (status: string, paymentStatus: string) => {
    switch (status) {
      case 'PAID': return 'Đã thanh toán';
      case 'SHIPPED':
      case 'SHIPPING':
      case 'IN_TRANSIT': return 'Đang giao hàng';
      case 'DELIVERED':
      case 'COMPLETED': return 'Đã nhận hàng';
      case 'CANCELLED': return 'Đã hủy';
      case 'REFUND_PENDING': return 'Chờ hoàn tiền';
      case 'REFUNDED': return 'Đã hoàn tiền';
      case 'PENDING':
      case 'PROCESSING':
      case 'PENDING_PAYMENT':
      case 'PAYMENT_EXPECTED':
        return paymentStatus !== 'PAID' ? 'Chờ thanh toán' : 'Đang xử lý';
      default: return 'Đang xử lý';
    }
  };

  const buildAndPrintPDF = (orders: any[], title: string, subtitle: string) => {
    const now = new Date().toLocaleString('vi-VN');
    const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const actualRevenue = orders
      .filter(o => ['DELIVERED', 'COMPLETED'].includes(o.orderStatus))
      .reduce((s, o) => s + (o.total || 0), 0);
    const processingRevenue = orders
      .filter(o => ['PAID', 'SHIPPED', 'SHIPPING', 'IN_TRANSIT', 'REFUND_PENDING'].includes(o.orderStatus))
      .reduce((s, o) => s + (o.total || 0), 0);

    const rows = orders.map((o, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f9f9f9'}">
        <td>${idx + 1}</td>
        <td style="font-weight:600;color:#b8860b">#PT-${80000 + o.id}</td>
        <td>${o.user?.userName || 'Khách ẩn danh'}</td>
        <td style="font-size:11px;color:#555">${o.user?.email || ''}</td>
        <td>${o.items?.[0]?.product?.productName || 'Sản phẩm'}</td>
        <td style="text-align:right;font-weight:700">${(o.total || 0).toLocaleString('vi-VN')} đ</td>
        <td style="text-align:center">
          <span style="padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;background:${o.orderStatus === 'PAID' ? '#d1fae5' :
        o.orderStatus === 'REFUND_PENDING' ? '#ffedd5' :
          o.orderStatus === 'CANCELLED' || o.orderStatus === 'REFUNDED' ? '#fee2e2' :
            '#fef3c7'
      };color:${o.orderStatus === 'PAID' ? '#065f46' :
        o.orderStatus === 'REFUND_PENDING' ? '#9a3412' :
          o.orderStatus === 'CANCELLED' || o.orderStatus === 'REFUNDED' ? '#991b1b' :
            '#92400e'
      }">${getStatusLabel(o.orderStatus, o.paymentStatus)}</span>
        </td>
        <td style="text-align:center;font-size:11px;color:#666">${o.orderedDate ? new Date(o.orderedDate).toLocaleDateString('vi-VN') : ''}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Be Vietnam Pro',Arial,sans-serif; color:#1a1a1a; background:#fff; padding:30px; font-size:13px; }
    .header { text-align:center; border-bottom:3px solid #e9c349; padding-bottom:20px; margin-bottom:24px; }
    .logo-text { font-size:28px; font-weight:800; color:#0b1326; letter-spacing:3px; }
    .logo-sub { font-size:11px; color:#888; letter-spacing:8px; text-transform:uppercase; margin-top:2px; }
    h1 { font-size:20px; font-weight:800; color:#0b1326; margin:12px 0 4px; text-transform:uppercase; }
    .subtitle { font-size:12px; color:#555; margin-bottom:4px; }
    .meta { font-size:11px; color:#999; }
    .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin:24px 0; }
    .stat-card { background:#f8f9fa; border:1px solid #e9ecef; border-radius:8px; padding:14px 16px; }
    .stat-label { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#888; font-weight:600; }
    .stat-value { font-size:20px; font-weight:800; color:#0b1326; margin-top:4px; }
    .stat-value.revenue { color:#b8860b; }
    table { width:100%; border-collapse:collapse; margin-top:16px; }
    thead tr { background:#0b1326; color:#e9c349; }
    th { padding:10px 12px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:1px; font-weight:700; }
    td { padding:9px 12px; border-bottom:1px solid #f0f0f0; font-size:12px; vertical-align:middle; }
    .footer { margin-top:30px; padding-top:16px; border-top:1px solid #e9ecef; text-align:center; font-size:10px; color:#aaa; }
    @media print { body { padding:15px; } .no-print { display:none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-text">PHUOC TECHNO</div>
    <div class="logo-sub">Advanced Management System</div>
    <h1>${title}</h1>
    <div class="subtitle">${subtitle}</div>
    <div class="meta">Ngày xuất báo cáo: ${now}</div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Tổng đơn hàng</div>
      <div class="stat-value">${orders.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Doanh thu thực tế</div>
      <div class="stat-value revenue">${actualRevenue.toLocaleString('vi-VN')} đ</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Doanh thu đang xử lý</div>
      <div class="stat-value" style="color:#f97316">${processingRevenue.toLocaleString('vi-VN')} đ</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Tổng người dùng</div>
      <div class="stat-value">${dashboardData?.totalUsers || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Tổng sản phẩm</div>
      <div class="stat-value">${dashboardData?.totalProducts || 0}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Mã đơn</th>
        <th>Khách hàng</th>
        <th>Email</th>
        <th>Sản phẩm</th>
        <th style="text-align:right">Số tiền</th>
        <th style="text-align:center">Trạng thái</th>
        <th style="text-align:center">Ngày đặt</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="8" style="text-align:center;color:#aaa;padding:30px">Không có dữ liệu</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    Báo cáo được tạo tự động bởi Phuoc Techno Management System — ${now}
  </div>

  <script>
    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
  </script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=1200,height=800');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const handleExportAll = () => {
    const orders = allOrdersPage?.content || [];
    buildAndPrintPDF(orders, 'Báo cáo toàn bộ đơn hàng', 'Tổng hợp tất cả đơn hàng trong hệ thống');
  };

  const handleExportToday = () => {
    const all = allOrdersPage?.content || [];
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = all.filter((o: any) => {
      const d = o.orderedDate ? new Date(o.orderedDate).toISOString().slice(0, 10) : '';
      return d === todayStr;
    });
    const todayLabel = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    buildAndPrintPDF(todayOrders, 'Báo cáo đơn hàng hôm nay', todayLabel);
  };

  return (
    <div className="p-12 space-y-12">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[#e9c349] font-headline tracking-widest text-xs uppercase mb-2">Tóm tắt điều hành</p>
          <h1 className="text-5xl font-black font-headline text-white tracking-tighter uppercase">Tổng quan</h1>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div className="space-y-1">
              <h4 className="font-headline text-xl font-bold text-white">Xu hướng mua hàng</h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => viewMode === "weekly" ? setWeekOffset(v => v - 1) : setYearOffset(v => v - 1)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-black text-[#e9c349] uppercase tracking-widest bg-[#e9c349]/10 px-3 py-1 rounded-full border border-[#e9c349]/20">
                  {chartData.rangeText}
                </span>
                <button
                  onClick={() => viewMode === "weekly" ? setWeekOffset(v => v + 1) : setYearOffset(v => v + 1)}
                  disabled={(viewMode === "weekly" && weekOffset >= 0) || (viewMode === "monthly" && yearOffset >= 0)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 bg-[#0b1326] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => { setViewMode("monthly"); setWeekOffset(0); setYearOffset(0); }}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "monthly" ? "bg-[#e9c349] text-[#0b1326] shadow-lg shadow-[#e9c349]/20" : "text-slate-500 hover:text-white"}`}
              >
                Hàng tháng
              </button>
              <button
                onClick={() => { setViewMode("weekly"); setWeekOffset(0); setYearOffset(0); }}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "weekly" ? "bg-[#e9c349] text-[#0b1326] shadow-lg shadow-[#e9c349]/20" : "text-slate-500 hover:text-white"}`}
              >
                Hàng tuần
              </button>
            </div>
          </div>
          <div className="h-64 w-full relative group/chart">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#e9c349", stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: "#e9c349", stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              {dashboardData?.totalOrders > 0 && points.length > 0 ? (
                <>
                  <path
                    d={`${pathData} L${points[points.length - 1].x},180 L${points[0].x},180 Z`}
                    fill="url(#grad)"
                  />
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#e9c349"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      fill="#e9c349"
                      r="4"
                      className="drop-shadow-[0_0_8px_rgba(233,195,73,0.6)]"
                    />
                  ))}
                </>
              ) : (
                <path d={`M${padding},180 L${chartWidth - padding},180`} fill="none" stroke="#222a3d" strokeWidth="2" strokeDasharray="5,5" />
              )}
            </svg>

            {/* Nhãn thời gian dùng HTML để không bị giãn chữ */}
            <div className="absolute bottom-[-24px] left-0 w-full h-6 pointer-events-none">
              {points.map((p, i) => (
                <span
                  key={i}
                  className="absolute text-[10px] text-slate-500 font-bold uppercase tracking-tighter whitespace-nowrap"
                  style={{
                    left: `${(p.x / 800) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {chartData.labels[i]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-[#131b2e] p-8 rounded-2xl flex flex-col border border-white/5 shadow-2xl">
          <h4 className="font-headline text-xl font-bold text-white mb-8">Danh mục sản phẩm</h4>
          <div className="space-y-6 flex-1">
            {categories.length === 0 ? (
              <p className="text-slate-500 text-xs italic">Chưa có dữ liệu danh mục...</p>
            ) : (
              categories.slice(0, 5).map((cat: any, i: number) => {
                // Approximate percentage based on random mock or real products if we had count per cat
                // Since we don't have count per cat easily without full product list, 
                // we'll just show them as equal or distributed for now, but labeled correctly.
                const percent = Math.floor(100 / Math.min(categories.length, 5));
                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-label uppercase tracking-wider text-slate-400">
                      <span>{cat.categoryName}</span>
                      <span className="text-white font-bold">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#222a3d] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: distributionColors[i % distributionColors.length] }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#e9c349]" />
              <span className="text-xs font-label text-slate-400 uppercase">Hệ sinh thái</span>
            </div>
            <span className="font-headline font-bold text-white text-2xl">{dashboardData?.totalProducts || 0} SP</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <section className="bg-[#131b2e] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="p-8 flex justify-between items-center border-b border-white/5">
          <h4 className="font-headline text-xl font-bold text-white">Đơn hàng gần đây</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-label border-b border-white/5 bg-[#171f33]/30">
                <th className="px-8 py-5 font-medium">Mã đơn</th>
                <th className="px-8 py-5 font-medium">Khách hàng</th>
                <th className="px-8 py-5 font-medium">Sản phẩm</th>
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
                      <Link href={`/admin/orders/${order.id.toString().replace('ATL-8000', '')}`} className="font-mono text-[10px] text-[#e9c349] font-bold hover:underline">{order.id}</Link>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#171f33] border border-white/10 flex items-center justify-center text-[#e9c349] text-xs font-bold group-hover:border-[#e9c349]/40 transition-all">
                          {order.initials}
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-[#e9c349] transition-colors">{order.customer}</p>
                          <p className="text-[11px] text-slate-500">{order.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400">{order.product}</td>
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
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(v => !v)}
            className="px-8 py-4 bg-[#e9c349] text-[#0b1326] font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#e9c349]/20 flex items-center gap-3"
          >
            <FileText size={18} />
            Xuất báo cáo PDF
            <svg className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showExportMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-[#131b2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[220px]">
              <button
                onClick={() => { handleExportToday(); setShowExportMenu(false); }}
                className="w-full px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-white hover:bg-[#e9c349] hover:text-[#0b1326] transition-all flex items-center gap-3 border-b border-white/5"
              >
                <FileText size={15} /> Báo cáo hôm nay
              </button>
              <button
                onClick={() => { handleExportAll(); setShowExportMenu(false); }}
                className="w-full px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-white hover:bg-[#e9c349] hover:text-[#0b1326] transition-all flex items-center gap-3"
              >
                <FileText size={15} /> Xuất toàn bộ đơn hàng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
