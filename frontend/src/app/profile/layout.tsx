"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  User, 
  Receipt, 
  Star, 
  Settings, 
  HelpCircle,
  LogOut
} from "lucide-react";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { name: "Thông tin cá nhân", icon: <User size={20} />, href: "/profile" },
    { name: "Lịch sử mua hàng", icon: <Receipt size={20} />, href: "/profile/orders" },
    { name: "Đánh giá của tôi", icon: <Star size={20} />, href: "/profile/reviews" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0b1326] text-[#dae2fd]">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 py-8 flex flex-col h-screen w-72 bg-[#131b2e] border-r border-[#45464d]/15 font-['Inter'] font-medium text-sm z-40">
        <div className="mb-12 px-8 flex items-center gap-3">
           <div className="w-10 h-10 bg-[#e9c349] rounded-xl flex items-center justify-center text-[#0b1326] font-black italic shadow-lg shadow-[#e9c349]/20">
             {user?.userName?.charAt(0).toUpperCase() || 'U'}
           </div>
           <span className="text-xl font-bold tracking-tighter text-white font-headline truncate max-w-[150px]">{user?.userName || 'Profile'}</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 py-4 pl-8 transition-all duration-300 relative group ${isActive ? 'text-[#e9c349] bg-[#222a3d]/50 border-r-2 border-[#e9c349]' : 'text-[#c6c6cd] hover:bg-[#222a3d]/30 hover:text-[#bec6e0]'}`}
              >
                {item.icon}
                <span className={`${isActive ? 'font-bold' : ''}`}>{item.name}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-linear-to-r from-[#e9c349]/5 to-transparent pointer-events-none"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 mt-auto pb-10 space-y-1 border-t border-white/5 pt-8">
          <Link href="/profile/settings" className="flex items-center space-x-3 py-3 text-[#c6c6cd] pl-4 hover:bg-[#222a3d] transition-all rounded-xl">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          <Link href="/support" className="flex items-center space-x-3 py-3 text-[#c6c6cd] pl-4 hover:bg-[#222a3d] transition-all rounded-xl">
            <HelpCircle size={18} />
            <span>Support</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center space-x-3 py-3 text-rose-400 pl-4 hover:bg-rose-400/5 transition-all rounded-xl w-full text-left">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 flex-1 min-h-screen relative overflow-hidden">
        {/* Subtle Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#e9c349]/5 blur-[120px]"></div>
        </div>
        
        <div className="p-12">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ProfileLayout;
