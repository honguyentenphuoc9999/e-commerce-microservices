import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full py-12 px-8 bg-[#0b1326] border-t border-[#45464d]/15 font-body text-xs tracking-wide uppercase mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-[1440px] mx-auto">
        {/* Brand/Logo Info */}
        <div className="flex flex-col gap-4 text-center md:text-left">
          <Link href="/" className="inline-block mb-2">
            <img 
              src="https://res.cloudinary.com/de0de4yum/image/upload/v1776774968/logo_yc7qyw.png" 
              alt="Phuoc Techno Logo" 
              className="h-10 w-auto object-contain mx-auto md:mx-0 opacity-80"
            />
          </Link>
          <div className="text-sm font-bold text-[#bec6e0] tracking-tighter uppercase">Phuoc Techno</div>
          <p className="text-[#c6c6cd] normal-case max-w-xs tracking-normal">
            Kiến tạo tương lai của công nghệ cá nhân thông qua thiết kế tinh xảo và hiệu suất vô song.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 text-[11px]">
          <Link href="/privacy" className="text-[#c6c6cd] hover:text-[#bec6e0] transition-all duration-300 hover:underline decoration-[#e9c349] underline-offset-4">Chính Sách Bảo Mật</Link>
          <Link href="/terms" className="text-[#c6c6cd] hover:text-[#bec6e0] transition-all duration-300 hover:underline decoration-[#e9c349] underline-offset-4">Điều Khoản Dịch Vụ</Link>
          <Link href="/shipping" className="text-[#c6c6cd] hover:text-[#bec6e0] transition-all duration-300 hover:underline decoration-[#e9c349] underline-offset-4">Giao Hàng & Hoàn Trả</Link>
          <Link href="/sustainability" className="text-[#c6c6cd] hover:text-[#bec6e0] transition-all duration-300 hover:underline decoration-[#e9c349] underline-offset-4">Tính Bền Vững</Link>
        </div>

        {/* Copyright */}
        <div className="text-[#c6c6cd] font-semibold text-[10px] tracking-widest text-center">
          © 2026 Phuoc Techno. BẢO LƯU MỌI QUYỀN.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
