import React from "react";
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
  FileDown
} from "lucide-react";
import Link from "next/link";

const AdminOrders = () => {
  const stats = [
    { title: "Tổng doanh thu", value: "$142,850.00", trend: "12% so với tháng trước", icon: <TrendingUp size={24} />, color: "text-emerald-400" },
    { title: "Đang vận chuyển", value: "428", trend: "84 đơn đang chờ xử lý", icon: <Truck size={24} />, color: "text-[#e9c349]" },
    { title: "Khách hàng hoạt động", value: "1,204", trend: "Đỉnh cao thu hút mới", icon: <Users size={24} />, color: "text-blue-400" },
    { title: "Tỉ lệ hoàn trả", value: "0.8%", trend: "Hiệu quả hàng đầu ngành", icon: <CheckCircle size={24} />, color: "text-slate-400" },
  ];

  const orders = [
    {
      id: "#ATL-88219",
      customer: "Elena Jaxon",
      email: "elena.j@atelier.com",
      date: "24 tháng 10, 2023",
      amount: "$2,450.00",
      status: "Đã giao",
      statusColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      dot: "bg-emerald-400",
      initials: "EJ",
    },
    {
      id: "#ATL-88218",
      customer: "Marcus Knight",
      email: "m.knight@press.co",
      date: "23 tháng 10, 2023",
      amount: "$890.00",
      status: "Chờ duyệt",
      statusColor: "text-[#e9c349] bg-[#e9c349]/10 border-[#e9c349]/20",
      dot: "bg-[#e9c349]",
      initials: "MK",
    },
    {
      id: "#ATL-88217",
      customer: "Sarah Chen",
      email: "chen.design@icloud.com",
      date: "22 tháng 10, 2023",
      amount: "$12,100.00",
      status: "Đang xử lý",
      statusColor: "text-slate-400 bg-slate-400/10 border-white/5",
      dot: "bg-slate-400",
      initials: "SC",
    },
    {
      id: "#ATL-88216",
      customer: "Robert Lang",
      email: "rlang@domain.net",
      date: "22 tháng 10, 2023",
      amount: "$45.00",
      status: "Đã hủy",
      statusColor: "text-rose-400 bg-rose-400/10 border-rose-400/20",
      dot: "bg-rose-400",
      initials: "RL",
    },
  ];

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
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-white">quản lý đơn hàng</h1>
          <p className="text-slate-400 mt-2 max-w-xl font-body">Quản lý các giao dịch cửa hàng, theo dõi hậu cần và giám sát trạng thái thực hiện trên toàn mạng lưới kỹ thuật số toàn cầu.</p>
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
          <button className="flex items-center gap-2 bg-[#e9c349] text-[#0b1326] font-label font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform">
            <Plus size={18} />
            Tạo đơn hàng
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#131b2e] p-6 rounded-2xl relative overflow-hidden group border border-white/5 shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-white">
              {React.cloneElement(stat.icon as React.ReactElement, { size: 60 })}
            </div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-label mb-1">{stat.title}</p>
            <p className="text-2xl font-headline font-bold text-white">{stat.value}</p>
            <div className={`mt-4 flex items-center gap-1 ${stat.color} text-xs uppercase tracking-tight font-bold`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </section>

      {/* Orders Table Section */}
      <section className="bg-[#131b2e] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        {/* Table Controls */}
        <div className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-[#171f33]/30">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-[#222a3d] rounded-lg text-xs font-label text-slate-300 hover:bg-[#2d3449] transition-colors flex items-center gap-2 border border-white/5">
              <Filter size={14} />
              Bộ lọc
            </button>
            <button className="px-4 py-2 bg-[#222a3d] rounded-lg text-xs font-label text-slate-300 hover:bg-[#2d3449] transition-colors flex items-center gap-2 border border-white/5">
              <ArrowUpDown size={14} />
              Sắp xếp theo ngày
            </button>
            <button className="px-4 py-2 bg-[#222a3d] rounded-lg text-xs font-label text-slate-300 hover:bg-[#2d3449] transition-colors flex items-center gap-2 border border-white/5">
              <FileDown size={14} />
              Xuất CSV
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-label">Hiển thị:</span>
            <select className="bg-[#171f33] border-none rounded-lg text-xs py-1.5 px-3 text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-label border-b border-white/5 bg-[#171f33]/10">
                <th className="px-8 py-5 font-medium">Mã đơn hàng</th>
                <th className="px-8 py-5 font-medium">Khách hàng</th>
                <th className="px-8 py-5 font-medium">Ngày</th>
                <th className="px-8 py-5 font-medium">Số tiền</th>
                <th className="px-8 py-5 font-medium text-center">Trạng thái</th>
                <th className="px-8 py-5 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <span className="font-mono text-xs text-[#e9c349] font-bold">{order.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#171f33] flex items-center justify-center text-[10px] font-bold text-[#e9c349] border border-white/10 group-hover:border-[#e9c349]/20 transition-all">
                        {order.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-[#e9c349] transition-colors">{order.customer}</p>
                        <p className="text-[10px] text-slate-500">{order.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-400">{order.date}</td>
                  <td className="px-8 py-6 text-sm font-semibold text-white">{order.amount}</td>
                  <td className="px-8 py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tight ${order.statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${order.dot}`}></span>
                      {order.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/orders/1`} className="p-2 text-slate-400 hover:text-[#e9c349] hover:bg-white/5 rounded-lg transition-all">
                        <Eye size={18} />
                      </Link>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-[#171f33]/30 flex justify-between items-center border-t border-white/5">
          <p className="text-[10px] font-label text-slate-500 uppercase tracking-widest">Hiển thị từ 1 đến 10 của 428 đơn hàng</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-500 transition-all">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#e9c349] text-[#0b1326] text-xs font-bold shadow-md shadow-[#e9c349]/20">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 text-xs font-medium transition-all">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 text-xs font-medium transition-all">3</button>
            <span className="px-2 text-slate-500">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 text-xs font-medium transition-all">42</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-500 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Floating Action Button for Reports */}
      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#e9c349] text-[#0b1326] shadow-2xl flex items-center justify-center group active:scale-90 transition-transform z-50">
        <TrendingUp size={24} />
        <span className="absolute right-16 bg-[#131b2e] text-[#e9c349] text-xs px-4 py-2 rounded-xl border border-[#e9c349]/20 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl whitespace-nowrap pointer-events-none font-bold uppercase tracking-widest">Báo cáo nhanh</span>
      </button>
    </div>
  );
};

export default AdminOrders;
