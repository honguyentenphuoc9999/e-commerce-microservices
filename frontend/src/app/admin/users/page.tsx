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
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";

const AdminUsers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // State cho form chỉnh sửa - ĐÃ LOẠI BỎ TIER
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roleId: 1, // Mặc định 1 là Người dùng
    active: 1
  });

  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getUsers
  });

  const allUsers = Array.isArray(usersData) ? usersData.map((u: any) => ({
    id: `#USR-${u.id}`,
    name: u.userName,
    email: u.userDetails?.email || "No email",
    date: u.userDetails?.firstName ? `${u.userDetails.firstName} ${u.userDetails.lastName}` : "Chưa cập nhật",
    role: u.role?.roleName || "ROLE_USER",
    // Logic chuẩn: ID 2 là Admin, ID 1 là User
    roleLabel: u.role?.id === 2 || u.role?.roleName === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Người dùng',
    roleColor: u.role?.id === 2 || u.role?.roleName === 'ROLE_ADMIN' ? 'text-amber-400' : 'text-slate-400',
    status: u.active === 1 ? "Hoạt động" : "Ngừng hoạt động",
    statusColor: u.active === 1 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-rose-400 bg-rose-400/10 border-rose-400/20",
    image: `https://ui-avatars.com/api/?name=${u.userName}&background=random`,
    rawRole: u.role
  })) : [];

  const customers = allUsers.filter(u => u.role === 'ROLE_USER' || u.roleLabel === 'Người dùng');

  const handleOpenModal = (type: "add" | "edit", user?: any) => {
    setModalType(type);
    setSelectedUser(user || null);

    if (user) {
      console.log("Editing user:", user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        // Lấy ID thật từ Database
        roleId: user.rawRole?.id || (user.role === 'ROLE_ADMIN' ? 2 : 1),
        active: user.status === 'Hoạt động' ? 1 : 0
      });
    } else {
      setFormData({
        name: "",
        email: "",
        roleId: 1,
        active: 1
      });
    }

    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser && modalType === "edit") return;
    setIsSaving(true);
    try {
      if (modalType === "edit") {
        const userId = selectedUser.id.replace('#USR-', '');
        await adminService.updateUser(userId, {
          userName: formData.name,
          role: { id: formData.roleId },
          active: formData.active
        });
        alert("Cập nhật thành công!");
      }
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Có lỗi xảy ra khi lưu thay đổi.");
    } finally {
      setIsSaving(false);
    }
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
          <h1 className="text-5xl font-black font-headline tracking-tighter text-white uppercase">danh sách khách hàng</h1>
          <p className="text-slate-400 mt-2 max-w-xl font-body text-sm">Theo dõi hoạt động, quản lý thông tin và hỗ trợ người dùng đã tham gia hệ sinh thái kỹ thuật số.</p>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-full border border-white/5 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <div className="text-3xl font-black font-headline tracking-tighter text-white">{customers.length}</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Tổng khách hàng</div>
          </div>
        </div>
        <div className="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-full border border-white/5 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-3xl font-black font-headline tracking-tighter text-white">
              {customers.filter(u => u.status === 'Hoạt động').length}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Đang hoạt động</div>
          </div>
        </div>
        <div className="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-full border border-white/5 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-rose-400/10 flex items-center justify-center text-rose-400">
            <Lock size={24} />
          </div>
          <div>
            <div className="text-3xl font-black font-headline tracking-tighter text-white">
              {customers.filter(u => u.status !== 'Hoạt động').length}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Tài khoản bị khóa</div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
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
        </div>
      </section>

      <section>
        <div className="bg-[#131b2e] rounded-3xl overflow-hidden border border-white/5 shadow-3xl bg-linear-to-b from-[#131b2e] to-[#0b1326]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#171f33]/30 text-slate-500 uppercase text-[10px] tracking-[0.2em] font-black border-b border-white/5">
                <th className="px-10 py-6">Danh tính người dùng</th>
                <th className="px-10 py-6 text-center">Vai trò</th>
                <th className="px-10 py-6">Ngày gia nhập</th>
                <th className="px-10 py-6 text-center">Trạng thái</th>
                <th className="px-10 py-6 text-right font-black tracking-widest opacity-0">...</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="w-8 h-8 border-4 border-[#e9c349] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-slate-500 mt-4 tracking-widest uppercase font-black">Syncing digital identities...</p>
                  </td>
                </tr>
              ) : (
                customers.map((user) => (
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
                    <td className="px-10 py-8 text-center text-xs font-black uppercase tracking-[0.2em] transition-colors">
                      <span className={user.roleColor}>{user.roleLabel}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-sm font-bold text-slate-300">{user.date}</div>
                      <div className="text-[10px] uppercase tracking-widest text-[#e9c349] mt-1.5 font-bold">Identity Active</div>
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
                        <button className="p-3 bg-[#222a3d] rounded-xl text-slate-400 hover:text-rose-400 transition-all border border-white/5 shadow-2xl group-hover:scale-105">
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
      </section>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0b1326]/60 backdrop-blur-xl animate-in fade-in duration-300">
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@atelier.io"
                      className="w-full bg-[#0b1326] border border-white/5 rounded-2xl py-5 pl-12 pr-6 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Vai trò hệ thống</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                    className="w-full bg-[#0b1326] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all appearance-none font-bold"
                  >
                    <option value={1}>Người dùng (User)</option>
                    <option value={2}>Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Trạng thái tài khoản</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, active: 1 })}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${formData.active === 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/5 text-slate-500 border-white/5'}`}
                    >
                      <ShieldCheck size={14} /> Hoạt động
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, active: 0 })}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${formData.active === 0 ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/5 text-slate-500 border-white/5'}`}
                    >
                      <Lock size={14} /> Khóa tài khoản
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
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="px-14 py-5 bg-[#e9c349] text-[#0b1326] rounded-2xl font-headline font-black text-xs uppercase tracking-widest shadow-4xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 border border-white/10 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-[#0b1326] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={20} />
                )}
                {modalType === "add" ? "Kích hoạt định danh" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

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
