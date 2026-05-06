"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/accounts/forgot-password", { email });
      setIsSent(true);
      toast.success("Yêu cầu đã được gửi!");
    } catch (error: any) {
      console.error("Forgot password error", error);
      const msg = error.response?.data || "Đã xảy ra lỗi, vui lòng thử lại";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col" suppressHydrationWarning>
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-[linear-gradient(135deg,_#050816_0%_35%,_#1e1b4b_100%)] relative overflow-hidden pt-32 pb-24">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-pattern.svg')] bg-[size:100px_100px] opacity-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-lg glass-card p-12 rounded-3xl z-10 border border-white/5 shadow-2xl bg-black/30 backdrop-blur-3xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">
              {isSent ? "Kiểm tra Email" : "Khôi phục tài khoản"}
            </h1>
            <p className="text-slate-400 font-medium leading-relaxed">
              {isSent 
                ? `Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến ${email}. Vui lòng kiểm tra hộp thư đến của bạn.`
                : "Nhập địa chỉ email được liên kết với tài khoản của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu."}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Địa chỉ Email</label>
                <div className="relative group">
                  <input
                    suppressHydrationWarning
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@cua-ban.com"
                    className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-700"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                suppressHydrationWarning
                type="submit"
                disabled={isLoading}
                className="w-full premium-btn py-4 rounded-xl font-bold flex items-center justify-center space-x-2 text-white group mt-10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-1" />
                    <span>Gửi liên kết đặt lại</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center space-y-6 py-4">
               <div className="p-4 bg-emerald-500/10 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
               </div>
               <button 
                  suppressHydrationWarning
                  onClick={() => setIsSent(false)}
                  className="text-sm font-bold text-blue-400 hover:text-blue-300 transition"
                >
                  Gửi lại email khác
               </button>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/login" className="flex items-center justify-center space-x-2 text-[10px] font-bold tracking-[0.2em] text-slate-400 hover:text-white transition group uppercase">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại đăng nhập</span>
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
