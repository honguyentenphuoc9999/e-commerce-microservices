"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Edit, 
  ChevronRight,
  Map,
  BadgeCheck
} from "lucide-react";

const UserProfile = () => {
  const { user } = useAuthStore();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => authService.getProfile(user!.id as string | number),
    enabled: !!user?.id
  });

  if (isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-[#e9c349] font-bold">Đang tải dữ liệu hồ sơ...</div>;
  }

  const userDetails = profile?.userDetails || {};
  const firstName = userDetails.firstName || "Chưa có";
  const lastName = userDetails.lastName || "Tên";
  const email = userDetails.email || profile?.userName + "@domain.com";
  const phone = userDetails.phoneNumber || userDetails.phone || "Chưa cập nhật";

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Header Profile Info */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 bg-[#131b2e]/40 p-12 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
           <User size={180} className="text-[#e9c349]" />
        </div>
        
        <div className="flex items-center gap-10 relative z-10">
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#e9c349] to-transparent rounded-full opacity-30 blur-lg transition-opacity group-hover:opacity-50"></div>
            <img 
              alt="User" 
              className="relative w-40 h-40 rounded-full object-cover border-4 border-[#171f33] shadow-2xl transition-all duration-700 hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCItJ_G9tExt3Tq-AQ5HEgX4JiUKsrSfnj68K_cXK3lEpu5nJXxA__7jUbZwW8aN9zQoCnxZBtK2QSKLqiKbrhNzQDp023Vumk4a_MYmw7tz7hD7TZWIJ1aw8tReRNCUjwwu4MnXQWgM29u1ojpoay54H-5DJb8R09I5GRYaOBi1WY710t8wLI1NiJFUmPlXcdEWZ15bdfFSixwIymzeXDKNnvamrj2ltNd2XD0h9qYjPKObXfLsVnK7dVKHQH19za3bdEhH2Ch1w"
            />
          </div>
          <div className="space-y-4">
            <h1 className="font-headline text-6xl font-black tracking-tighter text-white transition-colors group-hover:text-[#e9c349] max-w-[30rem] truncate">{firstName} {lastName}</h1>
            <p className="text-slate-400 font-medium text-lg italic">{email}</p>
            <div className="flex items-center gap-4">
              <span className="px-5 py-2 rounded-full bg-linear-to-br from-[#171f33] to-[#0f172a] text-[10px] font-black tracking-widest text-[#e9c349] uppercase border border-white/10 shadow-lg">#USR-88219</span>
              <span className="flex items-center gap-2 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                <BadgeCheck size={16} /> Tài khoản xác thực
              </span>
            </div>
          </div>
        </div>
        
        <button className="relative z-10 px-10 py-4 bg-linear-to-br from-[#dae2fd] to-[#bec6e0] text-[#0b1326] font-black rounded-2xl shadow-2xl hover:scale-[1.05] transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center gap-2">
          <Edit size={16} />
          Chỉnh sửa hồ sơ
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Info Section */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="font-headline text-2xl font-bold text-white flex items-center gap-4 italic">
            <User className="text-[#e9c349]" />
            Thông tin cá nhân
          </h2>
          <div className="bg-[#131b2e]/40 rounded-[2rem] p-12 border border-white/5 backdrop-blur-xl shadow-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-3 p-4 rounded-2xl hover:bg-white/5 transition-all">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Họ</label>
              <div className="text-xl font-bold text-white italic truncate">{firstName}</div>
            </div>
            <div className="space-y-3 p-4 rounded-2xl hover:bg-white/5 transition-all">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tên</label>
              <div className="text-xl font-bold text-white italic truncate">{lastName}</div>
            </div>
            <div className="space-y-3 p-4 rounded-2xl hover:bg-white/5 transition-all">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email</label>
              <div className="text-xl font-bold text-white truncate italic">{email}</div>
            </div>
            <div className="space-y-3 p-4 rounded-2xl hover:bg-white/5 transition-all">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Số điện thoại</label>
              <div className="text-xl font-bold text-white italic">{phone}</div>
            </div>
          </div>
        </div>

        {/* Address Info Section */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="font-headline text-2xl font-bold text-white flex items-center gap-4 italic text-right justify-end md:justify-start">
            <MapPin className="text-[#e9c349]" />
            Thông tin địa chỉ
          </h2>
          <div className="relative overflow-hidden bg-[#131b2e]/40 rounded-[2rem] p-12 border border-white/5 backdrop-blur-xl shadow-2xl">
            {/* Subtle Background Graphic */}
            <div className="absolute -right-24 -bottom-24 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Map size={320} className="text-white" />
            </div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quốc gia</label>
                <div className="text-xl font-bold text-white">Việt Nam</div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Khu vực / Thành phố</label>
                <div className="text-xl font-bold text-white">Hồ Chí Minh</div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mã bưu điện</label>
                <div className="text-xl font-bold text-white">700000</div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tên đường</label>
                <div className="text-xl font-bold text-white">Lê Lợi, Bến Nghé</div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Số nhà</label>
                <div className="text-xl font-bold text-white italic">Tòa nhà Bitexco, Tầng 42</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security / Aesthetic Placeholders */}
        <div className="lg:col-span-1 bg-[#131b2e]/40 rounded-[2rem] p-12 border border-white/5 backdrop-blur-xl shadow-2xl flex flex-col justify-center text-center group hover:border-[#e9c349]/20 transition-all">
          <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-[#171f33] flex items-center justify-center text-[#e9c349] group-hover:scale-110 transition-transform shadow-xl">
             <ShieldCheck size={40} className="group-hover:animate-pulse" />
          </div>
          <h3 className="font-headline font-black text-2xl text-white mb-3 italic">Bảo mật</h3>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">Bảo mật hai lớp đã được thiết lập để bảo vệ tài khoản obsidian của quý khách.</p>
        </div>
        
        <div className="lg:col-span-2 relative h-full min-h-[300px] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group cursor-pointer group">
          <img 
            alt="Abstract" 
            className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-110" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWo_HawLM4NL4Pzs3x2H4DbpJIsnjJYzjEFzfDRLweEnCkk7jduH6SIOD0ykcF2Ha25sFSnq5IBi_xIlFWBFVR6UBJAYHsu9LzycDr_ObEDhNRbzlGPS9UUnkZAW63XYVNaIpjHzKAVW7BqqmaK62jqQVPRJg2wJZ1drLFYUReTc7ZQYPBKa9vEIp3VWTlKOkDfm0SUW9P3pwytE2nFyx6fRpqtlfRIHEqmWgHMvvpd44j_wjQTZaMcGgI266UmZd3OIyLJO_bog"
          />
          <div className="absolute inset-x-12 bottom-12 p-0 flex justify-between items-end">
             <div className="space-y-2">
                <p className="text-[10px] font-black tracking-widest text-[#e9c349] uppercase">Đặc quyền Artisan</p>
                <h3 className="text-3xl font-headline font-black text-white italic">Khám phá bộ sưu tập Private</h3>
             </div>
             <div className="bg-[#e9c349] p-4 rounded-full text-[#0b1326] shadow-xl group-hover:translate-x-2 transition-transform">
                <ChevronRight size={24} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
