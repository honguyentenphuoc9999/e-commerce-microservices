"use client";
import React from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Bell, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams?.get("name") || "");

  // Đồng bộ ô search khi URL thay đổi
  React.useEffect(() => {
    setSearchValue(searchParams?.get("name") || "");
  }, [searchParams]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const trimmed = searchValue.trim();
      if (trimmed) {
        router.push(`/collections?name=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(`/collections`);
      }
    }
  };

  const queryClient = useQueryClient();


  // Fetch cart data for correct count (Enabled for everyone)
  // Fetch cart data with user-specific key to avoid cache sharing
  const { data: cartData } = useQuery({
    queryKey: ['cart', user?.id || 'guest'],
    queryFn: shopService.getCart,
  });

  const cartLength = cartData?.items?.length || cartData?.cartItems?.length || (Array.isArray(cartData) ? cartData.length : 0);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/60 backdrop-blur-xl font-headline tracking-tight antialiased border-b border-white/5">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1440px] mx-auto">
        {/* Left: Logo */}
        <div className="flex-1 flex items-center">
          <Link href="/">
            <img 
              src="https://res.cloudinary.com/de0de4yum/image/upload/v1776774968/logo_yc7qyw.png" 
              alt="Phuoc Techno Logo" 
              className="h-10 w-auto object-contain hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* Center: Search bar */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="relative group w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-500 h-4 w-4 group-focus-within:text-[#e9c349] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm siêu phẩm công nghệ..."
              className="w-full bg-[#131b2e] border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#e9c349]/50 focus:border-[#e9c349]/30 transition-all shadow-inner"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex-1 flex items-center justify-end gap-2 md:gap-5">
          <Link href="/cart" className="text-[#bec6e0] hover:bg-[#222a3d]/50 p-2.5 rounded-full transition-all group relative">
            <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {cartLength > 0 && (
              <span className="absolute top-0 right-0 bg-[#e9c349] text-black text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-black animate-in zoom-in-0 shadow-lg shadow-[#e9c349]/20">
                {cartLength}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link href={user.role === "ROLE_ADMIN" ? "/admin" : "/profile"} className="flex items-center gap-3 text-[#bec6e0] hover:bg-[#e9c349]/10 p-1.5 pr-4 rounded-full transition-all bg-[#222a3d]/40 border border-white/5 hover:border-[#e9c349]/30 group">
                <div className="w-7 h-7 bg-[#e9c349] text-black font-black rounded-full flex items-center justify-center text-[10px] group-hover:rotate-12 transition-transform">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.15em] text-slate-300 group-hover:text-white transition-colors">{user.userName}</span>
              </Link>
              {user.role === "ROLE_ADMIN" && (
                <button 
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="text-red-400/60 hover:text-white hover:bg-red-500 p-2.5 rounded-full transition-all bg-[#222a3d]/40 border border-white/5"
                  title="Đăng xuất Admin"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-[#bec6e0] hover:bg-[#e9c349]/10 p-2.5 rounded-full transition-all border border-transparent hover:border-[#e9c349]/30">
              <User className="h-5 w-5" />
            </Link>
          )}

          <Link href="/notifications" className="hidden sm:flex text-[#bec6e0] hover:bg-[#222a3d]/50 p-2.5 rounded-full transition-all">
            <Bell className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
