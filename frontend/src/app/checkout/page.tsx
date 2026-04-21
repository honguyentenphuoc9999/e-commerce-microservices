"use client";
import React, { useState } from "react";
import {
  ShoppingCart,
  User,
  ChevronRight,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Lock,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const CheckoutPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const voucherParam = searchParams.get("vouchers");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  // Mặc định phí ship là 20k
  const [shippingFee, setShippingFee] = useState(20000);
  const [shippingMethod, setShippingMethod] = useState("standard");

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart', user?.id || 'guest'],
    queryFn: shopService.getCart,
    enabled: !!user,
  });

  // Lấy đầy đủ thông tin profile từ DB
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => authService.getProfile(user!.id),
    enabled: !!user?.id,
  });

  // Form state cho thông tin giao hàng
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "Hồ Chí Minh",
    zipCode: "70000",
    phone: ""
  });

  const VN_POSTAL_CODES: Record<string, string> = {
    "An Giang": "90000",
    "Bà Rịa Vũng Tàu": "78000",
    "Bạc Liêu": "97000",
    "Bắc Kạn": "23000",
    "Bắc Giang": "26000",
    "Bắc Ninh": "16000",
    "Bến Tre": "86000",
    "Bình Dương": "75000",
    "Bình Định": "55000",
    "Bình Phước": "67000",
    "Bình Thuận": "77000",
    "Cà Mau": "98000",
    "Cao Bằng": "21000",
    "Cần Thơ": "94000",
    "Đà Nẵng": "50000",
    "Điện Biên": "32000",
    "Đắk Lắk": "63000",
    "Đắk Nông": "65000",
    "Đồng Nai": "76000",
    "Đồng Tháp": "81000",
    "Gia Lai": "61000",
    "Hà Giang": "20000",
    "Hà Nam": "18000",
    "Hà Nội": "10000",
    "Hà Tĩnh": "45000",
    "Hải Dương": "03000",
    "Hải Phòng": "04000",
    "Hậu Giang": "95000",
    "Hòa Bình": "36000",
    "Hồ Chí Minh": "70000",
    "Hưng Yên": "17000",
    "Khánh Hòa": "57000",
    "Kiên Giang": "91000",
    "Kon Tum": "60000",
    "Lai Châu": "30000",
    "Lạng Sơn": "25000",
    "Lào Cai": "31000",
    "Lâm Đồng": "66000",
    "Long An": "82000",
    "Nam Định": "07000",
    "Nghệ An": "43000",
    "Ninh Bình": "08000",
    "Ninh Thuận": "59000",
    "Phú Thọ": "35000",
    "Phú Yên": "56000",
    "Quảng Bình": "47000",
    "Quảng Nam": "51000",
    "Quảng Ngãi": "53000",
    "Quảng Ninh": "01000",
    "Quảng Trị": "48000",
    "Sóc Trăng": "96000",
    "Sơn La": "34000",
    "Tây Ninh": "80000",
    "Thái Bình": "06000",
    "Thái Nguyên": "24000",
    "Thanh Hoá": "40000",
    "Thừa Thiên Huế": "49000",
    "Tiền Giang": "84000",
    "Trà Vinh": "87000",
    "Tuyên Quang": "22000",
    "Vĩnh Long": "85000",
    "Vĩnh Phúc": "15000",
    "Yên Bái": "33000"
  };

  // Tự động cập nhật Zip Code khi Thành phố thay đổi
  useEffect(() => {
    const city = formData.city;
    const foundCode = VN_POSTAL_CODES[city] || VN_POSTAL_CODES[Object.keys(VN_POSTAL_CODES).find(k => city.includes(k)) || ""] || "40000";
    if (formData.zipCode !== foundCode) {
      setFormData(prev => ({ ...prev, zipCode: foundCode }));
    }
  }, [formData.city]);

  // Tự động điền thông tin khi profile load xong
  useEffect(() => {
    if (profile && profile.userDetails) {
      const ud = profile.userDetails;

      // Ghép địa chỉ chi tiết theo thứ tự: Số nhà, Tên đường, Phường/Xã, Quận/Huyện
      const detailedAddress = [
        ud.streetNumber, // Số nhà / Căn hộ
        ud.street,       // Tên đường
        ud.ward,         // Phường / Xã
        ud.district      // Quận / Huyện
      ].filter(Boolean).join(", ");

      const city = ud.locality || "Hồ Chí Minh";
      const initialZip = VN_POSTAL_CODES[city] || "70000";

      setFormData({
        firstName: ud.lastName || "",  // Tên (Khach)
        lastName: ud.firstName || "", // Họ & Tên lót (Nguyen)
        phone: ud.phoneNumber || "",
        city: city,
        zipCode: initialZip,
        address: detailedAddress || ""
      });
    }
  }, [profile]);

  const rawItems = [...(cartData?.items || cartData?.cartItems || (Array.isArray(cartData) ? cartData : []) || [])]
    .sort((a: any, b: any) => (b.addedAt || 0) - (a.addedAt || 0));
    
  const cartItems = rawItems.map((item: any, index: number) => ({
    id: item.id || `item-${item.product?.id || item.productId || index}`,
    productId: item.product?.id || item.productId,
    name: item.product?.productName || item.productName || "Sản phẩm",
    price: item.product?.price || item.price || 0,
    quantity: item.quantity || 1,
    image: item.product?.image || item.image || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800"
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate Summary
  const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  
  // Support multiple vouchers if provided as comma-separated list
  const voucherCodes = voucherParam ? voucherParam.split(',').map(v => v.split(':')[0].trim()) : [];
  
  // We'll use a local query to fetch all applied vouchers info
  const { data: vouchersInfo = [] } = useQuery({
    queryKey: ['validate-vouchers-list', voucherCodes],
    queryFn: async () => {
      const results = await Promise.all(
        voucherCodes.map(code => shopService.validateVoucher(code, subtotal).catch(() => null))
      );
      return results.filter(Boolean);
    },
    enabled: voucherCodes.length > 0 && !!cartData,
  });

  const itemDiscount = vouchersInfo
    .filter((v: any) => v.type === 'DISCOUNT')
    .reduce((acc: number, v: any) => acc + (v.discountAmount || 0), 0);

  const shippingDiscount = vouchersInfo
    .filter((v: any) => v.type === 'FREESHIP')
    .reduce((acc: number, v: any) => acc + (v.discountAmount || 0), 0);

  const taxableAmount = Math.max(0, subtotal - itemDiscount);
  const tax = taxableAmount * 0.08;
  const finalShippingFee = Math.max(0, shippingFee - shippingDiscount);
  const total = taxableAmount + tax + finalShippingFee;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Chưa có user id");
      
      // Làm sạch mã voucher: Nếu có dạng "CODE:1" thì chỉ lấy "CODE"
      // Hoặc nếu có nhiều voucher cách nhau bởi dấu phẩy, làm sạch từng cái
      let cleanVouchers = undefined;
      if (voucherParam) {
        cleanVouchers = voucherParam.split(',').map(v => v.split(':')[0].trim()).join(',');
      }

      const orderRes = await shopService.checkout(user.id, cleanVouchers, shippingMethod, formData.address);

      const orderId = orderRes?.id || orderRes?.orderId || orderRes?.data?.id || orderRes;
      if (!orderId) throw new Error("Không lấy được Order ID");

      const qrRes = await shopService.getVietQrPayment(orderId);
      return qrRes?.paymentUrl || qrRes;
    },
    onSuccess: (url) => {
      setPaymentUrl(typeof url === 'string' ? url : url?.paymentUrl);
      // Xóa cache giỏ hàng để khi quay lại giỏ hàng sẽ trống
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : null) || error.message || "Lỗi thanh toán";
      alert("Thanh toán thất bại: " + msg);
    }
  });

  if (paymentUrl) {
    return (
      <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col items-center justify-center p-8">
        <div className="bg-[#131b2e] p-10 rounded-[2.5rem] flex flex-col items-center max-w-md w-full border border-white/10 shadow-2xl">
          <CheckCircle className="text-emerald-400 w-16 h-16 mb-6" />
          <h2 className="text-2xl font-bold font-headline mb-4">Đơn hàng thành công</h2>
          <p className="text-slate-400 text-center text-sm mb-8">Dùng ứng dụng Ngân hàng (VietQR) quét mã dưới đây để thanh toán.</p>
          <div className="w-full h-80 bg-white rounded-3xl overflow-hidden flex items-center justify-center">
            <img src={paymentUrl} alt="QR Thanh Toán" className="max-w-full max-h-full object-contain p-4" />
          </div>
          <button onClick={() => router.push('/collections')} className="mt-8 w-full py-4 border border-[#e9c349] text-[#e9c349] rounded-xl font-bold hover:bg-[#e9c349] hover:text-[#0b1326] transition-all">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd]">
      {/* Simple Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-[1440px] mx-auto">
          {/* Left: Logo & Status */}
          <div className="flex items-center gap-6">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <img
                src="https://res.cloudinary.com/de0de4yum/image/upload/v1776774968/logo_yc7qyw.png"
                alt="Phuoc Techno Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <div className="hidden md:flex items-center gap-3 text-[#e9c349] font-bold text-[10px] uppercase tracking-widest border-l border-white/10 pl-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e9c349] animate-pulse"></span>
              Thanh toán bảo mật
            </div>
          </div>

          {/* Right: User Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-inner">
              <div className="w-6 h-6 bg-[#e9c349] text-black font-bold rounded-full flex items-center justify-center text-[10px]">
                {user?.userName?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{user?.userName}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-12">
          {/* Progress Indicator */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e9c349] text-[#0b1326] flex items-center justify-center font-black text-xs shadow-lg shadow-[#e9c349]/20">01</div>
              <span className="text-xs font-black tracking-widest uppercase text-white">Giao hàng</span>
            </div>
            <div className="h-px w-10 bg-white/10"></div>
            <div className="flex items-center gap-3 opacity-40">
              <div className="w-10 h-10 rounded-full bg-[#171f33] text-white flex items-center justify-center font-black text-xs border border-white/5">02</div>
              <span className="text-xs font-black tracking-widest uppercase">Thanh toán</span>
            </div>
            <div className="h-px w-10 bg-white/10"></div>
            <div className="flex items-center gap-3 opacity-40">
              <div className="w-10 h-10 rounded-full bg-[#171f33] text-white flex items-center justify-center font-black text-xs border border-white/5">03</div>
              <span className="text-xs font-black tracking-widest uppercase">Hoàn tất</span>
            </div>
          </div>

          {/* Shipping Form Section */}
          <section className="space-y-10 group">
            <header className="space-y-4">
              <h1 className="text-5xl font-headline font-black tracking-tighter text-white italic">Chi tiết vận chuyển</h1>
              <p className="text-slate-500 font-medium text-lg">Cung cấp địa chỉ của quý khách để nhận dịch vụ giao hàng ưu tiên từ Phuoc Techno.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#131b2e]/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Họ & Tên lót</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic"
                  placeholder="VD: Julian"
                  type="text"
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tên</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic"
                  placeholder="VD: Voss"
                  type="text"
                  suppressHydrationWarning
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Địa chỉ chi tiết</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic"
                  placeholder="Số nhà, tên đường, khu phố..."
                  type="text"
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Thành phố</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic"
                  placeholder="Hồ Chí Minh"
                  type="text"
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mã bưu điện</label>
                <input
                  name="zipCode"
                  value={formData.zipCode}
                  readOnly
                  className="w-full bg-[#131b2e] border-none rounded-2xl px-8 py-5 text-[#e9c349] font-bold italic cursor-not-allowed opacity-80"
                  placeholder="70000"
                  type="text"
                  suppressHydrationWarning
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Số điện thoại liên hệ</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic"
                  placeholder="+84 XXX XXX XXX"
                  type="tel"
                  suppressHydrationWarning
                />
              </div>
            </div>
          </section>

          {/* Shipping Methods */}
          <section className="space-y-8">
            <h2 className="text-2xl font-headline font-bold text-white italic">Phương thức vận chuyển</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => { setShippingMethod('express'); setShippingFee(50000); }}
                className={`p-8 bg-[#131b2e] border-2 rounded-[2rem] flex justify-between items-center group cursor-pointer transition-all relative overflow-hidden ${shippingMethod === 'express' ? 'border-[#e9c349] shadow-2xl shadow-[#e9c349]/5' : 'border-white/5 opacity-60'}`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <Truck size={80} className="text-[#e9c349]" />
                </div>
                <div className="relative z-10 flex gap-5 items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'express' ? 'border-[#e9c349]' : 'border-white/10'}`}>
                    {shippingMethod === 'express' && <div className="w-3 h-3 rounded-full bg-[#e9c349]"></div>}
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-1">Giao hàng hỏa tốc</h3>
                    <p className="text-xs text-slate-500 italic">Dự kiến nhận: 1-2 ngày làm việc</p>
                  </div>
                </div>
                <span className="relative z-10 font-black text-white italic">50.000đ</span>
              </div>

              <div
                onClick={() => { setShippingMethod('standard'); setShippingFee(20000); }}
                className={`p-8 bg-[#131b2e]/40 border-2 rounded-[2rem] flex justify-between items-center group cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-[#e9c349] shadow-2xl shadow-[#e9c349]/5' : 'border-white/5 opacity-60'}`}
              >
                <div className="flex gap-5 items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'standard' ? 'border-[#e9c349]' : 'border-white/10'}`}>
                    {shippingMethod === 'standard' && <div className="w-3 h-3 rounded-full bg-[#e9c349]"></div>}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-1">Giao hàng tiêu chuẩn</h3>
                    <p className="text-xs text-slate-600 italic">Dự kiến nhận: 3-5 ngày làm việc</p>
                  </div>
                </div>
                <span className="font-black text-white italic">20.000đ</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Summary */}
        <aside className="lg:col-span-5 h-fit sticky top-32">
          <div className="bg-[#131b2e]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden">
            <div className="p-10 border-b border-white/5">
              <h2 className="text-2xl font-headline font-black text-white italic mb-8">Tóm tắt đơn hàng</h2>

              <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-20 h-28 bg-[#0b1326] rounded-2xl overflow-hidden border border-white/5 flex-shrink-0 group-hover:border-[#e9c349]/20 transition-all duration-500 shadow-xl">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-2">
                      <h4 className="font-bold text-white text-sm italic group-hover:text-[#e9c349] transition-colors">{item.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-bold">SL: {item.quantity}</span>
                        <span className="text-sm font-black text-white italic">{item.price.toLocaleString()}đ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 space-y-6 bg-[#0b1326]/40">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-slate-400 font-medium">
                  <span>Tạm tính</span>
                  <span className="text-white font-black">{subtotal.toLocaleString()}đ</span>
                </div>
                
                {vouchersInfo.map((v: any, idx: number) => (
                   <div key={idx} className="flex justify-between text-sm text-[#e9c349] font-medium">
                     <span>Giảm giá ({v.code})</span>
                     <span className="font-black">-{v.discountAmount.toLocaleString()}đ</span>
                   </div>
                ))}

                <div className="flex justify-between text-sm text-slate-400 font-medium">
                  <span>Phí vận chuyển</span>
                  <div className="flex flex-col items-end">
                    {shippingDiscount > 0 && (
                      <span className="text-[10px] text-slate-500 line-through">
                        {shippingFee.toLocaleString()}đ
                      </span>
                    )}
                    <span className="text-white font-black">{finalShippingFee.toLocaleString()}đ</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-slate-400 font-medium">
                  <span>Thuế (VAT 8%)</span>
                  <span className="text-white font-black">{tax.toLocaleString()}đ</span>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-[#e9c349]">Tổng thanh toán</span>
                <span className="text-4xl font-headline font-black text-white italic">{total.toLocaleString()}đ</span>
              </div>

              <div className="pt-10">
                <button
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending || cartItems.length === 0}
                  className="w-full py-6 bg-[#e9c349] text-[#0b1326] font-black rounded-2xl shadow-3xl shadow-[#e9c349]/10 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutMutation.isPending ? "Đang xử lý thanh toán..." : "Thanh toán"}
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="pt-6 flex flex-col gap-4 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <Lock size={12} />
                  Mã hóa SSL 256-bit bảo mật
                </div>
                <p className="text-[10px] text-slate-600 font-medium italic">Bằng cách tiếp tục, quý khách đồng ý với các Điều khoản & Chính sách của Phuoc Techno.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-10 opacity-30">
            <div className="flex items-center gap-2 text-slate-400 uppercase font-black text-[10px] tracking-widest">
              <ShieldCheck size={16} /> Secure Payment
            </div>
            <div className="flex items-center gap-2 text-slate-400 uppercase font-black text-[10px] tracking-widest">
              <Truck size={16} /> Global Shipping
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-white/5 flex flex-col items-center gap-4 opacity-50">
        <Link href="/cart" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#e9c349] transition-all mb-4">
          <ArrowLeft size={16} />
          Quay lại giỏ hàng
        </Link>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Phuoc Techno Checkout System</span>
        <p className="text-slate-500 text-[8px] uppercase font-bold">© 2026 Phuoc Techno. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default CheckoutPage;
