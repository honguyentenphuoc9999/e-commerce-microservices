"use client";
// Trigger re-build
import React, { useEffect } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Trash2, Plus, Minus, ShieldCheck, Box, MoveRight, Truck, ShoppingBag, ArrowLeft, X as CloseIcon } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Check } from "lucide-react";

import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Load cart with user-specific query key
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart', user?.id || 'guest'],
    queryFn: shopService.getCart,
    staleTime: 0,         // luôn refetch khi vào trang giỏ hàng
    refetchOnMount: true,
  });

  // Xóa cờ đang thanh toán khi người dùng quay lại giỏ hàng
  useEffect(() => {
    sessionStorage.removeItem("pendingPayment");
    sessionStorage.removeItem("pendingOrderId");
  }, []);

  // Map backend cart state to frontend UI format
  const rawItems = [...(cartData?.items || cartData?.cartItems || (Array.isArray(cartData) ? cartData : []) || [])]
    .sort((a: any, b: any) => (b.addedAt || 0) - (a.addedAt || 0));

  const cartItems = rawItems.map((item: any, index: number) => ({
    // Sử dụng productId làm ID chính để tránh lỗi parse Long ở Backend
    id: item.product?.id || item.productId,
    productId: item.product?.id || item.productId,
    name: item.product?.productName || item.productName || "",
    code: item.product?.category?.categoryName || item.product?.categoryName || "",
    price: item.product?.price || item.price || 0,
    quantity: item.quantity || 1,
    image: item.product?.image || item.image || "",
    availability: item.product?.availability || 99 // Fallback to 99 if not provided
  }));

  // Khởi tạo selectedIds - Bây giờ để trống mặc định theo yêu cầu
  useEffect(() => {
    // Không tự động chọn gì cả
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map(item => item.id));
    }
  };

  const removeItemsMutate = useMutation({
    mutationFn: async (ids: string[]) => {
      // Vì backend hiện tại chỉ hỗ trợ xóa từng cái, ta gọi nối tiếp
      // Trong thực tế nên có API xóa hàng loạt
      for (const id of ids) {
        const item = cartItems.find(i => i.id === id);
        if (item) {
          await shopService.removeFromCart(item.productId);
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] });
      setSelectedIds([]);
      toast.error(`Đã xóa ${variables.length} sản phẩm khỏi giỏ hàng`, {
        icon: "🗑️",
      });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa sản phẩm.");
    }
  });

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const isAll = selectedIds.length === cartItems.length;
    if (confirm(`Bạn có chắc chắn muốn xóa ${isAll ? "tất cả" : "các mục đã chọn"} khỏi giỏ hàng?`)) {
      removeItemsMutate.mutate(selectedIds);
    }
  };

  // Lưu danh sách sản phẩm đã chọn vào sessionStorage để Checkout sử dụng
  const handleProceedToCheckout = (e: React.MouseEvent) => {
    if (selectedIds.length === 0) {
      e.preventDefault();
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    if (!user) {
      e.preventDefault();
      toast.info("Vui lòng đăng nhập để tiến hành thanh toán.");
      router.push("/login?redirect=/checkout");
      return;
    }

    sessionStorage.setItem("selectedCartItemIds", JSON.stringify(selectedIds));
  };

  // Handlers for cart changes
  const removeItemMutate = useMutation({
    mutationFn: (productId: string) => shopService.removeFromCart(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] });
      const removedItem = cartItems.find((i: any) => i.productId === productId);
      toast.error(`Đã xóa ${removedItem?.name || "sản phẩm"} khỏi giỏ hàng`, {
        icon: "🗑️",
      });
    },
    onError: () => {
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại.");
    }
  });

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  const total = subtotal; // Tại giỏ hàng chỉ hiện tổng tiền sản phẩm đã chọn

  const updateQtyMutate = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string, quantity: number }) =>
      shopService.updateCartQuantity(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] });
    },
    onError: () => {
      toast.error("Không thể cập nhật số lượng.");
    }
  });

  const handleUpdateQty = (productId: string, currentQty: number, delta: number) => {
    const item = cartItems.find((i: any) => i.productId === productId);
    if (!item) return;

    let newQty = currentQty + delta;

    // Tối thiểu là 1
    if (newQty < 1) {
      newQty = 1;
    }

    // Tối đa là số lượng hiện tại của sản phẩm (availability)
    if (newQty > item.availability) {
      newQty = item.availability;
      // Thông báo cho người dùng nếu vượt quá
      if (delta > 0) {
        toast.warning(`Rất tiếc, chúng tôi chỉ còn ${item.availability} sản phẩm này trong kho.`);
      }
    }

    if (newQty !== currentQty) {
      updateQtyMutate.mutate({ productId, quantity: newQty });
    }
  };


  return (
    <div className="bg-[#0b1326] min-h-screen text-[#dae2fd]">
      <Header />

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

            {!isLoading && cartItems.length > 0 && selectedIds.length > 0 && (
              <div className="flex items-center justify-between bg-[#222a3d]/20 px-8 py-4 rounded-xl border border-white/5 mb-2 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={toggleSelectAll}>
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${selectedIds.length === cartItems.length ? 'bg-[#e9c349] border-[#e9c349] text-[#0b1326]' : 'border-white/20 group-hover:border-[#e9c349]/50'}`}>
                    {selectedIds.length === cartItems.length && <Check size={14} strokeWidth={4} />}
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white">
                    Chọn tất cả ({cartItems.length})
                  </span>
                </div>
                <button 
                  onClick={handleBulkDelete}
                  disabled={removeItemsMutate.isPending}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${selectedIds.length === cartItems.length ? 'text-rose-500 hover:scale-105' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {removeItemsMutate.isPending ? "Đang xử lý..." : selectedIds.length === cartItems.length ? "Xóa tất cả" : "Xóa mục đã chọn"}
                </button>
              </div>
            )}

            {cartItems.map((item: any) => (
              <div key={item.id} className={`bg-[#222a3d]/40 backdrop-blur-md rounded-xl p-6 flex flex-col md:flex-row gap-8 group border transition-all shadow-lg ${selectedIds.includes(item.id) ? 'border-[#e9c349]/30 ring-1 ring-[#e9c349]/10' : 'border-white/5 hover:border-white/10'}`}>
                {/* Checkbox */}
                <div className="flex items-center">
                  <div 
                    onClick={() => toggleSelect(item.id)}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer transition-all ${selectedIds.includes(item.id) ? 'bg-[#e9c349] border-[#e9c349] text-[#0b1326]' : 'border-white/20 hover:border-[#e9c349]/50'}`}
                  >
                    {selectedIds.includes(item.id) && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>

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
                        className="text-[#c6c6cd] hover:text-white transition-all hover:scale-125 disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        disabled={updateQtyMutate.isPending || item.quantity <= 1}
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
                        className="text-[#c6c6cd] hover:text-white transition-all hover:scale-125 disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        disabled={updateQtyMutate.isPending || item.quantity >= item.availability}
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
                      <span>{removeItemMutate.isPending && removeItemMutate.variables === item.productId ? "Đang xóa..." : "Xóa"}</span>
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
                  <span className="text-white font-semibold">{subtotal.toLocaleString()}đ</span>
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
                href="/checkout"
                onClick={handleProceedToCheckout}
                className="w-full bg-linear-to-r from-[#bec6e0] to-[#0f172a] py-5 rounded-xl text-[#0b1326] font-headline font-bold text-lg tracking-wide uppercase shadow-lg shadow-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-6"
              >
                <span>Thông tin giao hàng</span>
                <MoveRight size={20} />
              </Link>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[#c6c6cd] text-xs font-medium">
                  <ShieldCheck size={16} />
                  <span>Thanh toán an toàn được mã hóa</span>
                </div>
                <div className="flex items-center gap-3 text-[#c6c6cd] text-xs font-medium">
                  <ShieldCheck size={16} />
                  <span>Giao hàng hỏa tốc bảo mật</span>
                </div>
                <div className="flex items-center gap-3 text-[#c6c6cd] text-xs font-medium">
                  <Box size={16} />
                  <span>Đã bao gồm bao bì cao cấp từ Phuoc Techno</span>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
