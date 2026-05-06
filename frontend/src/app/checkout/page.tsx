"use client";
// Trigger re-build for back button fix
import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  User,
  ChevronRight,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Lock,
  CheckCircle,
  X as CloseIcon,
  Ticket,
  Plus,
  ChevronDown,
  CreditCard,
  Banknote
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";


const CheckoutPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const voucherParam = searchParams.get("vouchers");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState("");
  const [isVoucherListOpen, setIsVoucherListOpen] = useState(false);
  const [mounted] = useState(true);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Mặc định phí ship là 20k
  const [shippingFee, setShippingFee] = useState(20000);
  const [shippingMethod, setShippingMethod] = useState("standard");

  const { data: cartData } = useQuery({
    queryKey: ['cart', user?.id || 'guest'],
    queryFn: shopService.getCart,
  });

  // Redirect to login if NOT authenticated (Checkout requires account)
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, router]);

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
    city: "",
    zipCode: "",
    phone: ""
  });
  const [hasSyncedProfile, setHasSyncedProfile] = useState(false);

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

  // Load selected items from sessionStorage
  useEffect(() => {
    const savedSelected = sessionStorage.getItem("selectedCartItemIds");
    if (savedSelected) {
      try {
        const parsed = JSON.parse(savedSelected);
        setSelectedItemIds(parsed);
      } catch (e) {
        console.error("Error parsing selected items", e);
      }
    }
  }, []);

  // Load saved form data from sessionStorage on mount
  useEffect(() => {
    const savedForm = sessionStorage.getItem("checkoutFormData");
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setFormData(parsed);
      } catch (e) {
        console.error("Error parsing saved form data", e);
      }
    }
  }, []);

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("checkoutFormData", JSON.stringify(formData));
  }, [formData]);

  // Tự động điền thông tin khi profile load xong
  useEffect(() => {
    if (profile && !hasSyncedProfile) {
      const ud = profile?.userDetails;

      // Ghép địa chỉ chi tiết theo thứ tự: Số nhà, Tên đường, Phường/Xã, Quận/Huyện
      const detailedAddress = ud ? [
        ud.streetNumber,
        ud.street,
        ud.ward,
        ud.district
      ].filter(Boolean).join(", ") : "";

      const city = ud?.locality || "";
      const initialZip = city ? (VN_POSTAL_CODES[city] || "70000") : "";

      setFormData(prev => ({
        ...prev,
        firstName: ud?.lastName || user?.userName?.split(' ').pop() || prev.firstName || "",
        lastName: ud?.firstName || user?.userName?.split(' ').slice(0, -1).join(' ') || prev.lastName || "",
        phone: ud?.phoneNumber || prev.phone || "",
        city: city || prev.city || "Hồ Chí Minh",
        zipCode: initialZip || prev.zipCode || "70000",
        address: detailedAddress || prev.address || ""
      }));
      setHasSyncedProfile(true);
    }
  }, [profile, user, hasSyncedProfile]);

  const { data: availableVouchers = [] } = useQuery({
    queryKey: ['available-vouchers'],
    queryFn: shopService.getAvailableVouchers,
  });

  const rawItems = [...(cartData?.items || cartData?.cartItems || (Array.isArray(cartData) ? cartData : []) || [])]
    .sort((a: any, b: any) => (b.addedAt || 0) - (a.addedAt || 0));

  const allCartItems = rawItems.map((item: any, index: number) => ({
    id: item.product?.id || item.productId,
    productId: item.product?.id || item.productId,
    name: item.product?.productName || item.productName || "Sản phẩm",
    price: item.product?.price || item.price || 0,
    quantity: item.quantity || 1,
    image: item.product?.image || item.image || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800"
  }));

  // Lọc sản phẩm theo danh sách đã chọn
  const cartItems = useMemo(() => {
    if (selectedItemIds.length === 0) return allCartItems;
    return allCartItems.filter(item => selectedItemIds.includes(item.id));
  }, [allCartItems, selectedItemIds]);

  const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

  // Redirect if no items after load
  useEffect(() => {
    if (mounted && cartData && cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartData, cartItems, mounted]);

  // Load initial vouchers from URL
  useEffect(() => {
    if (voucherParam && subtotal > 0) {
      const code = voucherParam.split(',')[0].split(':')[0].trim();
      if (code) {
        shopService.validateVoucher(code, subtotal)
          .then(result => setAppliedVoucher(result))
          .catch(() => { });
      }
    }
  }, [voucherParam, subtotal]);

  const handleApplyVoucher = async (code: string) => {
    if (!code) return;
    setVoucherError("");
    try {
      const result = await shopService.validateVoucher(code.trim(), subtotal);
      setAppliedVoucher(result);
    } catch (error: any) {
      setVoucherError(error.response?.data || "Mã giảm giá không hợp lệ");
    }
  };

  const cancelledParam = searchParams.get("cancelled") === "true";
  const orderIdParam = searchParams.get("orderId");

  // Lắng nghe sự kiện pageshow để xử lý bfcache (Back-Forward Cache)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
  };




  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const itemDiscount = appliedVoucher?.type === 'DISCOUNT' ? appliedVoucher.discountAmount : 0;
  const shippingDiscount = appliedVoucher?.type === 'FREESHIP' ? appliedVoucher.discountAmount : 0;

  const taxableAmount = Math.max(0, subtotal - itemDiscount);
  const tax = taxableAmount * 0.08;
  const finalShippingFee = Math.max(0, shippingFee - shippingDiscount);
  const total = taxableAmount + tax + finalShippingFee;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Chưa có user id");

      const cleanVouchers = appliedVoucher?.code || undefined;
      const fullAddress = `${formData.address}, ${formData.city}`;
      const orderRes = await shopService.checkout(
        user.id,
        cleanVouchers || undefined,
        shippingMethod,
        fullAddress,
        selectedItemIds // Pass the selected IDs
      );

      const orderId = orderRes?.id || orderRes?.orderId || orderRes?.data?.id || orderRes;
      if (!orderId) throw new Error("Không lấy được Order ID");

      const paymentRes = await shopService.getVNPayPayment(orderId);
      return { url: paymentRes?.paymentUrl || paymentRes, orderId };
    },
    onSuccess: (data) => {
      const { url, orderId } = data;

      sessionStorage.setItem("pendingOrderId", orderId.toString());
      sessionStorage.setItem("pendingPayment", "true");

      if (typeof url === 'string') {
        window.location.href = url;
      } else if (url?.paymentUrl) {
        window.location.href = url.paymentUrl;
      }
    },
    onError: (error: any) => {
      // Làm mới cache giỏ hàng để cart page hiển thị đúng trạng thái thực tế
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] });

      if (error.response?.status === 400) {
        // Cart trống trong backend → về giỏ hàng để user thấy trạng thái thực
        alert("Giỏ hàng của bạn không còn sản phẩm. Vui lòng thêm sản phẩm trước khi thanh toán.");
        router.push('/cart');
        return;
      }
      const msg = error.response?.data?.message
        || (typeof error.response?.data === 'string' ? error.response?.data : null)
        || error.message
        || "Lỗi thanh toán";
      alert("Thanh toán thất bại: " + msg);
    }
  });



  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd]" suppressHydrationWarning>
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
          </div>

          {/* Right: User Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-inner">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e9c349]/30">
                <img
                  src="https://res.cloudinary.com/de0de4yum/image/upload/v1777141182/phuoctechno_hwcqll.png"
                  alt="User"
                  className="w-full h-full object-cover"
                />
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
                  <div className="flex flex-col items-end">
                    {itemDiscount > 0 && (
                      <span className="text-[10px] text-slate-500 line-through">
                        {subtotal.toLocaleString()}đ
                      </span>
                    )}
                    <span className="text-white font-black">
                      {(subtotal - itemDiscount).toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-6">
                  {/* Collapsible Voucher Section */}
                  <div className="space-y-4">
                    <button
                      onClick={() => setIsVoucherListOpen(!isVoucherListOpen)}
                      className="w-full flex items-center justify-between group/vbtn"
                      suppressHydrationWarning
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349]">
                          <Ticket size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover/vbtn:text-[#e9c349] transition-colors">
                          Mã giảm giá dành cho bạn
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-slate-600 transition-transform duration-500 ${isVoucherListOpen ? "rotate-180 text-[#e9c349]" : ""}`}
                      />
                    </button>

                    {isVoucherListOpen && (
                      <div className="flex flex-col gap-4 animate-in slide-in-from-top-4 duration-500">
                        {availableVouchers.length > 0 ? (
                          availableVouchers.map((v: any) => {
                            const isApplied = appliedVoucher?.code === v.code;
                            const isEligible = subtotal >= v.minOrderValue;

                            return (
                              <div
                                key={v.id}
                                onClick={() => {
                                  if (!isEligible) return;
                                  if (isApplied) handleRemoveVoucher();
                                  else handleApplyVoucher(v.code);
                                }}
                                className={`group relative p-6 rounded-[1.5rem] border transition-all cursor-pointer overflow-hidden shadow-sm ${isApplied
                                  ? "bg-[#e9c349]/10 border-[#e9c349] shadow-[0_10px_30px_rgba(233,195,73,0.1)]"
                                  : isEligible
                                    ? "bg-[#171f33] border-white/5 hover:border-[#e9c349]/30 hover:bg-[#1c253d] hover:shadow-xl"
                                    : "bg-[#171f33]/40 border-white/5 opacity-40 grayscale cursor-not-allowed"
                                  }`}
                              >
                                <div className="flex justify-between items-center relative z-10">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className={`text-lg font-black tracking-tighter uppercase ${isApplied ? "text-[#e9c349]" : "text-white"}`}>
                                        {v.code}
                                      </h4>
                                      {isApplied && (
                                        <span className="bg-[#e9c349] text-black text-[8px] font-black px-1.5 py-0.5 rounded-full animate-in zoom-in duration-300">ĐÃ CHỌN</span>
                                      )}
                                    </div>
                                    <p className="text-white font-black text-sm italic">
                                      Giảm {v.discountAmount.toLocaleString()}đ
                                    </p>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                      Đơn tối thiểu {v.minOrderValue.toLocaleString()}đ
                                    </p>
                                  </div>
                                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 ${isApplied
                                    ? "bg-[#e9c349] border-[#e9c349] text-black rotate-90"
                                    : "bg-white/5 border-white/10 text-slate-500 group-hover:scale-110 group-hover:text-white group-hover:border-white/20"
                                    }`}>
                                    {isApplied ? <CloseIcon size={18} /> : <Plus size={18} />}
                                  </div>
                                </div>
                                <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-3xl transition-opacity duration-700 ${isApplied ? "bg-[#e9c349]/20" : "bg-white/5 opacity-0 group-hover:opacity-100"
                                  }`} />
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-center py-8 text-slate-700 text-[10px] font-bold uppercase tracking-widest italic">
                            Không có mã giảm giá khả dụng
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {voucherError && <p className="text-red-400 text-[10px] font-bold ml-1 animate-pulse">{voucherError}</p>}
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between items-center text-sm text-[#e9c349] font-medium animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} />
                      <span>Mã giảm giá áp dụng</span>
                    </div>
                    <span className="font-black">-{appliedVoucher.discountAmount.toLocaleString()}đ</span>
                  </div>
                )}

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

              <div className="pt-10 space-y-4">
                <button
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending || cartItems.length === 0}
                  className="w-full py-6 bg-[#e9c349] text-[#0b1326] font-black rounded-2xl shadow-3xl shadow-[#e9c349]/10 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  suppressHydrationWarning
                >
                  <CreditCard size={18} />
                  {checkoutMutation.isPending ? "Đang xử lý..." : "Thanh toán VNPay"}
                  <ChevronRight size={18} />
                </button>

                <button
                  type="button"
                  className="w-full py-6 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                >
                  <Banknote size={18} />
                  Thanh toán khi nhận hàng (COD)
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
