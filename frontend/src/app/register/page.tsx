"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { toast } from "sonner";

const RegisterPage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ userName?: string; email?: string; phoneNumber?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

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
        userDetails: { firstName, lastName, email, phoneNumber },
        role: { id: 1 } // ROLE_USER
      });

      toast.success("Tạo tài khoản thành công! Bạn có thể đăng nhập ngay.");
      router.push("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "";
      setError(msg || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
      
      const newErrors: any = {};
      if (msg.includes("TÊN ĐĂNG NHẬP")) {
        newErrors.userName = "Tên đăng nhập này đã được sử dụng.";
      }
      if (msg.includes("EMAIL")) {
        newErrors.email = "Email này đã được sử dụng.";
      }
      if (msg.includes("SỐ ĐIỆN THOẠI")) {
        newErrors.phoneNumber = "Số điện thoại này đã được sử dụng.";
      }
      setFieldErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 bg-[url('/bg-abstract.png')] bg-cover bg-center">
      <div className="text-center mb-10 group">
        <Link href="/" className="inline-block mb-6">
          <img 
            src="https://res.cloudinary.com/de0de4yum/image/upload/v1776774968/logo_yc7qyw.png" 
            alt="Phuoc Techno Logo" 
            className="h-16 w-auto object-contain mx-auto hover:scale-105 transition-transform"
          />
        </Link>
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-white">Phuoc Techno</h1>
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
                onChange={(e) => {
                  setUserName(e.target.value);
                  if (fieldErrors.userName) setFieldErrors({ ...fieldErrors, userName: undefined });
                }}
                placeholder="alex99..."
                suppressHydrationWarning
                className={`w-full bg-[#050816] border ${fieldErrors.userName ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-white/10'} rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600`}
              />
              {fieldErrors.userName && <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-top-1">{fieldErrors.userName}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Họ và Tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alexander Thorne"
                suppressHydrationWarning
                className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Địa chỉ Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                placeholder="atelier@studio.com"
                suppressHydrationWarning
                className={`w-full bg-[#050816] border ${fieldErrors.email ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-white/10'} rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600`}
              />
              {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-top-1">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Số điện thoại</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (fieldErrors.phoneNumber) setFieldErrors({ ...fieldErrors, phoneNumber: undefined });
                }}
                placeholder="09xx.xxx.xxx"
                suppressHydrationWarning
                className={`w-full bg-[#050816] border ${fieldErrors.phoneNumber ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-white/10'} rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600`}
              />
              {fieldErrors.phoneNumber && <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-top-1">{fieldErrors.phoneNumber}</p>}
            </div>
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
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  suppressHydrationWarning
                  className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  suppressHydrationWarning
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
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              suppressHydrationWarning
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500/50 transition-all cursor-pointer"
            />
            <span className="text-xs text-slate-400 font-medium cursor-pointer" onClick={() => setAgreed(!agreed)}>
              Tôi đồng ý với <Link href="/terms" className="text-yellow-500/80 hover:text-yellow-500 hover:underline" onClick={(e) => e.stopPropagation()}>Điều khoản Dịch vụ</Link> và <Link href="/privacy" className="text-yellow-500/80 hover:text-yellow-500 hover:underline" onClick={(e) => e.stopPropagation()}>Chính sách Bảo mật</Link>.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !agreed}
            suppressHydrationWarning
            className="w-full premium-btn py-4 rounded-xl font-bold flex items-center justify-center space-x-2 text-white group mt-10 transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale disabled:brightness-50 disabled:cursor-not-allowed"
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
      <p className="mt-6 text-[10px] font-medium text-slate-700 uppercase tracking-widest">© 2026 Phuoc Techno. BẢO LƯU MỌI QUYỀN.</p>
    </div>
  );
};

export default RegisterPage;
