"use client";
import React, { useState } from "react";
import {
  Users,
  Lock,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  ShieldCheck,
  Eye,
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
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roleId: 1,
    active: 1
  });

  const { data: usersPage, isLoading } = useQuery({
    queryKey: ['admin-users', currentPage],
    queryFn: () => adminService.getUsers(currentPage, pageSize)
  });

  const usersData = usersPage?.content || [];
  const totalPages = usersPage?.totalPages || 0;
  const totalElements = usersPage?.totalElements || 0;

  // --- VIP LOGIC FOR LIST ---
  const getVIPInfo = (orders: any[]) => {
    if (!orders) return { rank: "Hạng Đồng", color: "text-orange-400" };
    const totalSpent = orders
      .filter((o: any) => ['DELIVERED', 'COMPLETED', 'SUCCESS'].includes(o.orderStatus?.toUpperCase()))
      .reduce((acc: number, o: any) => acc + (o.total || 0), 0);
    const points = Math.floor(totalSpent / 1000);
    
    if (points >= 100000) return { rank: "Hạng Kim Cương", color: "text-cyan-400" };
    if (points >= 20000) return { rank: "Hạng Vàng", color: "text-amber-400" };
    if (points >= 5000) return { rank: "Hạng Bạc", color: "text-slate-300" };
    return { rank: "Hạng Đồng", color: "text-orange-400" };
  };

  const allUsers = usersData
    .filter((u: any) => u.role?.roleName !== 'ROLE_ADMIN' && u.role?.id !== 2)
    .map((u: any) => {
      const vip = getVIPInfo(u.orders);
      return {
        id: `#USR-${u.id}`,
        dbId: u.id,
        name: u.userDetails?.firstName ? `${u.userDetails.firstName} ${u.userDetails.lastName}` : u.userName,
        username: u.userName,
        email: u.userDetails?.email || "No email",
        vip: vip,
        roleLabel: 'Người dùng',
        roleColor: 'text-slate-400',
        status: u.active === 1 ? "Hoạt động" : "Ngừng hoạt động",
        statusColor: u.active === 1 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-rose-400 bg-rose-400/10 border-rose-400/20",
        image: `https://res.cloudinary.com/de0de4yum/image/upload/v1777141182/phuoctechno_hwcqll.png`,
        rawRole: u.role
      };
    });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 rounded-lg font-black text-[10px] transition-all border ${currentPage === i
            ? "bg-[#e9c349] border-[#e9c349] text-[#131b2e]"
            : "bg-[#171f33] border-white/5 text-slate-500 hover:border-[#e9c349]/40 hover:text-[#e9c349]"
            }`}
        >
          {i + 1}
        </button>
      );
    }
    return pages;
  };

  const handleOpenModal = (type: "add" | "edit", user?: any) => {
    setModalType(type);
    setSelectedUser(user || null);
    if (user) {
      setFormData({
        name: user.username || "",
        email: user.email || "",
        roleId: user.rawRole?.id || 1,
        active: user.status === 'Hoạt động' ? 1 : 0
      });
    } else {
      setFormData({ name: "", email: "", roleId: 1, active: 1 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser && modalType === "edit") return;
    setIsSaving(true);
    try {
      if (modalType === "edit") {
        await adminService.updateUser(selectedUser.dbId, {
          userName: formData.name,
          role: { id: formData.roleId },
          active: formData.active
        });
        alert("Cập nhật thành công!");
      }
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
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
          <p className="text-slate-400 mt-2 max-w-xl font-body text-sm">Theo dõi hoạt động và phân loại đẳng cấp VIP dựa trên chi tiêu thực tế của khách hàng.</p>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-full border border-white/5 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <div className="text-3xl font-black font-headline tracking-tighter text-white">{totalElements}</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Tổng khách hàng</div>
          </div>
        </div>
        <div className="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-full border border-white/5 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-3xl font-black font-headline tracking-tighter text-white">Active</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Đang đồng bộ</div>
          </div>
        </div>
        <div className="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-full border border-white/5 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-rose-400/10 flex items-center justify-center text-rose-400">
            <Lock size={24} />
          </div>
          <div>
            <div className="text-3xl font-black font-headline tracking-tighter text-white">Security</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Quản lý bảo mật</div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-[#131b2e] rounded-3xl overflow-hidden border border-white/5 shadow-3xl bg-linear-to-b from-[#131b2e] to-[#0b1326]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#171f33]/30 text-slate-500 uppercase text-[10px] tracking-[0.2em] font-black border-b border-white/5">
                <th className="px-10 py-6">Danh tính (Họ Tên)</th>
                <th className="px-10 py-6 text-center">Vai trò</th>
                <th className="px-10 py-6">Tên đăng nhập / VIP</th>
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
                allUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.012] transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#e9c349] to-transparent rounded-full opacity-0 group-hover:opacity-30 blur-sm transition-opacity"></div>
                          <img src={user.image} alt={user.name} className="relative w-12 h-12 rounded-full object-cover border-2 border-white/10 group-hover:border-[#e9c349]/40 transition-all shadow-2xl" />
                        </div>
                        <div>
                          <div className="font-black text-white group-hover:text-[#e9c349] transition-colors text-base">{user.name}</div>
                          <div className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-tight">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center text-xs font-black uppercase tracking-[0.2em] transition-colors">
                      <span className={user.roleColor}>{user.roleLabel}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-sm font-bold text-slate-300 italic">{user.username}</div>
                      <div className={`text-[10px] uppercase tracking-widest mt-1.5 font-black flex items-center gap-2 ${user.vip.color}`}>
                        <Shield size={10} /> {user.vip.rank}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner inline-block ${user.statusColor}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <Link
                          href={`/admin/users/${user.dbId}`}
                          className="p-3 bg-[#222a3d] rounded-xl text-slate-400 hover:text-[#e9c349] transition-all border border-white/5 shadow-2xl group-hover:scale-105"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleOpenModal("edit", user)}
                          className="p-3 bg-[#222a3d] rounded-xl text-slate-400 hover:text-[#e9c349] transition-all border border-white/5 shadow-2xl group-hover:scale-105"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="px-10 py-8 bg-[#171f33]/30 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2 bg-[#222a3d] rounded-lg text-slate-400 disabled:opacity-20 hover:text-[#e9c349] transition-all border border-white/5"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-2">{renderPageNumbers()}</div>
                <button
                  disabled={currentPage === totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 bg-[#222a3d] rounded-lg text-slate-400 disabled:opacity-20 hover:text-[#e9c349] transition-all border border-white/5"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                Trang {currentPage + 1} của {totalPages} • {totalElements} người dùng
              </div>
            </div>
          )}
        </div>
      </section>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#02040a]/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#131b2e] w-full max-w-2xl rounded-4xl border border-white/10 shadow-4xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-[#171f33] to-[#131b2e]">
              <div>
                <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight italic">
                  Chỉnh sửa người dùng
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Tên đăng nhập</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0b1326] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Trạng thái tài khoản</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, active: 1 })}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${formData.active === 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/5 text-slate-500 border-white/5'}`}
                    >
                      Hoạt động
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, active: 0 })}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${formData.active === 0 ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/5 text-slate-500 border-white/5'}`}
                    >
                      Khóa
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-white/5 bg-[#171f33]/30 flex justify-end gap-6">
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="px-14 py-5 bg-[#e9c349] text-[#0b1326] rounded-2xl font-headline font-black text-xs uppercase tracking-widest shadow-4xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 border border-white/10 disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
