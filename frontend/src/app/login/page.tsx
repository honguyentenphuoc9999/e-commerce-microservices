"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";

const LoginPage = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  // Clear any existing session data when arriving at the login page
  React.useEffect(() => {
    logout();
  }, [logout]);
  
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await authService.login({ userName, userPassword: password });
      // Thường Spring Boot trả về string token trực tiếp hoặc dạng object
      const token = typeof response === "string" ? response : response.token || response.accessToken;
      const role = typeof response === "string" ? "ROLE_USER" : response.role || "ROLE_USER";
      const id = typeof response === "string" ? 2 : response.id || 2;
      const firstName = typeof response === "string" ? "" : response.firstName || "";
      const lastName = typeof response === "string" ? "" : response.lastName || "";
      
      if (token) {
        setAuth(token, userName, id, role, firstName, lastName);
        if (role === "ROLE_ADMIN" || userName === "admin_tong") {
          router.push("/admin"); // Redirect to admin dashboard
        } else {
          router.push("/"); // Redirect to home page
        }
      } else {
        setError("Không thể trích xuất Token từ phản hồi.");
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("Tài khoản đã bị khóa, vui lòng khiếu nại ở 'admin@rainbowforest.com'");
      } else {
        setError("Đăng nhập thất bại. Kiểm tra lại tài khoản hoặc mật khẩu.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-600/10 blur-[150px] rounded-full" />

      {/* Main Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg glass-card p-10 rounded-3xl z-10 border border-white/10"
      >
        <div className="text-center mb-12 group">
          <Link href="/" className="inline-block mb-8">
            <img 
              src="https://res.cloudinary.com/de0de4yum/image/upload/v1776774968/logo_yc7qyw.png" 
              alt="Phuoc Techno Logo" 
              className="h-20 w-auto object-contain mx-auto hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Chào mừng trở lại</h1>
          <p className="text-slate-400 font-medium tracking-wide">Truy cập an toàn vào hệ thống Phuoc Techno.</p>
        </div>

        <form className="space-y-8" onSubmit={handleLogin}>
          {error && <div className="text-red-400 text-sm font-bold text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</div>}
          <div>
            <label className="block text-xs font-bold tracking-widest text-slate-500 mb-3 uppercase">Tên Đăng Nhập</label>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="nhap_tai_khoan_..." 
              required
              suppressHydrationWarning
              className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Mật khẩu</label>
              <Link href="/forgot-password" className="text-[10px] font-bold text-yellow-500/80 hover:text-yellow-500 tracking-wider transition">QUÊN MẬT KHẨU?</Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                suppressHydrationWarning
                className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                suppressHydrationWarning
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            suppressHydrationWarning
            className="w-full premium-btn py-4 rounded-xl font-bold flex items-center justify-center space-x-2 text-white group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? "Đang xử lý..." : "Đăng Nhập"}</span>
            {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-10 flex items-center justify-center space-x-2 text-[10px] font-bold tracking-[0.2em] text-cyan-500/60 uppercase">
          <ShieldCheck className="h-4 w-4" />
          <span>Được bảo mật bằng JWT Stateless Auth</span>
        </div>

        <div className="mt-12 text-center text-sm">
          <span className="text-slate-500">Chưa có tài khoản?</span>{" "}
          <Link href="/register" className="text-yellow-500/90 font-bold hover:text-yellow-500 transition">Đăng ký</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
