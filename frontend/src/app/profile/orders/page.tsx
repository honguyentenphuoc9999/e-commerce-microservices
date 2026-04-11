import React from "react";
import { 
  Package, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Search,
  Filter,
  CheckCircle,
  Truck,
  RotateCcw,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const OrderHistory = () => {
  const orders: any[] = [];
  const dummy = [
    {
      id: "#ATL-88219",
      date: "24 tháng 10, 2023",
      amount: "$2,450.00",
      status: "Đã giao hàng",
      statusColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      items: [
        { name: "Ghế Obsidian Lounge", price: "$2,450.00", qty: 1, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCg9BI3jaFnt3bidQYPL2ws6uEGzC_VfvRNMVrcYTpvRE_b5BnXQCnHMs1xQ-HyY2nB03coBO11h3SRm6EF_K-qkwNVO5SFYdItOLwO9E_9SNIlShQhA1Yv4FMiyH_SJOAJ1r3V7RGqtjr7zzfXNl7dVaT2Fq-VkbE5AxyOEbKeEI7vmGQV7APk-W9x8suEh9XqiBwJtnam|H7jgl_roNRC_a6C585aay3kp6UMaxAHbl-HzkEu-BTUHZwMRxCso6fZ2MNIkQ9Ikw" }
      ]
    },
    {
      id: "#ATL-88218",
      date: "23 tháng 10, 2023",
      amount: "$1,890.00",
      status: "Đang vận chuyển",
      statusColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      items: [
        { name: "Đèn bàn Auric Sculpture", price: "$890.00", qty: 1, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYMcPv7gd7nSpdNVgXdQVqfF0JU_sn2TAm4mSkt_rNtM6b4iPQjxjXOyOFwqaw5XUSaT0KfXZqNjq9j3R2NDM8Pjb0J6vmhTw6EQ96uvTn_FGUMA8p6cbrG9Iiy5d9eWG92KjxttHyU6RSYwBbh1yF3txxcSTL8F5Xm1EvszU-YTkAXi1UhEdXdVJA-2ivguIskmxlMk_dziS0Xv3qoeLFB0hsw5opPCAo-y0QoDZlgf0FY-JAxzYXgbnDkeq2HQemmkBaG7sS2Q" },
        { name: "Khay kỉ niệm Silver Slate", price: "$1,000.00", qty: 1, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD89_j6fS-kH-qfByvJIdB-NlP78R9_mD5vXzVv7Tmq_y8uW7O2_cZ_o4R4n4L0A6_S7hE8p9yZ9zV7_fB0_l3C_o7D5l0R7l3L2S7l1yB9zU7l5T4l3Q7C1X9T7A5L7V4l3C1X9T7A5L7V4l3C1X9T7A5L7V4l3C1X9T7A5L7V4l3C1X9T7A5L7V4l3C1X9T7A5L7V4l3C1X9T7A5L7V4" }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tighter text-white italic">Lịch sử mua hàng</h1>
          <p className="text-slate-500 mt-2 font-medium">Theo dõi các đơn hàng và quản lý tài sản đã sở hữu.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                className="bg-[#131b2e] border border-white/5 text-sm rounded-xl pl-12 pr-4 py-3 w-64 focus:ring-1 focus:ring-[#e9c349]/40 placeholder:text-slate-600 transition-all outline-none" 
                placeholder="Tìm mã đơn hàng..." 
                type="text"
              />
           </div>
           <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
              <Filter size={20} />
           </button>
        </div>
      </header>

      <div className="space-y-8">
        {orders.length === 0 ? (
          <div className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 shadow-2xl p-24 flex flex-col items-center justify-center text-center">
            <Package size={64} className="text-slate-600 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Không có lịch sử mua hàng</h2>
            <p className="text-slate-500 mb-8 max-w-md">Bạn chưa thực hiện bất kỳ giao dịch nào tại Atelier. Hãy khám phá ngay các bộ sưu tập để bắt đầu mua sắm.</p>
            <Link href="/collections" className="px-10 py-4 bg-[#e9c349] text-[#0b1326] font-black uppercase tracking-widest text-xs rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(233,195,73,0.3)]">
               Khám phá không gian
            </Link>
          </div>
        ) : (
          orders.map((order) => (
          <div key={order.id} className="bg-[#131b2e]/40 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden group hover:border-[#e9c349]/10 transition-all duration-500">
            {/* Order Meta Header */}
            <div className="px-12 py-8 border-b border-white/5 bg-[#171f33]/30 flex flex-wrap justify-between items-center gap-6">
              <div className="flex gap-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Đơn hàng</p>
                  <p className="text-sm font-black text-white italic group-hover:text-[#e9c349] transition-colors">{order.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Ngày đặt</p>
                  <p className="text-sm font-bold text-slate-300">{order.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Tổng thanh toán</p>
                  <p className="text-sm font-bold text-white italic">{order.amount}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.statusColor} shadow-inner`}>
                   {order.status}
                </span>
                <Link href={`/profile/orders/${order.id}`} className="text-[#e9c349] hover:text-white transition-all text-sm font-black flex items-center gap-2 group/link">
                   Chi tiết
                   <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-12 space-y-8">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-10">
                  <div className="w-24 h-32 bg-[#0b1326] rounded-2xl border border-white/10 group-hover:border-[#e9c349]/20 transition-all duration-500 overflow-hidden flex-shrink-0 shadow-xl group/img">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 group-hover/img:scale-110" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-white italic group-hover:text-[#e9c349] transition-colors">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">Mã sản phẩm: ATL-ITEM-{idx + 100}</p>
                    </div>
                    <div className="flex items-center gap-8 pt-2">
                       <span className="text-sm font-bold text-slate-300">Số lượng: 0{item.qty}</span>
                       <span className="text-sm font-black text-white italic">{item.price}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                     <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all hover:bg-white/10">Mua lại</button>
                     <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all hover:bg-white/10">Viết đánh giá</button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick Status Bar */}
            <div className="px-12 py-6 bg-[#0b1326]/40 flex justify-between items-center border-t border-white/5">
               <div className="flex gap-4 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Giao thành công bởi Atelier Express</p>
               </div>
               <button className="text-[10px] font-black text-slate-400 hover:text-[#e9c349] transition-all uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} /> Xem hành trình vận chuyển
               </button>
            </div>
          </div>
        )))}
      </div>
      
      {orders.length > 0 && (
        <footer className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] tracking-widest">Đang hiển thị {orders.length} đơn hàng gần nhất</p>
           <button className="px-12 py-4 rounded-full bg-linear-to-br from-[#171f33] to-[#0b1326] text-white border border-white/10 font-black text-xs uppercase tracking-widest hover:border-[#e9c349]/30 transition-all shadow-xl active:scale-95">Xem toàn bộ lịch sử</button>
        </footer>
      )}
    </div>
  );
};

export default OrderHistory;
