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
  ExternalLink
} from "lucide-react";
import Link from "next/link";

const OrderDetail = ({ params }: { params: { id: string } }) => {
  const orderId = params.id || "ATL-88219";

  const orderItems = [
    {
      name: "Ghế Obsidian Lounge",
      sku: "OBS-FUR-001",
      variant: "Hoàn thiện mờ / Lớn",
      price: "$2,450.00",
      quantity: 1,
      total: "$2,450.00",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCg9BI3jaFnt3bidQYPL2ws6uEGzC_VfvRNMVrcYTpvRE_b5BnXQCnHMs1xQ-HyY2nB03coBO11h3SRm6EF_K-qkwNVO5SFYdItOLwO9E_9SNIlShQhA1Yv4FMiyH_SJOAJ1r3V7RGqtjr7zzfXNl7dVaT2Fq-VkbE5AxyOEbKeEI7vmGQV7APk-W9x8suEh9XqiBwJtnam|H7jgl_roNRC_a6C585aay3kp6UMaxAHbl-HzkEu-BTUHZwMRxCso6fZ2MNIkQ9Ikw"
    },
    {
      name: "Đèn điêu khắc Auric",
      sku: "LGT-ART-042",
      variant: "Đồng thau xước",
      price: "$1,120.00",
      quantity: 2,
      total: "$2,240.00",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYMcPv7gd7nSpdNVgXdQVqfF0JU_sn2TAm4mSkt_rNtM6b4iPQjxjXOyOFwqaw5XUSaT0KfXZqNjq9j3R2NDM8Pjb0J6vmhTw6EQ96uvTn_FGUMA8p6cbrG9Iiy5d9eWG92KjxttHyU6RSYwBbh1yF3txxcSTL8F5Xm1EvszU-YTkAXi1UhEdXdVJA-2ivguIskmxlMk_dziS0Xv3qoeLFB0hsw5opPCAo-y0QoDZlgf0FY-JAxzYXgbnDkeq2HQemmkBaG7sS2Q"
    }
  ];

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
            <h1 className="text-4xl font-headline font-extrabold text-white tracking-tighter">Đơn hàng #{orderId}</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
               Đã giao hàng
            </span>
          </div>
          <p className="text-slate-500 text-sm">Thanh toán vào ngày 24 tháng 10, 2023 lúc 14:32</p>
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
              <span className="text-slate-500 text-xs uppercase tracking-widest font-bold">2 Sản phẩm</span>
            </div>
            <div className="divide-y divide-white/5">
              {orderItems.map((item, idx) => (
                <div key={idx} className="p-8 flex items-center gap-8 group">
                  <div className="w-24 h-32 bg-[#171f33] rounded-xl overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-[#e9c349]/30 transition-all duration-500 shadow-xl">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-headline text-lg font-bold text-white group-hover:text-[#e9c349] transition-colors">{item.name}</h3>
                      <p className="text-white font-bold">{item.total}</p>
                    </div>
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">{item.sku}</p>
                    <p className="text-xs text-slate-400 bg-white/5 inline-block px-2 py-1 rounded-md">{item.variant}</p>
                    <div className="flex gap-8 pt-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Đơn giá</p>
                        <p className="text-sm font-medium text-slate-300">{item.price}</p>
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
              <div className="w-64 space-y-4">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Tạm tính</span>
                  <span className="text-white">$4,690.00</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Thuế (8%)</span>
                  <span className="text-white">$375.20</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Phí vận chuyển</span>
                  <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest">Miễn phí</span>
                </div>
                <div className="flex justify-between text-xl font-headline font-black text-[#e9c349] pt-4 border-t border-white/10">
                  <span>Tổng cộng</span>
                  <span>$5,065.20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Activity */}
          <div className="bg-[#131b2e] rounded-2xl border border-white/5 shadow-2xl p-8 space-y-8">
            <h2 className="font-headline text-xl font-bold text-white">Lịch sử hoạt động</h2>
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-white/5">
              <div className="relative pl-10">
                <span className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-[#0b1326] shadow-lg shadow-emerald-400/20">
                  <CheckCircle size={14} />
                </span>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Đơn hàng hoàn tất</p>
                <p className="text-xs text-slate-500 mt-1">Hôm nay, 10:42 AM</p>
                <p className="text-sm text-slate-400 mt-2 bg-white/5 p-4 rounded-xl border border-white/5 italic">"Khách hàng đã ký nhận kiện hàng tại 722 Metropolitan Ave."</p>
              </div>
              <div className="relative pl-10">
                <span className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-[#0b1326] shadow-lg shadow-blue-400/20">
                  <Truck size={14} />
                </span>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Đang vận chuyển</p>
                <p className="text-xs text-slate-500 mt-1">26 tháng 10, 09:15 AM</p>
              </div>
              <div className="relative pl-10">
                <span className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#171f33] border border-white/10 flex items-center justify-center text-slate-400">
                  <Package size={14} />
                </span>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đã đóng gói xong</p>
                <p className="text-xs text-slate-500 mt-1">25 tháng 10, 14:20 PM</p>
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
              <div className="w-16 h-16 rounded-full bg-[#2d3449] border-2 border-[#e9c349]/20 flex items-center justify-center text-xl font-bold text-[#e9c349] font-headline shadow-2xl">
                EJ
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Elena Jaxon</h4>
                <p className="text-xs text-slate-500">Người mua hàng thân thiết</p>
              </div>
            </div>
            <div className="space-y-6 pt-8 border-t border-white/5">
              <div className="flex gap-4">
                <span className="p-2 bg-white/5 rounded-lg text-slate-500 h-fit"><Mail size={16} /></span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-300">elena.j@atelier.com</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="p-2 bg-white/5 rounded-lg text-slate-500 h-fit"><User size={16} /></span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Mã khách hàng</p>
                  <p className="text-sm font-medium text-slate-300 font-mono">#USR-88219</p>
                </div>
              </div>
              <Link href="/admin/users/1" className="w-full py-4 bg-[#222a3d] text-white text-center rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#2d3449] transition-all flex items-center justify-center gap-2 border border-white/5">
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
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    722 Metropolitan Ave,<br />
                    Brooklyn, NY 11211,<br />
                    Hoa Kỳ
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="p-2 bg-[#e9c349]/10 rounded-lg text-[#e9c349] h-fit"><Truck size={16} /></span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Phương thức</p>
                  <p className="text-sm font-medium text-slate-300">Giao hàng Ưu tiên (Atelier Express)</p>
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
                <span className="p-2 bg-emerald-400/10 rounded-lg text-emerald-400 h-fit"><CreditCard size={16} /></span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Trạng thái</p>
                  <p className="text-sm font-bold text-emerald-400 uppercase">Đã thanh toán (Captureed)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="p-2 bg-emerald-400/10 rounded-lg text-emerald-400 h-fit"><CheckCircle size={16} /></span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Giao dịch</p>
                  <p className="text-sm font-medium text-slate-300 font-mono">txn_3N8p2DAtelier99</p>
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
