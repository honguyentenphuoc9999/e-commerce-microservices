"use client";
import React from "react";
import { User } from "lucide-react";
import Footer from "@/components/Footer";
import { Trash2, Plus, Minus, ShieldCheck, Box, MoveRight, Truck, ShoppingBag, ArrowLeft, X as CloseIcon } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { useAuthStore } from "@/store/useAuthStore";

export default function CartPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [voucherInput, setVoucherInput] = React.useState("");
  const [appliedVoucher, setAppliedVoucher] = React.useState<any>(null);
  const [voucherError, setVoucherError] = React.useState("");

  // Lấy danh sách voucher gợi ý
  const { data: availableVouchers = [] } = useQuery({
    queryKey: ['available-vouchers'],
    queryFn: shopService.getAvailableVouchers,
  });

  // Load cart with user-specific query key
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart', user?.id || 'guest'],
    queryFn: shopService.getCart,
  });

  // Map backend cart state to frontend UI format
  const rawItems = [...(cartData?.items || cartData?.cartItems || (Array.isArray(cartData) ? cartData : []) || [])]
    .sort((a: any, b: any) => (b.addedAt || 0) - (a.addedAt || 0));
    
  const cartItems = rawItems.map((item: any, index: number) => ({
    // Đảm bảo ID là duy nhất: Ưu tiên database ID, nếu không dùng kết hợp productId và index
    id: item.id || `item-${item.product?.id || item.productId || index}`,
    productId: item.product?.id || item.productId,
    name: item.product?.productName || item.productName || "",
    code: item.product?.category?.categoryName || item.product?.categoryName || "",
    price: item.product?.price || item.price || 0,
    quantity: item.quantity || 1,
    image: item.product?.image || item.image || ""
  }));

  // Handlers for cart changes
  const removeItemMutate = useMutation({
    mutationFn: (productId: string) => shopService.removeFromCart(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] })
  });

  const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

  const itemDiscount = appliedVoucher?.type === 'DISCOUNT' ? appliedVoucher.discountAmount : 0;
  const shippingDiscount = appliedVoucher?.type === 'FREESHIP' ? appliedVoucher.discountAmount : 0;

  const taxableAmount = Math.max(0, subtotal - itemDiscount);
  const tax = taxableAmount * 0.08;
  const baseShippingFee = 20000;
  const finalShippingFee = Math.max(0, baseShippingFee - shippingDiscount);
  const total = taxableAmount + tax + finalShippingFee;

  const handleApplyVoucher = async (codeOverride?: any) => {
    // Nếu codeOverride là một chuỗi thì dùng, nếu không (là Event) thì lấy từ voucherInput
    const code = (typeof codeOverride === 'string' ? codeOverride : "") || voucherInput;

    if (!code || typeof code !== 'string' || !code.trim()) return;

    setVoucherError("");
    try {
      const result = await shopService.validateVoucher(code.trim(), subtotal);
      setAppliedVoucher(result);
      setVoucherInput(result.code);
      // Không dùng alert nữa để tránh gián đoạn trải nghiệm
    } catch (error: any) {
      setAppliedVoucher(null);
      setVoucherError(error.response?.data || "Mã giảm giá không hợp lệ");
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput("");
    setVoucherError("");
  };

  const updateQtyMutate = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string, quantity: number }) =>
      shopService.updateCartQuantity(productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] })
  });

  const handleUpdateQty = (productId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty > 0) {
      updateQtyMutate.mutate({ productId, quantity: newQty });
    } else {
      removeItemMutate.mutate(productId);
    }
  };

  if (!user) {
    return (
      <div className="bg-[#0b1326] min-h-screen text-[#dae2fd]">
        <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/60 backdrop-blur-xl border-b border-white/5">
          <div className="flex justify-between items-center w-full px-8 py-5 max-w-7xl mx-auto">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <img
                src="https://res.cloudinary.com/de0de4yum/image/upload/v1776774968/logo_yc7qyw.png"
                alt="Phuoc Techno Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <Link href="/login" className="bg-[#e9c349] text-black px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">
              Đăng nhập
            </Link>
          </div>
        </nav>
        <div className="pt-48 flex flex-col items-center">
          <h1 className="text-5xl font-headline font-black italic mb-6">Chưa xác thực</h1>
          <p className="text-slate-500 mb-10 max-w-md text-center">Vui lòng đăng nhập để xem những sản phẩm tâm huyết bạn đã lưu vào giỏ hàng.</p>
          <Link href="/login" className="flex items-center gap-3 bg-[#e9c349] text-[#0b1326] px-12 py-5 rounded-xl font-headline font-bold uppercase transition-all hover:shadow-2xl shadow-[#e9c349]/20">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0b1326] min-h-screen text-[#dae2fd]">
      {/* Simplified Nav for Cart (Like Checkout) */}
      <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-7xl mx-auto">
          <Link href="/" className="inline-block mb-8">
            <img
              src="https://res.cloudinary.com/de0de4yum/image/upload/v1776774968/logo_yc7qyw.png"
              alt="Phuoc Techno Logo"
              className="h-10 w-auto object-contain mx-auto hover:scale-105 transition-transform"
            />
          </Link>
          <div className="flex items-center gap-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <div className="flex items-center gap-3 text-[#e9c349]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e9c349] animate-pulse"></span>
              Giỏ hàng của bạn
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <div className="w-5 h-5 bg-[#e9c349] text-black font-bold rounded-full flex items-center justify-center text-[10px]">
                {user?.userName?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{user?.userName}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto min-h-screen">
        {/* Page Headline */}
        <div className="mb-16">
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-white mb-2">Giỏ hàng</h1>
          <p className="text-[#c6c6cd] font-light tracking-wide uppercase text-xs">Lựa chọn của Phuoc Techno ({cartItems.length} sản phẩm)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Product List Section */}
          <section className="lg:col-span-8 flex flex-col gap-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32 bg-[#222a3d]/20 rounded-2xl border border-white/5">
                <div className="w-12 h-12 border-4 border-[#e9c349]/20 border-t-[#e9c349] rounded-full animate-spin mb-4"></div>
                <p className="text-[#bec6e0] font-medium animate-pulse">Đang đồng bộ Giỏ hàng cao cấp...</p>
              </div>
            )}

            {!isLoading && cartItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 bg-[#222a3d]/20 rounded-2xl border border-white/5 text-center px-6">
                <div className="w-24 h-24 bg-[#e9c349]/10 rounded-full flex items-center justify-center mb-8 text-[#e9c349]">
                  <ShoppingBag size={48} strokeWidth={1.5} />
                </div>
                <h2 className="font-headline text-3xl font-bold text-white mb-4">Giỏ hàng rỗng</h2>
                <p className="text-[#c6c6cd] max-w-md mb-10 leading-relaxed">
                  Có vẻ như bạn chưa chọn được siêu phẩm nào. Hãy khám phá bộ sưu tập công nghệ mới nhất của Phuoc Techno ngay.
                </p>
                <Link
                  href="/"
                  className="flex items-center gap-3 bg-[#e9c349] hover:bg-[#d4ac2b] text-[#0b1326] px-10 py-4 rounded-full font-headline font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#e9c349]/10"
                >
                  <ArrowLeft size={20} />
                  <span>Mua sắm ngay</span>
                </Link>
              </div>
            )}

            {cartItems.map((item: any) => (
              <div key={item.id} className="bg-[#222a3d]/40 backdrop-blur-md rounded-xl p-6 flex flex-col md:flex-row gap-8 group border border-white/5 hover:border-white/10 transition-colors shadow-lg">
                <div className="w-full md:w-48 h-64 md:h-48 rounded-lg overflow-hidden flex-shrink-0 bg-[#131b2e] border border-white/5 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  ) : (
                    <ShoppingBag className="text-white/5" size={48} />
                  )}
                </div>
                <div className="flex flex-col flex-grow justify-between py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline text-2xl font-bold text-white mb-1 group-hover:text-[#e9c349] transition-colors">{item.name}</h3>
                      <p className="text-[#c6c6cd] text-sm font-medium tracking-wide uppercase opacity-60 italic">{item.code}</p>
                    </div>
                    <span className="font-headline text-xl font-semibold text-[#e9c349]">
                      {item.price.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-4 bg-[#060e20] rounded-full px-5 py-2.5 border border-white/10 shadow-inner">
                      <button
                        onClick={() => handleUpdateQty(item.productId, item.quantity, -1)}
                        className="text-[#c6c6cd] hover:text-white transition-all hover:scale-125 disabled:opacity-30"
                        disabled={updateQtyMutate.isPending}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-headline font-bold text-white min-w-[1.5rem] text-center text-lg">
                        {updateQtyMutate.isPending && updateQtyMutate.variables?.productId === item.productId
                          ? ".."
                          : item.quantity.toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.productId, item.quantity, 1)}
                        className="text-[#c6c6cd] hover:text-white transition-all hover:scale-125 disabled:opacity-30"
                        disabled={updateQtyMutate.isPending}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItemMutate.mutate(item.productId)}
                      className="flex items-center gap-2 text-[#c6c6cd] hover:text-red-400 transition-all text-sm uppercase tracking-widest font-bold group/del"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover/del:bg-red-400/10 transition-colors">
                        <Trash2 size={18} />
                      </div>
                      <span>{removeItemMutate.isPending ? "Dạng xóa..." : "Xóa"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {cartItems.length > 0 && (
              <div className="mt-4 px-4 py-4 bg-[#8bd6b6]/10 rounded-xl border border-[#8bd6b6]/20 flex items-center gap-3 text-[#8bd6b6]">
                <Truck size={20} />
                <span className="text-sm font-semibold tracking-wide uppercase">Duy nhất tại Phuoc Techno: Giao hàng toàn quốc chỉ từ 20.000đ.</span>
              </div>
            )}
          </section>

          {/* Order Summary Section */}
          <aside className="lg:col-span-4 sticky top-32">
            <div className="bg-[#222a3d]/40 backdrop-blur-xl rounded-xl p-8 border border-white/10 shadow-2xl shadow-black/40">
              <h2 className="font-headline text-2xl font-bold text-white mb-8">Tóm tắt đơn hàng</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-[#c6c6cd]">Tạm tính</span>
                  <div className="flex flex-col items-end">
                    {itemDiscount > 0 && (
                      <span className="text-[10px] text-slate-500 line-through">
                        {subtotal.toLocaleString()}đ
                      </span>
                    )}
                    <span className="text-white font-semibold">
                      {(subtotal - itemDiscount).toLocaleString()}đ
                    </span>
                  </div>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between items-center text-[#e9c349] animate-in slide-in-from-right-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Giảm giá ({appliedVoucher.code})</span>
                    </div>
                    <span className="font-bold">-{appliedVoucher.discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#c6c6cd]">Phí vận chuyển dự kiến</span>
                  <div className="flex flex-col items-end">
                    {shippingDiscount > 0 && (
                      <span className="text-[10px] text-slate-500 line-through">
                        {baseShippingFee.toLocaleString()}đ
                      </span>
                    )}
                    <span className="text-white font-semibold">{finalShippingFee.toLocaleString()}đ</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#c6c6cd]">Thuế (VAT 8%)</span>
                  <span className="text-white font-semibold">
                    {tax.toLocaleString()}đ
                  </span>
                </div>
              </div>
              <div className="h-[1px] bg-white/10 mb-8"></div>
              <div className="flex justify-between items-center mb-10">
                <span className="font-headline text-xl font-bold text-white">Tổng cộng</span>
                <span className="font-headline text-3xl font-extrabold text-[#e9c349]">
                  {total.toLocaleString()}đ
                </span>
              </div>
              <Link
                href={appliedVoucher ? `/checkout?vouchers=${appliedVoucher.code}` : "/checkout"}
                className="w-full bg-linear-to-r from-[#bec6e0] to-[#0f172a] py-5 rounded-xl text-[#0b1326] font-headline font-bold text-lg tracking-wide uppercase shadow-lg shadow-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-6"
              >
                <span>Thanh toán ngay</span>
                <MoveRight size={20} />
              </Link>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[#c6c6cd] text-xs font-medium">
                  <ShieldCheck size={16} />
                  <span>Thanh toán an toàn được mã hóa</span>
                </div>
                <div className="flex items-center gap-3 text-[#c6c6cd] text-xs font-medium">
                  <ShieldCheck size={16} />
                  <span>Thanh toán an toàn được mã hóa</span>
                </div>
                <div className="flex items-center gap-3 text-[#c6c6cd] text-xs font-medium">
                  <Box size={16} />
                  <span>Đã bao gồm bao bì cao cấp từ Phuoc Techno</span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mt-6 space-y-2">
              <div className="flex gap-2 relative">
                <div className="relative flex-grow">
                  <input
                    className={`w-full bg-[#060e20] border-none rounded-lg px-4 py-3 focus:ring-1 text-white text-sm outline-none transition-all ${appliedVoucher ? 'ring-1 ring-[#e9c349]/40' : 'focus:ring-[#e9c349]/40'}`}
                    placeholder="Mã giảm giá"
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                  />
                  {voucherInput && (
                    <button
                      onClick={handleRemoveVoucher}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c6c6cd] hover:text-white"
                    >
                      <CloseIcon size={16} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleApplyVoucher()}
                  className="bg-[#222a3d] px-6 py-3 rounded-lg text-[#e9c349] text-sm font-bold uppercase tracking-widest hover:bg-[#2d3449] transition-colors shrink-0"
                >
                  Áp dụng
                </button>
              </div>
              {voucherError && (
                <p className="text-red-400 text-xs font-medium ml-1">{voucherError}</p>
              )}
            </div>

            {/* Suggested Vouchers */}
            {availableVouchers.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#c6c6cd]/60 mb-4 px-1">Voucher dành cho bạn</h3>
                <div className="flex flex-col gap-3">
                  {availableVouchers.map((v: any) => {
                    const isMet = subtotal >= v.minOrderValue;
                    const isApplied = appliedVoucher?.code === v.code;

                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          if (!isMet) return;
                          if (isApplied) handleRemoveVoucher();
                          else handleApplyVoucher(v.code);
                        }}
                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${isApplied
                          ? 'bg-[#e9c349]/10 border-[#e9c349] shadow-[0_0_15px_rgba(233,195,73,0.1)]'
                          : isMet
                            ? 'bg-[#222a3d]/20 border-white/5 hover:border-[#e9c349]/40 hover:bg-[#222a3d]/40'
                            : 'bg-[#131b2e]/40 border-white/5 opacity-50 grayscale'
                          }`}
                      >
                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-headline font-black text-[#e9c349] tracking-tighter text-lg">{v.code}</span>
                              {isApplied && (
                                <span className="text-[10px] bg-[#e9c349] text-black px-1.5 py-0.5 rounded-full font-bold animate-in zoom-in">ĐÃ ÁP DỤNG</span>
                              )}
                            </div>
                            <p className="text-white font-bold text-sm">Giảm {v.discountAmount.toLocaleString()}đ</p>
                            <p className="text-[#c6c6cd] text-[10px] mt-1">Đơn tối thiểu {v.minOrderValue.toLocaleString()}đ</p>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isApplied ? 'bg-[#e9c349] text-black' : 'bg-white/5 text-[#c6c6cd] group-hover:bg-[#e9c349]/20 group-hover:text-[#e9c349]'}`}>
                            {isApplied ? <CloseIcon size={14} /> : <Plus size={14} />}
                          </div>
                        </div>

                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-[#e9c349]/5 rounded-full blur-2xl group-hover:bg-[#e9c349]/10 transition-colors"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
