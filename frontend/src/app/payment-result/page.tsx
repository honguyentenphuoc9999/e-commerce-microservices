"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");

  const isSuccess = status === "success";
  const isCancelled = status === "cancelled";

  // Xóa dữ liệu cũ khi đã có kết quả thanh toán (Dùng sessionStorage)
  useEffect(() => {
    sessionStorage.removeItem("pendingPayment");
    sessionStorage.removeItem("pendingOrderId");
    sessionStorage.removeItem("checkoutFormData");
    sessionStorage.removeItem("selectedCartItemIds");
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <section className="bg-[#131b2e]/70 border border-white/10 rounded-[2rem] shadow-2xl p-8 md:p-12 text-center">
            <div
              className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 ${isSuccess
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                : "border-red-500/50 bg-red-500/15 text-red-400"
                }`}
            >
              <span className="text-3xl font-black">{isSuccess ? "OK" : "X"}</span>
            </div>

            <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight">
              {isSuccess
                ? "Thanh toán thành công"
                : "Thanh toán thất bại"}
            </h1>

            <p className="mt-4 text-slate-300 text-base md:text-lg leading-relaxed">
              {isSuccess
                ? `Đơn hàng #${orderId || "N/A"} đã được ghi nhận và đang được xử lý.`
                : "Giao dịch không thành công. Vui lòng kiểm tra lại thông tin và thanh toán sau."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                href="/profile/orders"
                className="rounded-2xl bg-[#e9c349] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#0b1326] transition-transform hover:scale-[1.02]"
              >
                Xem đơn hàng
              </Link>
              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
              >
                Tiếp tục mua sắm
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-white/5 bg-[#0b1326]/60 p-5 text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Chi tiết</p>
              <p className="mt-3 text-sm text-slate-300">
                Trạng thái: <span className="font-bold text-white">{status || "unknown"}</span>
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Order ID: <span className="font-bold text-white">{orderId || "N/A"}</span>
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
