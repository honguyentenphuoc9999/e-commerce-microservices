"use client";

import React from "react";
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Phone, 
  Calendar, 
  User, 
  Shield, 
  ShoppingBag,
  ExternalLink,
  Loader2,
  Clock,
  Map
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const UserDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: userId } = React.use(params);
  const { token } = useAuthStore();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["adminUser", userId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8900/api/admin-bff/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!userId && !!token
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#e9c349] animate-spin" />
          <p className="text-slate-400 font-label uppercase tracking-widest text-xs animate-pulse">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#0b1326] p-12">
        <div className="max-w-4xl mx-auto bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center text-rose-400">
           Lỗi khi tải thông tin người dùng. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-12">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 mb-2">
            <Link href="/admin/users" className="text-[10px] uppercase tracking-widest text-slate-500 font-label hover:text-white transition-colors">Quản lý người dùng</Link>
            <span className="text-[10px] text-slate-500">/</span>
            <span className="text-[10px] uppercase tracking-widest text-[#e9c349] font-label">Chi tiết hồ sơ</span>
          </nav>
          <div className="flex items-center gap-6">
            <Link href="/admin/users" className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-5xl font-black font-headline tracking-tighter text-white uppercase">Hồ sơ: {user.userName}</h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#131b2e] rounded-3xl border border-white/5 shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e9c349] to-transparent opacity-50"></div>
            
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#222a3d] to-[#131b2e] border-4 border-white/5 p-1 mb-6 mt-4 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#131b2e] flex items-center justify-center text-4xl font-headline font-black text-[#e9c349] border border-white/10">
                {user.userName?.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{user.userName}</h2>
            <div className="px-4 py-1.5 bg-[#e9c349]/10 rounded-full border border-[#e9c349]/20 flex items-center gap-2 mb-8">
              <Shield size={14} className="text-[#e9c349]" />
              <span className="text-[10px] font-bold text-[#e9c349] uppercase tracking-widest">Khách hàng đặc biệt</span>
            </div>

            <div className="w-full space-y-6 pt-8 border-t border-white/5">
               <div className="flex items-center gap-4 text-left">
                  <span className="p-3 bg-white/5 rounded-xl text-slate-500"><Mail size={18} /></span>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Địa chỉ Email</p>
                    <p className="text-sm font-medium text-slate-300">{user.email || 'N/A'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 text-left">
                  <span className="p-3 bg-white/5 rounded-xl text-slate-500"><Phone size={18} /></span>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Số điện thoại</p>
                    <p className="text-sm font-medium text-slate-300">{user.phoneNumber || 'N/A'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 text-left">
                  <span className="p-3 bg-white/5 rounded-xl text-slate-500"><User size={18} /></span>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Họ và Tên</p>
                    <p className="text-sm font-medium text-slate-300">{(user.firstName || '') + ' ' + (user.lastName || '') || user.userName}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Address & Activity */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-[#131b2e] rounded-3xl border border-white/5 shadow-2xl p-10 space-y-10 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 text-white/5 pointer-events-none rotate-12">
                <MapPin size={240} />
             </div>
             
             <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="p-3 bg-[#e9c349]/10 rounded-2xl text-[#e9c349] border border-[#e9c349]/20">
                  <MapPin size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white font-headline">Thông tin địa chỉ</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Số nhà & Tên đường</p>
                      <p className="text-white font-semibold flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#e9c349] shadow-[0_0_10px_#e9c349]"></span>
                        {user.streetNumber} {user.street}
                      </p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Xã / Phường</p>
                      <p className="text-white font-semibold italic">{user.ward}</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Quận / Huyện</p>
                      <p className="text-white font-semibold">{user.district}</p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Tỉnh / Thành phố</p>
                      <p className="text-white font-semibold">{user.locality}</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Quốc gia</p>
                      <p className="text-white font-semibold uppercase tracking-widest">{user.country || 'Việt Nam'}</p>
                   </div>
                </div>
             </div>
           </div>

           {/* Quick Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#171f33] rounded-2xl p-6 border border-white/5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                    <ShoppingBag size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Đơn hàng</p>
                    <p className="text-xl font-headline font-bold text-white tracking-tighter">--</p>
                 </div>
              </div>
              <div className="bg-[#171f33] rounded-2xl p-6 border border-white/5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                    <Shield size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Trạng thái</p>
                    <p className="text-xl font-headline font-bold text-emerald-400 tracking-tighter">Hoạt động</p>
                 </div>
              </div>
              <div className="bg-[#171f33] rounded-2xl p-6 border border-white/5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold border border-amber-500/20">
                    <Clock size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vai trò</p>
                    <p className="text-xl font-headline font-bold text-white tracking-tighter">USER</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
