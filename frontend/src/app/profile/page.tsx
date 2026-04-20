"use client";
import React, { useState } from "react";
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
  BadgeCheck,
  X,
  Save,
  Loader2,
  ChevronDown
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const UserProfile = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => authService.getProfile(user!.id as string | number),
    enabled: !!user?.id
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => authService.updateProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Cập nhật hồ sơ thành công!");
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      console.error("Profile Update Error:", err);
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật hồ sơ.");
    }
  });

  const userDetails = profile?.userDetails || {};
  const firstName = userDetails.firstName || "Chưa có";
  const lastName = userDetails.lastName || "Tên";
  const email = userDetails.email || profile?.userName || "No email";
  const phone = userDetails.phoneNumber || "Chưa cập nhật";

  // Địa chỉ
  const country = userDetails.country || "Chưa có";
  const locality = userDetails.locality || "Chưa có";
  const district = userDetails.district || "Chưa cập nhật";
  const ward = userDetails.ward || "Chưa cập nhật";

  const street = userDetails.street || "Chưa cập nhật";
  const streetNumber = userDetails.streetNumber || "Chưa có";

  // State for Administrative Units (Vietnam)
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Fetch Provinces on Load
  React.useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Error fetching provinces:", err));
  }, []);

  const handleOpenEdit = () => {
    setFormData({
      userName: profile?.userName,
      active: profile?.active,
      userDetails: {
        firstName: userDetails.firstName || "",
        lastName: userDetails.lastName || "",
        email: userDetails.email || "",
        phoneNumber: userDetails.phoneNumber || "",
        country: userDetails.country || "Việt Nam",
        locality: userDetails.locality || "",
        district: userDetails.district || "",
        ward: userDetails.ward || "",
        street: userDetails.street || "",
        streetNumber: userDetails.streetNumber || "",
      }
    });
    setIsEditModalOpen(true);
  };

  // Sync Districts when locality (Province) changes
  const handleProvinceChange = async (provinceName: string) => {
    const province = provinces.find(p => p.name === provinceName);
    setFormData({
      ...formData,
      userDetails: {
        ...formData.userDetails,
        locality: provinceName,
        district: "",
        ward: ""
      }
    });
    setWards([]);

    if (province) {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    } else {
      setDistricts([]);
    }
  };

  // Sync Wards when district changes
  const handleDistrictChange = async (districtName: string) => {
    const district = districts.find(d => d.name === districtName);
    setFormData({
      ...formData,
      userDetails: {
        ...formData.userDetails,
        district: districtName,
        ward: ""
      }
    });

    if (district) {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`);
        const data = await res.json();
        setWards(data.wards || []);
      } catch (err) {
        console.error("Error fetching wards:", err);
      }
    } else {
      setWards([]);
    }
  };

  const handleSave = async () => {
    try {
      console.log("Preparing to sync profile identity...", formData);

      // Đảm bảo có ID trong payload để Backend dễ xử lý (mặc dù ID đã có trên URL)
      const payload = {
        ...formData,
        id: user?.id
      };

      await updateMutation.mutateAsync(payload);
      console.log("Profile identity synced successfully.");
    } catch (error) {
      console.error("Critical failure during profile sync:", error);
    }
  };

  if (isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-[#e9c349] font-bold">Đang tải dữ liệu hồ sơ...</div>;
  }

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
              <span className="px-5 py-2 rounded-full bg-linear-to-br from-[#171f33] to-[#0f172a] text-[10px] font-black tracking-widest text-[#e9c349] uppercase border border-white/10 shadow-lg">#USR-{profile?.id || "..."}</span>
              <span className="flex items-center gap-2 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                <BadgeCheck size={16} /> Tài khoản xác thực
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenEdit}
          className="relative z-10 px-10 py-4 bg-linear-to-br from-[#dae2fd] to-[#bec6e0] text-[#0b1326] font-black rounded-2xl shadow-2xl hover:scale-[1.05] transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center gap-2"
        >
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
                <div className="text-xl font-bold text-white uppercase tracking-tighter">{country}</div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Khu vực / Thành phố</label>
                <div className="text-xl font-bold text-white italic">{locality}</div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quận / Huyện</label>
                <div className="text-xl font-bold text-white italic">{district}</div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phường / Xã</label>
                <div className="text-xl font-bold text-white italic">{ward}</div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tên đường</label>
                <div className="text-xl font-bold text-white truncate italic">{street}</div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Số nhà / Căn hộ</label>
                <div className="text-xl font-bold text-white italic">{streetNumber}</div>
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
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#050816]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#131b2e] w-full max-w-4xl rounded-4xl border border-white/10 shadow-4xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-[#171f33] to-[#131b2e]">
              <div>
                <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight italic">Cập nhật hồ sơ</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Quý khách chỉ có thể thay đổi thông tin của chính mình</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-3 rounded-full hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all border border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cá nhân */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-[#e9c349] uppercase tracking-widest border-b border-[#e9c349]/20 pb-2">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Họ</label>
                      <input
                        value={formData.userDetails.firstName}
                        onChange={(e) => setFormData({ ...formData, userDetails: { ...formData.userDetails, firstName: e.target.value } })}
                        className="w-full bg-[#0b1326] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tên</label>
                      <input
                        value={formData.userDetails.lastName}
                        onChange={(e) => setFormData({ ...formData, userDetails: { ...formData.userDetails, lastName: e.target.value } })}
                        className="w-full bg-[#0b1326] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                    <input
                      value={formData.userDetails.email}
                      onChange={(e) => setFormData({ ...formData, userDetails: { ...formData.userDetails, email: e.target.value } })}
                      className="w-full bg-[#0b1326] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Số điện thoại</label>
                    <input
                      value={formData.userDetails.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, userDetails: { ...formData.userDetails, phoneNumber: e.target.value } })}
                      className="w-full bg-[#0b1326] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none"
                    />
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-[#e9c349] uppercase tracking-widest border-b border-[#e9c349]/20 pb-2">Địa chỉ thường trú</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Quốc gia</label>
                      <div className="relative">
                        <select
                          value={formData.userDetails.country}
                          onChange={(e) => setFormData({ ...formData, userDetails: { ...formData.userDetails, country: e.target.value } })}
                          className="w-full bg-[#0b1326] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none appearance-none"
                        >
                          <option value="Việt Nam">Việt Nam</option>
                          <option value="Other">Khác</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tỉnh / Thành phố</label>
                      <div className="relative">
                        <select
                          value={formData.userDetails.locality}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          className="w-full bg-[#0b1326] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none appearance-none"
                        >
                          <option value="">-- Chọn Tỉnh --</option>
                          {provinces.map(p => (
                            <option key={p.code} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Quận / Huyện</label>
                      <div className="relative">
                        <select
                          value={formData.userDetails.district}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          disabled={!formData.userDetails.locality}
                          className="w-full bg-[#0b1326] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none appearance-none disabled:opacity-50"
                        >
                          <option value="">-- Chọn Quận --</option>
                          {districts.map(d => (
                            <option key={d.code} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Phường / Xã</label>
                      <div className="relative">
                        <select
                          value={formData.userDetails.ward}
                          onChange={(e) => setFormData({ ...formData, userDetails: { ...formData.userDetails, ward: e.target.value } })}
                          disabled={!formData.userDetails.district}
                          className="w-full bg-[#0b1326] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none appearance-none disabled:opacity-50"
                        >
                          <option value="">-- Chọn Phường --</option>
                          {wards.map(w => (
                            <option key={w.code} value={w.name}>{w.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tên đường</label>
                      <input
                        value={formData.userDetails.street}
                        onChange={(e) => setFormData({ ...formData, userDetails: { ...formData.userDetails, street: e.target.value } })}
                        placeholder="Ví dụ: Lê Lợi"
                        className="w-full bg-[#0b1326] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Số nhà</label>
                      <input
                        value={formData.userDetails.streetNumber}
                        onChange={(e) => setFormData({ ...formData, userDetails: { ...formData.userDetails, streetNumber: e.target.value } })}
                        placeholder="123/A"
                        className="w-full bg-[#0b1326] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-[#171f33]/30 flex justify-end gap-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-8 py-3 rounded-xl text-slate-500 font-bold text-xs uppercase hover:text-white transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-10 py-3 bg-[#e9c349] text-[#0b1326] rounded-xl font-black text-xs uppercase shadow-xl shadow-[#e9c349]/10 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {updateMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Xác nhận thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
