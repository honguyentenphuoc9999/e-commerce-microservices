"use client";
import React, { useState, useEffect } from "react";
import {
   Settings,
   Mail,
   ChevronRight,
   Save,
   Loader2,
   Server,
   Info
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

const AdminSettings = () => {
   const [configs, setConfigs] = useState<any>({
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: "587",
      SMTP_USERNAME: "",
      SMTP_PASSWORD: "",
      STORE_NAME: "Phuoc Techno",
      ADMIN_EMAIL: "admin@phuoctechno.com"
   });
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [activeTab, setActiveTab] = useState("chung");

   useEffect(() => {
      const fetchConfigs = async () => {
         try {
            // Thử gọi qua gateway
            const response = await apiClient.get("/notification/api/configs");
            if (response.data && Array.isArray(response.data)) {
               const configMap: any = {};
               response.data.forEach((c: any) => {
                  configMap[c.configKey] = c.configValue;
               });
               setConfigs(prev => ({ ...prev, ...configMap }));
            }
         } catch (error: any) {
            console.error("Failed to fetch configs", error);
            // Nếu lỗi 404, có thể do service chưa đăng ký hoặc route sai, hiển thị thông báo nhẹ
            if (error.response?.status === 404) {
               toast.error("Không tìm thấy dịch vụ cấu hình (404). Vui lòng kiểm tra notification-service.");
            }
         } finally {
            setIsLoading(false);
         }
      };
      fetchConfigs();
   }, []);

   const handleSave = async () => {
      setIsSaving(true);
      try {
         await apiClient.post("/notification/api/configs/batch", configs);
         toast.success("Cấu hình đã được lưu thành công!");
      } catch (error) {
         console.error("Failed to save configs", error);
         toast.error("Lỗi khi lưu cấu hình. Vui lòng thử lại.");
      } finally {
         setIsSaving(false);
      }
   };

   const handleChange = (key: string, value: string) => {
      setConfigs({ ...configs, [key]: value });
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-screen text-[#e9c349]">
            <Loader2 className="animate-spin mr-3" />
            <span className="font-bold uppercase tracking-widest text-sm">Đang tải cấu hình...</span>
         </div>
      );
   }

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
               <h1 className="text-5xl font-black font-headline tracking-tighter text-white uppercase">Cấu hình hệ thống</h1>
               <p className="text-slate-400 mt-2 max-w-xl font-body">Quản lý các tham số vận hành, bảo mật và trải nghiệm người dùng trên toàn bộ nền tảng PHUOC TECHNO.</p>
            </div>
            <div className="flex gap-4">
               <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#e9c349] text-[#0b1326] font-label font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
               >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Lưu thay đổi
               </button>
            </div>
         </header>

         {/* Settings Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Sidebar: Settings Categories */}
            <aside className="lg:col-span-3 space-y-2 h-fit sticky top-32">
               <div className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 shadow-2xl space-y-1">
                  <button 
                     onClick={() => setActiveTab("chung")}
                     className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-sm font-bold ${activeTab === "chung" ? 'bg-[#222a3d] text-[#e9c349] shadow-inner italic' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                     <div className="flex items-center gap-3">
                        <Settings size={18} />
                        Chung
                     </div>
                     <ChevronRight size={14} />
                  </button>
                  <button 
                     onClick={() => setActiveTab("email")}
                     className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-sm font-bold ${activeTab === "email" ? 'bg-[#222a3d] text-[#e9c349] shadow-inner italic' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                     <div className="flex items-center gap-3">
                        <Mail size={18} />
                        Email (SMTP)
                     </div>
                     <ChevronRight size={14} />
                  </button>
               </div>
            </aside>

            {/* Right Content: Category Forms */}
            <div className="lg:col-span-9 space-y-12">
               {activeTab === "chung" && (
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
                           <input 
                              className="w-full bg-[#0b1326]/50 border border-white/5 rounded-2xl px-8 py-4 text-slate-500 outline-none cursor-not-allowed font-medium" 
                              value={configs.STORE_NAME} 
                              readOnly
                              type="text" 
                           />
                           <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-1 ml-1">
                              <Info size={10} /> Tên cửa hàng được cố định theo giấy phép đăng ký.
                           </p>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email quản trị (Nhận thông báo)</label>
                           <input 
                              className="w-full bg-[#0b1326] border border-white/5 rounded-2xl px-8 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all font-medium italic" 
                              value={configs.ADMIN_EMAIL} 
                              onChange={(e) => handleChange("ADMIN_EMAIL", e.target.value)}
                              placeholder="admin@yourstore.com"
                              type="email" 
                           />
                        </div>
                     </div>
                  </section>
               )}

               {activeTab === "email" && (
                  <section className="bg-[#131b2e] rounded-[2.5rem] p-12 border border-white/5 shadow-2xl space-y-10 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <Mail size={280} className="text-white" />
                     </div>

                     <div className="relative z-10">
                        <h2 className="text-2xl font-headline font-black text-white italic mb-2">Cấu hình SMTP Email (Gửi đi)</h2>
                        <p className="text-slate-500 text-sm">Cấu hình tài khoản dùng để gửi thư tự động cho khách hàng.</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">SMTP Host</label>
                           <input 
                              className="w-full bg-[#0b1326] border border-white/5 rounded-2xl px-8 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all font-medium" 
                              placeholder="smtp.gmail.com"
                              value={configs.SMTP_HOST}
                              onChange={(e) => handleChange("SMTP_HOST", e.target.value)}
                              type="text" 
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">SMTP Port</label>
                           <input 
                              className="w-full bg-[#0b1326] border border-white/5 rounded-2xl px-8 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all font-medium" 
                              placeholder="587"
                              value={configs.SMTP_PORT}
                              onChange={(e) => handleChange("SMTP_PORT", e.target.value)}
                              type="text" 
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email gửi thư (Username)</label>
                           <input 
                              className="w-full bg-[#0b1326] border border-white/5 rounded-2xl px-8 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all font-medium" 
                              placeholder="example@gmail.com"
                              value={configs.SMTP_USERNAME}
                              onChange={(e) => handleChange("SMTP_USERNAME", e.target.value)}
                              type="text" 
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mật khẩu ứng dụng (App Password)</label>
                           <input 
                              className="w-full bg-[#0b1326] border border-white/5 rounded-2xl px-8 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all font-medium" 
                              placeholder="•••• •••• •••• ••••"
                              value={configs.SMTP_PASSWORD}
                              onChange={(e) => handleChange("SMTP_PASSWORD", e.target.value)}
                              type="password" 
                           />
                        </div>
                     </div>

                     <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex gap-4 items-start relative z-10">
                        <Server className="text-amber-500 shrink-0" size={20} />
                        <div>
                           <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Hướng dẫn bảo mật</p>
                           <p className="text-[10px] text-slate-400 leading-relaxed">
                              Đây là tài khoản hệ thống dùng để gửi email. Bạn nên dùng một Gmail riêng biệt và tạo **Mật khẩu ứng dụng** để đảm bảo an toàn cho tài khoản cá nhân.
                           </p>
                        </div>
                     </div>
                  </section>
               )}
            </div>
         </div>

         <footer className="pt-12 text-center opacity-30">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.5em]">PHUOC TECHNO Core Admin Panel v4.0.1</span>
         </footer>
      </div>
   );
};

export default AdminSettings;

