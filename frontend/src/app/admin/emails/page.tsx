"use client";
import React, { useState } from "react";
import { 
  Send, 
  Mail, 
  Users, 
  FileText, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Paperclip,
  Image,
  Type,
  Inbox,
  Eye,
  Trash2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";

const EmailsPage = () => {
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['adminEmails'],
    queryFn: adminService.getEmails
  });

  const stats = {
    total: emails.length,
    successRate: emails.length > 0 
      ? ((emails.filter((e: any) => e.status === 'Đã gửi').length / emails.length) * 100).toFixed(1) 
      : 0,
    thisWeek: emails.filter((e: any) => {
      const emailDate = new Date(e.rawDate);
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return emailDate > oneWeekAgo;
    }).length,
    errors: emails.filter((e: any) => e.status === 'Lỗi').length
  };

  const [activeTab, setActiveTab] = useState("history"); // history or compose

  return (
    <div className="p-12 space-y-12 animate-in slide-in-from-bottom-6 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[#e9c349] font-headline tracking-widest text-xs uppercase mb-2">Truyền thông hệ thống</p>
          <h1 className="text-5xl font-black font-headline text-white tracking-tighter uppercase">Quản lý Email</h1>
        </div>
        <div className="flex gap-4 p-1.5 bg-[#131b2e] rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "history" ? "bg-[#e9c349] text-[#0b1326] shadow-xl shadow-[#e9c349]/20" : "text-slate-400 hover:text-white"}`}
          >
            Lịch sử gửi thư
          </button>
          <button 
            onClick={() => setActiveTab("compose")}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "compose" ? "bg-[#e9c349] text-[#0b1326] shadow-xl shadow-[#e9c349]/20" : "text-slate-400 hover:text-white"}`}
          >
            Gửi thư mới
          </button>
        </div>
      </header>

      {activeTab === "history" ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-2xl">
              <Mail className="text-[#e9c349] mb-4" size={24} />
              <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Tổng thư đã gửi</p>
              <h3 className="text-2xl font-headline font-bold text-white">{stats.total}</h3>
            </div>
            <div className="bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-2xl">
              <CheckCircle className="text-emerald-400 mb-4" size={24} />
              <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Tỷ lệ thành công</p>
              <h3 className="text-2xl font-headline font-bold text-white">{stats.successRate}%</h3>
            </div>
            <div className="bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-2xl">
              <Plus className="text-blue-400 mb-4" size={24} />
              <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Thư tuần này</p>
              <h3 className="text-2xl font-headline font-bold text-white">{stats.thisWeek}</h3>
            </div>
            <div className="bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-2xl">
              <AlertCircle className="text-rose-400 mb-4" size={24} />
              <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Báo cáo thư lỗi</p>
              <h3 className="text-2xl font-headline font-bold text-white">{stats.errors}</h3>
            </div>
          </div>

          <div className="bg-[#131b2e] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-label border-b border-white/5 bg-[#171f33]/30">
                    <th className="px-8 py-5 font-medium">Chủ đề thư</th>
                    <th className="px-8 py-5 font-medium">Người nhận</th>
                    <th className="px-8 py-5 font-medium">Ngày gửi</th>
                    <th className="px-8 py-5 font-medium text-center">Trạng thái</th>
                    <th className="px-8 py-5 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                     <tr>
                        <td colSpan={5} className="py-20 text-center">
                           <div className="w-8 h-8 border-4 border-[#e9c349] border-t-transparent rounded-full animate-spin mx-auto"></div>
                           <p className="text-xs text-slate-500 mt-4 tracking-widest uppercase font-black">Syncing digital mailbox...</p>
                        </td>
                     </tr>
                  ) : emails.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Inbox className="text-slate-600" size={28} />
                        </div>
                        <h3 className="text-xl font-headline font-black text-white italic">Hộp thư trống</h3>
                        <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">Chưa có lịch sử gửi email nào được ghi nhận</p>
                      </td>
                    </tr>
                  ) : (
                    emails.map((email: any) => (
                      <tr key={email.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
                        <td className="px-8 py-6 max-w-md">
                          <p className="font-medium text-white truncate group-hover:text-[#e9c349] transition-colors">{email.subject}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono font-bold">{email.id}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-slate-400" />
                            <span className="text-sm text-slate-300">{email.recipient}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-400">{email.date}</td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border inline-flex items-center gap-2 ${email.statusColor}`}>
                            {email.status === "Đã gửi" && <CheckCircle size={10} />}
                            {email.status === "Chờ gửi" && <Clock size={10} />}
                            {email.status === "Lỗi" && <AlertCircle size={10} />}
                            {email.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-2 text-slate-400 hover:text-[#e9c349] hover:bg-white/5 rounded-lg transition-all">
                                <Eye size={18} />
                             </button>
                             <button className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-all">
                                <Trash2 size={18} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in slide-in-from-right-12 duration-700">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#131b2e] p-10 rounded-2xl border border-white/5 shadow-2xl space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Người nhận (Email hoặc Nhóm)</label>
                <input 
                  type="text" 
                  placeholder="name@example.com, #VIP_Customers" 
                  className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-6 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Chủ đề thư</label>
                <input 
                  type="text" 
                  placeholder="Nhập tiêu đề thư..." 
                  className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-6 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nội dung thư</label>
                <div className="bg-[#0b1326] border border-white/5 rounded-xl overflow-hidden">
                  <div className="flex border-b border-white/5 p-2 gap-4">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"><Type size={18} /></button>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"><Image size={18} /></button>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"><Paperclip size={18} /></button>
                  </div>
                  <textarea 
                    rows={12}
                    placeholder="Soạn thảo thông điệp cao cấp của bạn tại đây..." 
                    className="w-full bg-transparent border-none p-6 text-sm text-white focus:ring-0 outline-none transition-all placeholder:text-slate-700 leading-relaxed"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button className="bg-[#e9c349] text-[#0b1326] px-12 py-5 rounded-xl font-headline font-black uppercase text-xs tracking-widest shadow-2xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  <Send size={18} /> Gửi thư ngay
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#131b2e] p-8 rounded-2xl border border-white/5 shadow-2xl">
              <h4 className="text-white font-headline font-bold mb-6 flex items-center gap-2">
                <FileText className="text-[#e9c349]" size={20} />
                Mẫu thư có sẵn
              </h4>
              <div className="space-y-3">
                <button className="w-full p-4 rounded-xl border border-white/5 hover:border-[#e9c349]/30 hover:bg-white/5 text-left transition-all">
                  <p className="text-xs font-bold text-white mb-1">Xác nhận đơn hàng</p>
                  <p className="text-[10px] text-slate-500">Mẫu mặc định cho khách mua hàng</p>
                </button>
                <button className="w-full p-4 rounded-xl border border-white/5 hover:border-[#e9c349]/30 hover:bg-white/5 text-left transition-all">
                  <p className="text-xs font-bold text-white mb-1">Ưu đãi cá nhân</p>
                  <p className="text-[10px] text-slate-500">Thư mời VIP ưu đãi 15%</p>
                </button>
                <button className="w-full p-4 rounded-xl border border-white/5 hover:border-[#e9c349]/30 hover:bg-white/5 text-left transition-all">
                  <p className="text-xs font-bold text-white mb-1">Khôi phục mật khẩu</p>
                  <p className="text-[10px] text-slate-500">Mẫu chuẩn cho auth service</p>
                </button>
                <button className="w-full py-4 border-2 border-dashed border-white/5 rounded-xl text-slate-600 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-white/10 hover:text-slate-400 transition-all mt-4">
                  <Plus size={14} /> Thêm mẫu mới
                </button>
              </div>
            </div>

            <div className="bg-[#131b2e] p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-white font-headline font-bold mb-2 tracking-tight">Đối tượng mục tiêu</h4>
                 <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">Sử dụng tag để gửi thư hàng loạt đến các phân khúc khách hàng đặc biệt.</p>
                 <div className="flex flex-wrap gap-2">
                   <span className="px-3 py-1 bg-[#171f33] border border-[#e9c349]/20 text-[#e9c349] text-[9px] font-bold rounded-lg uppercase tracking-wider">#VIP</span>
                   <span className="px-3 py-1 bg-[#171f33] border border-blue-400/20 text-blue-400 text-[9px] font-bold rounded-lg uppercase tracking-wider">#New_Users</span>
                   <span className="px-3 py-1 bg-[#171f33] border border-emerald-400/20 text-emerald-400 text-[9px] font-bold rounded-lg uppercase tracking-wider">#Cart_Abandon</span>
                 </div>
               </div>
               <div className="absolute -right-6 -bottom-6 opacity-5">
                 <Users size={120} />
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailsPage;
