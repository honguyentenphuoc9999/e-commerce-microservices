"use client";
import React from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Bell, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      router.push(`/collections?name=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue(""); // Clear after search
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login"); // Push to login after logout
  };

  // Fetch cart data for correct count (Enabled for everyone)
  // Fetch cart data with user-specific key to avoid cache sharing
  const { data: cartData } = useQuery({
    queryKey: ['cart', user?.userName || 'guest'],
    queryFn: shopService.getCart,
  });

  const cartLength = cartData?.items?.length || cartData?.cartItems?.length || (Array.isArray(cartData) ? cartData.length : 0);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/60 backdrop-blur-xl font-headline tracking-tight antialiased border-b border-white/5">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1440px] mx-auto">
        {/* Logo */}
        <div className="text-2xl font-black tracking-tighter text-[#bec6e0] uppercase">
          <Link href="/">Atelier</Link>
        </div>



        {/* Action Controls */}
        <div className="flex items-center gap-6">
          {/* Search bar */}
          <div className="hidden lg:flex items-center bg-[#131b2e] rounded-full px-4 py-1.5 border border-white/10">
            <Search className="text-[#c6c6cd] h-4 w-4 mr-2" />
            <input
              type="text"
              placeholder="Tìm kiếm tại atelier..."
              className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-[#c6c6cd]/50 w-48 outline-none"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              suppressHydrationWarning
            />
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="text-[#bec6e0] hover:bg-[#222a3d]/50 p-2 rounded-full transition-all group relative">
              <ShoppingCart className="h-5 w-5" />
              {cartLength > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e9c349] text-black text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold animate-in zoom-in-0 duration-300">
                  {cartLength}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link href={user.role === "ROLE_ADMIN" ? "/admin" : "/profile"} className="flex items-center gap-2 text-[#bec6e0] hover:bg-[#222a3d]/50 p-1.5 pr-4 rounded-full transition-all bg-[#131b2e] border border-white/5">
                  <div className="w-6 h-6 bg-[#e9c349] text-black font-bold rounded-full flex items-center justify-center text-xs">
                    {user.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium uppercase tracking-wider">{user.userName}</span>
                </Link>
                {user.role === "ROLE_ADMIN" && (
                  <button
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-400 hover:bg-[#222a3d]/50 p-2 rounded-full transition-all"
                    title="Đăng xuất"
                    suppressHydrationWarning
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-[#bec6e0] hover:bg-[#222a3d]/50 p-2 rounded-full transition-all">
                <User className="h-5 w-5" />
              </Link>
            )}
            <Link href="/notifications" className="text-[#bec6e0] hover:bg-[#222a3d]/50 p-2 rounded-full transition-all">
              <Bell className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
