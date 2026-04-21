"use client";
import React, { useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Ticket,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  Save,
  Loader2,
  Calendar,
  AlertCircle,
  Percent,
  Truck,
  Power
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { toast } from "sonner";

const AdminVouchers = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<any>({
    code: "",
    type: "DISCOUNT",
    discountAmount: 0,
    minOrderValue: 0,
    usageLimit: 100,
    expirationDate: new Date().toISOString().split('T')[0],
    active: true
  });

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ['admin-vouchers'],
    queryFn: shopService.adminGetAllVouchers
  });

  const createMutation = useMutation({
    mutationFn: shopService.adminCreateVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success("Đã tạo mã khuyến mãi thành công!");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data || "Lỗi khi tạo mã!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => shopService.adminUpdateVoucher(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success("Đã cập nhật mã khuyến mãi!");
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: shopService.adminDeleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success("Đã xóa mã khuyến mãi!");
    }
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentVoucher({
      code: "",
      type: "DISCOUNT",
      discountAmount: 0,
      minOrderValue: 0,
      usageLimit: 100,
      expirationDate: new Date().toISOString().split('T')[0],
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: any) => {
    setIsEditing(true);
    setCurrentVoucher({ ...v });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!currentVoucher.code) return toast.error("Vui lòng nhập mã!");
    if (isEditing) {
      updateMutation.mutate(currentVoucher);
    } else {
      createMutation.mutate(currentVoucher);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa mã này không?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-12 space-y-12 bg-gradient-to-b from-[#0b1326] to-[#0f172a] animate-in fade-in duration-700 min-h-screen">
      {/* Header Section */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[#e9c349] font-headline tracking-widest text-xs uppercase mb-2">Hệ thống ưu đãi</p>
          <h1 className="font-headline text-5xl font-black tracking-tighter text-white uppercase mb-2">Quản lý Voucher</h1>
          <div className="flex items-center gap-3">
            <p className="text-slate-500 font-body text-sm">Thiết lập và quản lý các chiến dịch khuyến mãi của Phuoc Techno.</p>
            <span className="px-3 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-bold tracking-widest uppercase border border-amber-400/20 shadow-[0_0_10px_rgba(233,195,73,0.1)]">Campaign Manager</span>
          </div>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-[#e9c349] text-[#0b1326] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-2xl shadow-[#e9c349]/10"
        >
          <Plus size={18} />
          Tạo mã mới
        </button>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#131b2e] rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
           <Ticket size={40} className="absolute -right-4 -top-4 text-white/5 rotate-12 group-hover:text-[#e9c349]/10 transition-all duration-500" />
           <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3">Tổng số mã</p>
           <h3 className="text-4xl font-headline font-black text-white italic">{vouchers.length}</h3>
        </div>
        <div className="bg-[#131b2e] rounded-2xl p-8 border border-white/5 shadow-2xl">
           <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3">Đang hoạt động</p>
           <h3 className="text-4xl font-headline font-black text-emerald-400 italic">
             {vouchers.filter((v: any) => v.active).length}
           </h3>
        </div>
        <div className="bg-[#131b2e] rounded-2xl p-8 border border-white/5 shadow-2xl group">
           <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3">Lượt dùng quân bình</p>
           <h3 className="text-4xl font-headline font-black text-blue-400 italic">
             {vouchers.length > 0 ? (vouchers.reduce((acc: number, v: any) => acc + v.usedCount, 0) / vouchers.length).toFixed(1) : "0"}
           </h3>
        </div>
        <div className="bg-[#131b2e] rounded-2xl p-8 border border-white/5 shadow-2xl">
           <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3">Đã hết lượt</p>
           <h3 className="text-4xl font-headline font-black text-rose-500 italic">
             {vouchers.filter((v: any) => v.usedCount >= v.usageLimit).length}
           </h3>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-[#131b2e] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#171f33]/50 text-slate-500 font-label text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5">
              <th className="py-8 px-10">Mã Voucher</th>
              <th className="py-8 px-10">Loại</th>
              <th className="py-8 px-10">Giá trị / Đơn tối thiểu</th>
              <th className="py-8 px-10">Sử dụng (Đã dùng / Tổng)</th>
              <th className="py-8 px-10">Hết hạn</th>
              <th className="py-8 px-10">Trạng thái</th>
              <th className="py-8 px-10 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
               <tr>
                 <td colSpan={7} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-[#e9c349] animate-spin mx-auto mb-4" />
                    <p className="text-xs uppercase font-black text-slate-500 tracking-widest">Đang tải dữ liệu chiến dịch...</p>
                 </td>
               </tr>
            ) : vouchers.length === 0 ? (
               <tr>
                 <td colSpan={7} className="py-32 text-center text-slate-500">Chưa có mã khuyến mãi nào được tạo.</td>
               </tr>
            ) : vouchers.map((v: any) => (
              <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-8 px-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0b1326] flex items-center justify-center text-[#e9c349] border border-white/10 shadow-lg">
                      {v.type === 'DISCOUNT' ? <Percent size={18} /> : <Truck size={18} />}
                    </div>
                    <span className="font-mono text-lg font-black text-white group-hover:text-[#e9c349] transition-colors">{v.code}</span>
                  </div>
                </td>
                <td className="py-8 px-10">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${v.type === 'DISCOUNT' ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20' : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'}`}>
                    {v.type === 'DISCOUNT' ? 'Giảm tiền' : 'Freeship'}
                  </span>
                </td>
                <td className="py-8 px-10">
                  <p className="font-black text-white text-base">-{v.discountAmount.toLocaleString()}đ</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-wider">Cho đơn từ {v.minOrderValue.toLocaleString()}đ</p>
                </td>
                <td className="py-8 px-10">
                  <div className="w-full max-w-[120px] space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-[#e9c349]">{v.usedCount}</span>
                      <span className="text-slate-500">/ {v.usageLimit}</span>
                    </div>
                    <div className="h-1 w-full bg-[#0b1326] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#e9c349] rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(100, (v.usedCount / v.usageLimit) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="py-8 px-10">
                  <span className="text-xs font-bold text-slate-400">{new Date(v.expirationDate).toLocaleDateString('vi-VN')}</span>
                </td>
                <td className="py-8 px-10">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${v.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${v.active ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {v.active ? 'Đang chạy' : 'Dừng'}
                    </span>
                  </div>
                </td>
                <td className="py-8 px-10 text-right">
                  <div className="flex justify-end gap-2 px-6">
                    <button onClick={() => handleOpenEdit(v)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-[#e9c349] hover:bg-[#e9c349]/10 transition-all">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050816]/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#131b2e] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-4xl overflow-hidden animate-in zoom-in-95 duration-500">
            <header className="p-10 border-b border-white/5 bg-[#171f33] flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-headline font-black text-white italic uppercase tracking-tight">
                  {isEditing ? "Cập nhật Voucher" : "Tạo Voucher mới"}
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold mt-2">Phuoc Techno Campaign Protocol</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 rounded-full bg-[#0b1326] text-slate-500 hover:text-rose-500 transition-all hover:rotate-90">
                <X size={24} />
              </button>
            </header>

            <div className="p-12 space-y-10">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mã khuyến mãi</label>
                    <input 
                      className="w-full bg-[#0b1326] border-none rounded-2xl px-6 py-4 text-white font-mono text-lg focus:ring-1 focus:ring-[#e9c349]/50 transition-all placeholder:text-slate-800 italic"
                      placeholder="VD: PHUOC2026"
                      value={currentVoucher.code}
                      onChange={(e) => setCurrentVoucher({...currentVoucher, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Loại voucher</label>
                    <select 
                      className="w-full bg-[#0b1326] border-none rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/50 transition-all appearance-none cursor-pointer italic font-bold"
                      value={currentVoucher.type}
                      onChange={(e) => setCurrentVoucher({...currentVoucher, type: e.target.value})}
                    >
                      <option value="DISCOUNT">GIẢM TIỀN MẶT</option>
                      <option value="FREESHIP">MIỄN PHÍ VẬN CHUYỂN</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Giá trị giảm (đ)</label>
                    <input 
                      type="number"
                      className="w-full bg-[#0b1326] border-none rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/50 transition-all"
                      value={currentVoucher.discountAmount}
                      onChange={(e) => setCurrentVoucher({...currentVoucher, discountAmount: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Đơn hàng tối thiểu (đ)</label>
                    <input 
                      type="number"
                      className="w-full bg-[#0b1326] border-none rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/50 transition-all"
                      value={currentVoucher.minOrderValue}
                      onChange={(e) => setCurrentVoucher({...currentVoucher, minOrderValue: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Giới hạn sử dụng</label>
                    <input 
                      type="number"
                      className="w-full bg-[#0b1326] border-none rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/50 transition-all"
                      value={currentVoucher.usageLimit}
                      onChange={(e) => setCurrentVoucher({...currentVoucher, usageLimit: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Ngày hết hạn</label>
                    <div className="relative">
                      <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input 
                        type="date"
                        className="w-full bg-[#0b1326] border-none rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-[#e9c349]/50 transition-all"
                        value={currentVoucher.expirationDate}
                        onChange={(e) => setCurrentVoucher({...currentVoucher, expirationDate: e.target.value})}
                      />
                    </div>
                  </div>
               </div>

               <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <Power className={`${currentVoucher.active ? 'text-emerald-400' : 'text-slate-600'} transition-colors`} size={20} />
                    <div>
                      <p className="text-white font-bold text-xs">Trạng thái phát hành</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Nhấn để kích hoạt hoặc tạm dừng</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCurrentVoucher({...currentVoucher, active: !currentVoucher.active})}
                    className={`w-14 h-7 rounded-full relative transition-all duration-500 ${currentVoucher.active ? 'bg-[#e9c349]' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 ${currentVoucher.active ? 'right-1' : 'left-1'}`}></div>
                  </button>
               </div>
            </div>

            <footer className="p-10 border-t border-white/5 bg-[#171f33]/30 flex justify-end gap-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 rounded-xl text-slate-500 font-bold text-xs uppercase hover:text-white transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#e9c349] text-[#0b1326] px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {isEditing ? "Lưu thay đổi" : "Kích hoạt Voucher"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVouchers;
