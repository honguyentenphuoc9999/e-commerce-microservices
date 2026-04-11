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
import { useQuery, useMutation } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: shopService.getCart,
    enabled: !!user,
  });

  const rawItems = cartData?.items || cartData?.cartItems || (Array.isArray(cartData) ? cartData : []) || [];
  const cartItems = rawItems.map((item: any) => ({
    id: item.product?.id || item.productId || item.id,
    name: item.product?.productName || item.productName || "Sản phẩm",
    price: item.product?.price || item.price || 0,
    quantity: item.quantity || 1,
    image: item.product?.image || item.image || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800"
  }));

  const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = 25;
  const total = subtotal + tax + shipping;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Chưa có user id");
      const orderRes = await shopService.checkout(user.id);
      
      const orderId = orderRes?.id || orderRes?.orderId || orderRes?.data?.id || orderRes;
      const qrRes = await shopService.getVietQrPayment(orderId);
      return qrRes?.paymentUrl || qrRes; // Tuỳ thuộc format trả về
    },
    onSuccess: (url) => {
      setPaymentUrl(typeof url === 'string' ? url : url?.paymentUrl);
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
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white uppercase italic font-headline">
            Atelier
          </Link>
          <div className="flex items-center gap-8 text-slate-400 font-bold text-xs uppercase tracking-widest">

            <div className="flex items-center gap-3 text-[#e9c349]">
               <span className="w-1.5 h-1.5 rounded-full bg-[#e9c349] animate-pulse"></span>
               Thanh toán bảo mật
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/cart" className="text-white hover:scale-110 transition-transform relative">
               <ShoppingCart size={20} />
               <span className="absolute -top-2 -right-2 bg-[#e9c349] text-[#0b1326] text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </Link>
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
              <p className="text-slate-500 font-medium text-lg">Cung cấp địa chỉ của quý khách để nhận dịch vụ giao hàng ưu tiên Atelier Core.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#131b2e]/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Họ & Tên lót</label>
                <input className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic" placeholder="VD: Julian" type="text"/>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tên</label>
                <input className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic" placeholder="VD: Voss" type="text"/>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Địa chỉ chi tiết</label>
                <input className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic" placeholder="Số nhà, tên đường, khu phố..." type="text"/>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Thành phố</label>
                <input className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic" placeholder="Hồ Chí Minh" type="text"/>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mã bưu điện</label>
                <input className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic" placeholder="70000" type="text"/>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Số điện thoại liên hệ</label>
                <input className="w-full bg-[#0b1326] border-none rounded-2xl px-8 py-5 text-white focus:ring-1 focus:ring-[#e9c349]/40 transition-all placeholder:text-slate-700 font-medium italic" placeholder="+84 XXX XXX XXX" type="tel"/>
              </div>
            </div>
          </section>

          {/* Shipping Methods */}
          <section className="space-y-8">
            <h2 className="text-2xl font-headline font-bold text-white italic">Phương thức vận chuyển</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-[#131b2e] border-2 border-[#e9c349] rounded-[2rem] flex justify-between items-center group cursor-pointer shadow-2xl shadow-[#e9c349]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                   <Truck size={80} className="text-[#e9c349]" />
                </div>
                <div className="relative z-10 flex gap-5 items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-[#e9c349] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#e9c349]"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-1">Giao hàng hỏa tốc</h3>
                    <p className="text-xs text-slate-500 italic">Dự kiến nhận: 1-2 ngày làm việc</p>
                  </div>
                </div>
                <span className="relative z-10 font-black text-white italic">$25.00</span>
              </div>
              
              <div className="p-8 bg-[#131b2e]/40 border-2 border-white/5 rounded-[2rem] flex justify-between items-center group cursor-pointer hover:border-white/10 transition-all">
                <div className="flex gap-5 items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-white/10"></div>
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-1">Giao hàng tiêu chuẩn</h3>
                    <p className="text-xs text-slate-600 italic">Dự kiến nhận: 3-5 ngày làm việc</p>
                  </div>
                </div>
                <span className="font-black text-emerald-400 uppercase text-[10px] tracking-widest italic">Miễn phí</span>
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
                <div className="flex justify-between text-sm text-slate-400 font-medium">
                  <span>Phí vận chuyển</span>
                  <span className="text-white font-black">{shipping.toLocaleString()}đ</span>
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
                   {checkoutMutation.isPending ? "Đang xử lý thanh toán..." : "Thanh toán & Lấy mã QR"}
                   <ChevronRight size={18} />
                </button>
              </div>
              
              <div className="pt-6 flex flex-col gap-4 text-center">
                 <div className="flex items-center justify-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <Lock size={12} />
                    Mã hóa SSL 256-bit bảo mật
                 </div>
                 <p className="text-[10px] text-slate-600 font-medium italic">Bằng cách tiếp tục, quý khách đồng ý với các Điều khoản & Chính sách của Atelier.</p>
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
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Atelier Checkout System</span>
         <p className="text-slate-500 text-[8px] uppercase font-bold">© 2024 Digital Atelier. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default CheckoutPage;
