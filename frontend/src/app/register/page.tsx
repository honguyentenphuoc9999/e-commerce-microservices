"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

const RegisterPage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const parts = fullName.split(" ");
      const firstName = parts.length > 1 ? parts.slice(0, -1).join(" ") : fullName;
      const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

      await authService.register({
        userName,
        userPassword: password,
        active: 1,
        userDetails: { firstName, lastName, email },
        role: { id: 1 } // ROLE_USER
      });
      
      alert("Tạo tài khoản thành công! Bạn có thể đăng nhập ngay.");
      router.push("/login");
    } catch (err) {
      setError("Đăng ký thất bại. Tên đăng nhập hoặc Email có thể đã bị trùng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 bg-[url('/bg-abstract.png')] bg-cover bg-center">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-white">Digital Atelier</h1>
        <p className="text-slate-400 font-medium">Tham gia cộng đồng chế tác kỹ thuật số tinh hoa.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg glass-card p-10 rounded-2xl z-10 border border-white/5 bg-black/40 backdrop-blur-2xl"
      >
        <form className="space-y-6" onSubmit={handleRegister}>
          {error && <div className="text-red-400 text-sm font-bold text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Tên Đăng Nhập</label>
              <input 
                type="text" 
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="alex99..." 
                className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Họ và Tên</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alexander Thorne" 
                className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Địa chỉ Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="atelier@studio.com" 
              className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Mật khẩu</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Xác nhận mật khẩu</label>
              <div className="relative">
                <input 
                  type={showConfirm ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500/50 transition-all" 
            />
            <span className="text-xs text-slate-400 font-medium">
              Tôi đồng ý với <Link href="/terms" className="text-yellow-500/80 hover:text-yellow-500 hover:underline">Điều khoản Dịch vụ</Link> và <Link href="/privacy" className="text-yellow-500/80 hover:text-yellow-500 hover:underline">Chính sách Bảo mật</Link>.
            </span>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full premium-btn py-4 rounded-xl font-bold flex items-center justify-center space-x-2 text-white group mt-10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? "Đang xử lý..." : "Tạo tài khoản"}</span>
            {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-10 text-center text-sm">
          <span className="text-slate-500 font-medium tracking-tight">Đã có tài khoản?</span>{" "}
          <Link href="/login" className="text-yellow-500 font-bold hover:text-yellow-400 transition-colors ml-2">Đăng nhập</Link>
        </div>
      </motion.div>

      {/* Mini footer for auth pages */}
      <div className="mt-20 flex space-x-8 text-[10px] font-bold tracking-widest text-slate-600 group">
        <Link href="/privacy" className="hover:text-slate-400 transition">CHÍNH SÁCH BẢO MẬT</Link>
        <Link href="/terms" className="hover:text-slate-400 transition">ĐIỀU KHOẢN DỊCH VỤ</Link>
        <Link href="/support" className="hover:text-slate-400 transition">TRUNG TÂM TRỢ GIÚP</Link>
      </div>
      <p className="mt-6 text-[10px] font-medium text-slate-700 uppercase tracking-widest">© 2024 DIGITAL ATELIER. BẢO LƯU MỌI QUYỀN.</p>
    </div>
  );
};

export default RegisterPage;
