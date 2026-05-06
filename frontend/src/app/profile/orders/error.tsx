"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("OrderHistory Crash:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-[#131b2e] p-8 rounded-[2rem] border border-red-500/20 max-w-2xl mx-auto mt-12 shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border-4 border-red-500/20 text-red-500 flex items-center justify-center mb-4">
        <span className="text-3xl font-black">X</span>
      </div>
      <h2 className="text-2xl font-black text-white italic">Đã xảy ra lỗi giao diện!</h2>
      <p className="text-rose-400 font-mono text-sm bg-black/40 p-4 rounded-xl w-full break-words">
        {error.message || "Unknown React Rendering Error"}
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3 bg-[#e9c349] text-[#0b1326] font-black uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-transform mt-4"
      >
        Tải lại trang
      </button>
    </div>
  );
}
