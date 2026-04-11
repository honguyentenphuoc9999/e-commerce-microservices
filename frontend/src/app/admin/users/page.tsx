"use client";
import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Users, 
  TrendingUp, 
  Lock, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2,
  LockOpen,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  FileDown,
  X,
  Save,
  Mail,
  User as UserIcon,
  Shield
} from "lucide-react";
import Link from "next/link";

const AdminUsers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const users = [
    {
      id: "#USR-88219",
      name: "Elena Vance",
      email: "elena.vance@atelier.io",
      date: "12 thg 10, 2023",
      lastLogin: "2h trước",
      status: "Hoạt động",
      statusColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9nj2f61jnz2fO28GPt2yLDObZo5qJNjsySv_TvzZM5OkcVhpWDZdY0dmd-EREUAS9RJSkybtJC36JuM6BKwAM4ceGOQDlS4udo8KVNUFIsoUWEU4ur2TlJngMsx29rUgXJM2qatymmUs7TtkA2tcfqyNkrMVS97FAesKSJ9i7KH9C-BOIkbfjHEYjsAF8JgnIjzUh8EYnybFlr6r-LQjW0vB7ZRs6SLoUPPGabb9cfUtrXZmqkLuW2joorudt_F_rrvC0dhb5-w"
    },
    {
      id: "#USR-88218",
      name: "Marcus Thorne",
      email: "m.thorne@design.com",
      date: "04 thg 11, 2023",
      lastLogin: "5 ngày trước",
      status: "Ngừng hoạt động",
      statusColor: "text-rose-400 bg-rose-400/10 border-rose-400/20",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXbrrOt6c4WepRi4A6MQ3RBscMa7HKpD0CiW23V24qZiRlQx0ymJ3E-1eI6iHZEvkmfj0PtY7LDh9rkRmiaA2V0SCB_xMGrTTJv1JOjnxBtCv_muJfpWpV6ibm8nfg3Zae3OTKpTvLTgxTHwsGseAor8d0C1dRPcG_tkNTgt1DQbqKhV41vdt_mheXKzdIecO7J6wve5lUrTXFJgHh8X2r2I7ympDFQywaEAJMEoPKJ7FAKp9SMj5dF0XwVPxD_DoMWLZq7oh1wg"
    }
  ];

  const handleOpenModal = (type: "add" | "edit", user?: any) => {
    setModalType(type);
    setSelectedUser(user || null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-12 space-y-12 bg-linear-to-b from-[#0b1326] to-[#0f172a] animate-in fade-in duration-700 relative">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
           <nav className="flex gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-label">Digital Admin</span>
            <span className="text-[10px] text-slate-500">/</span>
            <span className="text-[10px] uppercase tracking-widest text-[#e9c349] font-label">Hệ thống khách hàng</span>
          </nav>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-white uppercase italic">quản lý người dùng</h1>
          <p className="text-slate-400 mt-2 max-w-xl font-body text-sm">Kiểm soát truy cập, phân quyền thành viên và quản lý danh tính người dùng bảo mật toàn cầu.</p>
        </div>
        <button 
           onClick={() => handleOpenModal("add")}
           className="bg-linear-to-br from-[#e9c349] to-[#bf9f3d] text-[#0b1326] px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#e9c349]/10"
        >
          <UserPlus size={18} />
          <span>Thêm thành viên mới</span>
        </button>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-full border border-white/5 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
           <div className="w-14 h-14 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
              <Users size={24} />
           </div>
           <div>
              <div className="text-3xl font-black font-headline tracking-tighter text-white">1,284</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Tổng người dùng</div>
           </div>
        </div>
        <div className="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-full border border-white/5 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
           <div className="w-14 h-14 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={24} />
           </div>
           <div>
              <div className="text-3xl font-black font-headline tracking-tighter text-white">842</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Thành viên xác minh</div>
           </div>
        </div>
        <div className="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-full border border-white/5 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
           <div className="w-14 h-14 rounded-full bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349]">
              <TrendingUp size={24} />
           </div>
           <div>
              <div className="text-3xl font-black font-headline tracking-tighter text-white">+12%</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Tăng trưởng tháng</div>
           </div>
        </div>
        <div className="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-full border border-white/5 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
           <div className="w-14 h-14 rounded-full bg-rose-400/10 flex items-center justify-center text-rose-400">
              <Lock size={24} />
           </div>
           <div>
              <div className="text-3xl font-black font-headline tracking-tighter text-white">7</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Khiếu nại chờ</div>
           </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section>
        <div className="bg-[#131b2e] p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-center border border-white/5 shadow-2xl shadow-black/40">
          <div className="relative flex-1 group w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#e9c349] transition-colors" />
            <input 
              className="w-full bg-[#0b1326] border-none rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 placeholder:text-slate-600 transition-all outline-none" 
              placeholder="Tìm kiếm danh tính kỹ thuật số..." 
              type="text"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-[#222a3d] px-6 py-3.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all border border-white/5">
              <Filter size={14} />
              <span>Bộ lọc</span>
            </button>
            <button className="bg-[#222a3d] px-6 py-3.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all border border-white/5">
              <FileDown size={14} />
              <span>Xuất quản lý</span>
            </button>
          </div>
        </div>
      </section>

      {/* User Table Section */}
      <section>
        <div className="bg-[#131b2e] rounded-3xl overflow-hidden border border-white/5 shadow-3xl bg-linear-to-b from-[#131b2e] to-[#0b1326]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#171f33]/30 text-slate-500 uppercase text-[10px] tracking-[0.2em] font-black border-b border-white/5">
                <th className="px-10 py-6">Danh tính người dùng</th>
                <th className="px-10 py-6 text-center">Vai trò</th>
                <th className="px-10 py-6">Ngày gia nhập</th>
                <th className="px-10 py-6 text-center">Trạng thái bảo mật</th>
                <th className="px-10 py-6 text-right font-black tracking-widest opacity-0">...</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.012] transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                         <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#e9c349] to-transparent rounded-full opacity-0 group-hover:opacity-30 blur-sm transition-opacity"></div>
                         <img src={user.image} alt={user.name} className="relative w-12 h-12 rounded-full object-cover border-2 border-white/10 group-hover:border-[#e9c349]/40 transition-all shadow-2xl" />
                      </div>
                      <div>
                        <div className="font-black text-white group-hover:text-[#e9c349] transition-colors text-base">{user.name}</div>
                        <div className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-tight">{user.id} / {user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Khách hàng VIP</td>
                  <td className="px-10 py-8">
                    <div className="text-sm font-bold text-slate-300">{user.date}</div>
                    <div className="text-[10px] uppercase tracking-widest text-[#e9c349] mt-1.5 font-bold">Login: {user.lastLogin}</div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner inline-block ${user.statusColor}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button 
                         onClick={() => handleOpenModal("edit", user)}
                         className="p-3 bg-[#222a3d] rounded-xl text-slate-400 hover:text-[#e9c349] transition-all border border-white/5 shadow-2xl group-hover:scale-105"
                      >
                        <Edit size={18} />
                      </button>
                      <button className="p-3 bg-[#222a3d] rounded-xl text-slate-400 hover:text-emerald-400 transition-all border border-white/5 shadow-2xl group-hover:scale-105">
                        <LockOpen size={18} />
                      </button>
                      <button className="p-3 bg-[#222a3d] rounded-xl text-slate-400 hover:text-rose-400 transition-all border border-white/5 shadow-2xl group-hover:scale-105">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="p-10 bg-[#171f33]/30 flex justify-between items-center border-t border-white/5">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">Hiển thị 1 đến 4 trên 1.284 người dùng</div>
            <div className="flex items-center gap-2">
              <button className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-white/5 text-slate-500 transition-all border border-white/5 opacity-50 cursor-not-allowed">
                <ChevronLeft size={20} />
              </button>
              <button className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#e9c349] text-[#0b1326] text-xs font-black shadow-2xl shadow-[#e9c349]/20">1</button>
              <button className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-white/5 text-slate-300 text-xs font-black transition-all border border-white/5">2</button>
              <button className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-white/5 text-slate-500 transition-all border border-white/5">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-[#131b2e] w-full max-w-2xl rounded-4xl border border-white/10 shadow-4xl overflow-hidden animate-in slide-in-from-bottom-16 duration-700">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-[#171f33] to-[#131b2e]">
                 <div>
                    <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight italic">
                       {modalType === "add" ? "Khởi tạo thành viên" : "Điều chỉnh định danh"}
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2 font-black">Digital Guardian identity system</p>
                 </div>
                 <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-4 rounded-full hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all border border-white/5"
                 >
                    <X size={24} />
                 </button>
              </div>

              <div className="p-12 space-y-10">
                 <div className="flex flex-col items-center justify-center space-y-6 pb-6 border-b border-white/5 mr-[-48px] ml-[-48px] px-12">
                   <div className="relative group/avatar cursor-pointer">
                      <div className="absolute -inset-1 bg-linear-to-tr from-[#e9c349] to-blue-500 rounded-full blur opacity-40 group-hover/avatar:opacity-100 transition-opacity"></div>
                      <div className="relative w-28 h-28 rounded-full bg-[#0b1326] border-2 border-white/10 overflow-hidden flex items-center justify-center">
                        {selectedUser?.image ? (
                          <img src={selectedUser.image} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-1000" />
                        ) : (
                          <UserIcon size={40} className="text-slate-600" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black uppercase text-white tracking-widest">Thay đổi</div>
                      </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Họ và Tên</label>
                      <div className="relative">
                        <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" />
                        <input 
                          defaultValue={selectedUser?.name}
                          placeholder="Ví dụ: Alexander Thorne" 
                          className="w-full bg-[#0b1326] border border-white/5 rounded-2xl py-5 pl-12 pr-6 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-800 font-bold"
                        />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" />
                        <input 
                          defaultValue={selectedUser?.email}
                          placeholder="name@atelier.io" 
                          className="w-full bg-[#0b1326] border border-white/5 rounded-2xl py-5 pl-12 pr-6 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-800"
                        />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Vai trò hệ thống</label>
                      <select className="w-full bg-[#0b1326] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all appearance-none font-bold">
                         <option>Thành viên VIP</option>
                         <option>Cộng tác viên</option>
                         <option>Quản trị viên (Admin)</option>
                         <option>Nội bộ Atelier</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Mức bảo mật</label>
                      <div className="flex gap-3">
                         <button className="flex-1 py-4 bg-[#e9c349] text-[#0b1326] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#e9c349] flex items-center justify-center gap-2">
                           <Shield size={14} /> Tier-0
                         </button>
                         <button className="flex-1 py-4 bg-white/5 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">
                           Tier-1
                         </button>
                      </div>
                   </div>
                 </div>
              </div>

              <div className="p-10 border-t border-white/5 bg-[#171f33]/30 flex justify-end gap-6">
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="px-10 py-5 rounded-2xl text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-white transition-all"
                 >
                    Hủy quy trình
                 </button>
                 <button className="px-14 py-5 bg-[#e9c349] text-[#0b1326] rounded-2xl font-headline font-black text-xs uppercase tracking-widest shadow-4xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 border border-white/10">
                    <Save size={20} /> {modalType === "add" ? "Kích hoạt định danh" : "Lưu thay đổi"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Footer Support */}
      <footer className="pt-24 flex justify-between items-center opacity-30 border-t border-white/5">
         <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.5em]">Identity Control Protocol v9.2</p>
         <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest">
            <span className="text-slate-400">Audit Log</span>
            <span className="text-slate-400 mr-4">Security Policy</span>
         </div>
      </footer>
    </div>
  );
};

export default AdminUsers;
