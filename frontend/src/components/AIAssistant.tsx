"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles, ShoppingCart, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

interface ProductItem {
  id: number;
  productName: string;
  price: number;
  image?: string;
  category?: { categoryName: string };
  availability: number;
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
  products?: ProductItem[];
}

const STORAGE_KEY = "phuoc_ai_chat";
const TTL_MS = 5 * 60 * 1000; // 5 phút

const DEFAULT_GREETING: Message = {
  id: "1",
  sender: "bot",
  text: "Xin chào! Mình là **PHUOC AI** 🤖, trợ lý của PHUOC TECHNO. Mình có thể tư vấn sản phẩm, so sánh giá và gợi ý phù hợp cho bạn! Bạn đang tìm gì hôm nay?",
  timestamp: new Date(),
};

export default function AIAssistant() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([DEFAULT_GREETING]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fix hydration: chỉ load từ sessionStorage sau khi mount ở client
  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { messages: saved, isOpen: savedOpen, savedAt } = JSON.parse(raw);
        if (Date.now() - savedAt < TTL_MS) {
          setMessages(saved.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
          setIsOpen(savedOpen ?? false);
          return;
        }
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch { }
  }, []);

  // Lưu vào sessionStorage mỗi khi thay đổi
  useEffect(() => {
    if (!mounted) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, isOpen, savedAt: Date.now() }));
    } catch { }
  }, [messages, isOpen, mounted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleNewChat = () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { }
    setMessages([{ ...DEFAULT_GREETING, timestamp: new Date() }]);
    setInputValue("");
    setIsTyping(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const conversationHistory = updatedMessages.filter((m) => m.id !== "1");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "API response error");

      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.text || "Xin lỗi, mình chưa hiểu ý bạn lắm.",
        timestamp: new Date(),
        products: data.suggestedProducts || [],
      };
      setMessages((prev) => [...prev, newBotMsg]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: error.message || "Xin lỗi, kết nối AI đang bị gián đoạn. Bạn thử lại sau nhé!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-white/10 flex items-center justify-center overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
            <MessageSquare className="w-6 h-6 relative z-10" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#020617]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[390px] h-[620px] max-h-[85vh] flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0f1c]/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0f1c]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1">
                    PHUOC AI <Sparkles className="w-3 h-3 text-yellow-400" />
                  </h3>
                  <p className="text-xs text-blue-400 font-medium">Trợ lý mua sắm 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  title="Tạo cuộc trò chuyện mới"
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[88%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1">
                      {msg.sender === "bot" ? (
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                          <Bot className="w-4 h-4 text-blue-400" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                          <User className="w-4 h-4 text-yellow-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Text Bubble */}
                      <div
                        className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === "user"
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm"
                          : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"
                          }`}
                      >
                        {msg.sender === "bot" ? (
                          <ReactMarkdown
                            components={{
                              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        ) : (
                          msg.text
                        )}
                        <div className={`text-[10px] mt-1 opacity-50 ${msg.sender === "user" ? "text-right" : ""}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      {/* Product Cards */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {msg.products.map((product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.id}`}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                            >
                              {/* Product Image */}
                              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/placeholder-product.png";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-slate-500" />
                                  </div>
                                )}
                              </div>
                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                                  {product.productName}
                                </p>
                                <p className="text-xs text-blue-400 font-bold mt-0.5">
                                  {Number(product.price).toLocaleString("vi-VN")}đ
                                </p>
                                <p className={`text-[10px] mt-0.5 ${product.availability > 0 ? "text-green-400" : "text-red-400"}`}>
                                  {product.availability > 0 ? "● Còn hàng" : "● Hết hàng"}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-1">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay }}
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0a0f1c] border-t border-white/5">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 bg-[#020617] p-1.5 rounded-xl border border-white/10 focus-within:border-blue-500/50 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Hỏi về sản phẩm..."
                  className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-white placeholder-slate-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(79,70,229,0.4)] transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                  Được tư vấn bởi Trí Tuệ Nhân Tạo
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
