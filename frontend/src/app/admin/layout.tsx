"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Star,
  Settings,
  Bell,
  Search,
  UserCircle,
  CreditCard,
  Mail,
  Globe
} from "lucide-react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!hydrated) return; // Chờ cho đến khi nạp xong dữ liệu từ storage

    if (!user) {
      router.replace("/login");
    } else if (user.role !== "ROLE_ADMIN") {
      router.replace("/");
    } else {
      setIsAuthorized(true);
    }
  }, [user, hydrated, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#e9c349] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Tổng quan", icon: <LayoutDashboard size={20} />, href: "/admin" },
    { name: "Sản phẩm", icon: <Package size={20} />, href: "/admin/products" },
    { name: "Danh mục", icon: <Layers size={20} />, href: "/admin/categories" },
    { name: "Đơn hàng", icon: <ShoppingCart size={20} />, href: "/admin/orders" },
    { name: "Khách hàng", icon: <Users size={20} />, href: "/admin/users" },
    { name: "Đánh giá", icon: <Star size={20} />, href: "/admin/reviews" },
    { name: "Thanh toán", icon: <CreditCard size={20} />, href: "/admin/payments" },
    { name: "Email", icon: <Mail size={20} />, href: "/admin/emails" },
    { name: "Cài đặt", icon: <Settings size={20} />, href: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0b1326] text-[#dae2fd]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full flex flex-col p-6 bg-[#0f172a]/60 backdrop-blur-xl w-72 border-r border-white/10 z-50">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-bold tracking-tighter text-white italic font-headline">Atelier Admin</h1>
          <p className="tracking-tight text-xs font-semibold text-slate-400 mt-1 uppercase">Premium Management</p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-linear-to-br from-white/10 to-[#0f172a]/40 text-[#e9c349] font-bold shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1 font-semibold text-sm'}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2d3449] flex items-center justify-center ring-2 ring-[#e9c349]/20">
            <UserCircle size={24} className="text-[#e9c349]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-bold truncate">{user?.userName || "Admin"}</p>
            <p className="text-slate-500 text-xs truncate uppercase tracking-widest">{user?.role || "Admin"}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 min-h-screen flex flex-col">
        {/* TopNavBar */}
        <header className="flex justify-between items-center px-12 w-full h-20 sticky top-0 bg-[#0f172a]/40 backdrop-blur-md z-40 border-b border-white/5">
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-2xl font-light text-white tracking-tight">Trang quản trị</h2>
            <Link href="/" className="ml-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e9c349] bg-[#e9c349]/10 px-4 py-2 rounded-full hover:bg-[#e9c349]/20 transition-all">
              <Globe size={14} /> Mở Trang Trải Nghiệm
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <input
                className="bg-[#0b1326] border-none rounded-full px-6 py-2 text-sm text-[#c6c6cd] w-64 focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all"
                placeholder="Tìm kiếm..."
                type="text"
              />
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c6c6cd]" />
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-[#e9c349] transition-colors"><Bell size={20} /></button>
              <button className="text-slate-400 hover:text-[#e9c349] transition-colors"><UserCircle size={20} /></button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
