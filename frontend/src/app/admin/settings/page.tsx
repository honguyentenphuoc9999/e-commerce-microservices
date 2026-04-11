import React from "react";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  Mail, 
  Lock,
  ChevronRight,
  Save,
  Trash2,
  RefreshCw
} from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="p-12 space-y-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-label">Hệ thống quản trị</span>
            <span className="text-[10px] text-slate-500">/</span>
            <span className="text-[10px] uppercase tracking-widest text-[#e9c349] font-label">Cài đặt cấu hình</span>
          </nav>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-white uppercase italic">Cấu hình hệ thống</h1>
          <p className="text-slate-400 mt-2 max-w-xl font-body">Quản lý các tham số vận hành, bảo mật và trải nghiệm người dùng trên toàn bộ nền tảng Atelier.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white/5 text-white font-label font-bold px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
            <RefreshCw size={18} />
            Khôi phục mặc định
          </button>
          <button className="flex items-center gap-2 bg-[#e9c349] text-[#0b1326] font-label font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform">
            <Save size={18} />
            Lưu thay đổi
          </button>
        </div>
      </header>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Sidebar: Settings Categories */}
        <aside className="lg:col-span-3 space-y-2 h-fit sticky top-32">
          <div className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 shadow-2xl space-y-1">
             <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#222a3d] text-[#e9c349] font-bold text-sm shadow-inner italic">
                <div className="flex items-center gap-3">
                   <Settings size={18} />
                   Chung
                </div>
                <ChevronRight size={14} />
             </button>
             <button className="w-full flex items-center justify-between p-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                <div className="flex items-center gap-3">
                   <Shield size={18} />
                   Bảo mật
                </div>
                <ChevronRight size={14} />
             </button>
             <button className="w-full flex items-center justify-between p-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                <div className="flex items-center gap-3">
                   <Bell size={18} />
                   Thông báo
                </div>
                <ChevronRight size={14} />
             </button>
             <button className="w-full flex items-center justify-between p-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                <div className="flex items-center gap-3">
                   <Globe size={18} />
                   Ngôn ngữ & Vùng
                </div>
                <ChevronRight size={14} />
             </button>
             <button className="w-full flex items-center justify-between p-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                <div className="flex items-center gap-3">
                   <Database size={18} />
                   Lưu trữ & Dữ liệu
                </div>
                <ChevronRight size={14} />
             </button>
          </div>
          
          <div className="bg-linear-to-br from-rose-500/10 to-transparent rounded-2xl p-8 border border-rose-500/10 shadow-2xl group">
             <h4 className="text-xs font-black uppercase tracking-widest text-rose-400 mb-4 italic">Khu vực nguy hiểm</h4>
             <p className="text-[10px] text-rose-500/60 leading-relaxed mb-6">Các hành động tại đây có thể làm thay đổi vĩnh viễn dữ liệu hệ thống.</p>
             <button className="w-full py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 transition-all flex items-center justify-center gap-2">
                <Trash2 size={12} />
                Xóa tất cả bộ nhớ đệm
             </button>
          </div>
        </aside>

        {/* Right Content: Category Forms */}
        <div className="lg:col-span-9 space-y-12">
           {/* Section: Profile Settings */}
           <section className="bg-[#131b2e] rounded-[2.5rem] p-12 border border-white/5 shadow-2xl space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Settings size={280} className="text-white" />
              </div>
              
              <div className="relative z-10">
                 <h2 className="text-2xl font-headline font-black text-white italic mb-2">Cấu hình vận hành</h2>
                 <p className="text-slate-500 text-sm">Điều chỉnh các thông số cơ bản của nền tảng thương mại.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tên cửa hàng</label>
                   <input className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all font-medium italic" defaultValue="Digital Atelier" type="text"/>
                 </div>
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email quản trị</label>
                   <input className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all font-medium italic" defaultValue="admin@atelier.gallery" type="email"/>
                 </div>
                 <div className="md:col-span-2 space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mô tả hệ thống</label>
                   <textarea className="w-full bg-[#0b1326] border-none rounded-[2rem] px-8 py-6 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all font-medium italic min-h-[120px]" defaultValue="Nền tảng thương mại điện tử cao cấp dành cho các sản phẩm nghệ thuật và nội thất thiết kế." />
                 </div>
              </div>
           </section>

           {/* Section: Interface Settings */}
           <section className="bg-[#131b2e] rounded-[2.5rem] p-12 border border-white/5 shadow-2xl space-y-10">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-headline font-black text-white italic">Trải nghiệm người dùng</h2>
                 <div className="px-5 py-2 rounded-full bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-400/20">Active</div>
              </div>
              
              <div className="space-y-6">
                 <div className="flex justify-between items-center p-6 bg-[#0b1326] rounded-2xl hover:bg-white/2 transition-colors border border-white/5">
                    <div className="flex gap-5 items-center">
                       <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Globe size={20} /></div>
                       <div>
                          <p className="font-bold text-white text-sm">Chế độ tối tự động</p>
                          <p className="text-xs text-slate-500">Kích hoạt giao diện dựa trên tùy chọn hệ thống của khách hàng.</p>
                       </div>
                    </div>
                    <div className="w-12 h-6 bg-[#222a3d] rounded-full p-1 relative cursor-pointer ring-1 ring-white/10">
                       <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-[#e9c349] shadow-lg"></div>
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-center p-6 bg-[#0b1326] rounded-2xl hover:bg-white/2 transition-colors border border-white/5">
                    <div className="flex gap-5 items-center">
                       <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Bell size={20} /></div>
                       <div>
                          <p className="font-bold text-white text-sm">Thông báo giao dịch</p>
                          <p className="text-xs text-slate-500">Gửi thông báo đẩy ngay lập tức khi phát sinh đơn hàng mới.</p>
                       </div>
                    </div>
                    <div className="w-12 h-6 bg-[#e9c349] rounded-full p-1 relative cursor-pointer">
                       <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-[#0b1326] shadow-lg"></div>
                    </div>
                 </div>

                 <div className="flex justify-between items-center p-6 bg-[#0b1326] rounded-2xl hover:bg-white/2 transition-colors border border-white/5">
                    <div className="flex gap-5 items-center">
                       <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Database size={20} /></div>
                       <div>
                          <p className="font-bold text-white text-sm">Sao lưu đồng bộ</p>
                          <p className="text-xs text-slate-500">Tự động sao lưu cơ sở dữ liệu lên đám mây mỗi 24 giờ.</p>
                       </div>
                    </div>
                    <div className="w-12 h-6 bg-[#222a3d] rounded-full p-1 relative cursor-pointer">
                       <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-slate-600 shadow-lg"></div>
                    </div>
                 </div>
              </div>
           </section>
        </div>
      </div>

      <footer className="pt-12 text-center opacity-30">
         <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.5em]">Atelier Core Admin Panel v4.0.1</span>
      </footer>
    </div>
  );
};

export default AdminSettings;
