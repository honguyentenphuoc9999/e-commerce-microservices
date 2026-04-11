"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center p-6 bg-[linear-gradient(135deg,_#050816_0%_35%,_#1e1b4b_100%)] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-pattern.svg')] bg-[size:100px_100px] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg glass-card p-12 rounded-3xl z-10 border border-white/5 shadow-2xl bg-black/30 backdrop-blur-3xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">Khôi phục tài khoản</h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Nhập địa chỉ email được liên kết với tài khoản của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Địa chỉ Email</label>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="email@cua-ban.com" 
                className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-300 placeholder:text-slate-700"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full premium-btn py-4 rounded-xl font-bold flex items-center justify-center space-x-2 text-white group mt-10 transition-all active:scale-[0.98]"
          >
            <Mail className="h-5 w-5 mr-1" />
            <span>Gửi liên kết đặt lại</span>
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link href="/login" className="flex items-center justify-center space-x-2 text-[10px] font-bold tracking-[0.2em] text-slate-400 hover:text-white transition group uppercase">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại đăng nhập</span>
          </Link>
        </div>
      </motion.div>

      <div className="mt-24 flex space-x-10 text-[10px] font-bold tracking-[0.15em] text-slate-600">
        <Link href="/privacy" className="hover:text-slate-400 transition">CHÍNH SÁCH BẢO MẬT</Link>
        <Link href="/terms" className="hover:text-slate-400 transition">ĐIỀU KHOẢN DỊCH VỤ</Link>
        <Link href="/support" className="hover:text-slate-400 transition">LIÊN HỆ HỖ TRỢ</Link>
      </div>
      <p className="mt-6 text-[10px] font-medium text-slate-700 uppercase tracking-widest">© 2024 DIGITAL ATELIER. BẢO LƯU MỌI QUYỀN.</p>
    </div>
  );
};

export default ForgotPasswordPage;
