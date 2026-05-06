"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!token && isMounted) {
      toast.error("Liên kết không hợp lệ hoặc đã hết hạn");
      router.push("/login");
    }
  }, [token, router, isMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/accounts/reset-password", { token, newPassword: password });
      setIsSuccess(true);
      toast.success("Mật khẩu của bạn đã được cập nhật!");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      console.error("Reset password error", error);
      toast.error(error.response?.data || "Lỗi khi đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 bg-[linear-gradient(135deg,_#050816_0%_35%,_#1e1b4b_100%)] relative overflow-hidden pt-32 pb-24" suppressHydrationWarning>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-pattern.svg')] bg-[size:100px_100px] opacity-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg glass-card p-12 rounded-3xl z-10 border border-white/5 shadow-2xl bg-black/30 backdrop-blur-3xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-white uppercase italic">
            {isSuccess ? "Thành công" : "Đặt lại mật khẩu"}
          </h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            {isSuccess 
              ? "Mật khẩu của bạn đã được thay đổi thành công. Bạn sẽ được chuyển hướng về trang đăng nhập sau vài giây."
              : "Vui lòng nhập mật khẩu mới cho tài khoản của bạn. Đảm bảo mật khẩu đủ mạnh để bảo vệ tài khoản."}
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Mật khẩu mới</label>
              <div className="relative group">
                <input
                  suppressHydrationWarning
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050816] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-medium text-white pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Xác nhận mật khẩu</label>
              <div className="relative group">
                <input
                  suppressHydrationWarning
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#050816] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-medium text-white pr-14"
                  required
                />
              </div>
            </div>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e9c349] text-[#0b1326] py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-2 group mt-10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(233,195,73,0.2)]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <>
                  <span>Cập nhật mật khẩu</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center space-y-8 py-4">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20"
             >
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
             </motion.div>
             <Link 
                href="/login"
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-sm font-bold transition-all border border-white/10"
              >
                Đăng nhập ngay
             </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen bg-[#050816] flex flex-col">
      <Header />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin text-[#e9c349]" />
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
