"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Monitor, Smartphone, Tablet, Watch, Diamond } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalogService";

const HomePage = () => {
  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => catalogService.getProducts()
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogService.getCategories()
  });

  return (
    <div className="min-h-screen bg-[#050816] selection:bg-blue-500 selection:text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-block px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">
              Phiên bản 2024 đã ra mắt
            </div>
            <h1 className="text-7xl lg:text-8xl font-bold tracking-tighter leading-none text-white transition-all">
              Chính Xác Kết Hợp <br /> <span className="text-slate-500">Nghệ Thuật Số.</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
              Tuyển chọn các công nghệ hiệu năng cao được thiết kế cho những nhà sáng tạo hiện đại. Trải nghiệm sự tĩnh lặng tuyệt đối và đỉnh cao của tiện ích.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/collections" className="premium-btn px-10 py-5 rounded-xl font-bold text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                Khám Phá Kho Lưu Trữ
              </Link>
              <Link href="/collections" className="bg-white/5 border border-white/10 hover:bg-white/10 px-10 py-5 rounded-xl font-bold text-white backdrop-blur transition-all">
                Xem Bộ Sưu Tập
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative h-[600px] w-full rounded-[40px] overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-blue-600/10 z-10 hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent z-10" />
            
            {/* Placeholder image representation (using box for design purpose) */}
            <div className="w-full h-full bg-[#111] border border-white/5 relative overflow-hidden flex items-center justify-center p-12">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-80" />
               <div className="relative z-10 text-center">
                  <h3 className="text-white font-bold text-2xl tracking-widest uppercase mb-4">Zenith Air Pro</h3>
                  <p className="text-slate-400 font-medium">Bản giao hưởng của hiệu suất và thiết kế.</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee Info */}
      <section className="py-4 border-y border-white/5 bg-black/40 overflow-hidden relative">
        <div className="flex items-center space-x-20 whitespace-nowrap animate-marquee text-[11px] font-bold tracking-[0.3em] text-slate-500 uppercase">
          <span>Phát hành độc quyền: Zenith Pro</span>
          <span>•</span>
          <span>Miễn phí giao hàng toàn cầu cho các sản phẩm lưu trữ</span>
          <span>•</span>
          <span>Kiến trúc tản nhiệt thế hệ mới</span>
          <span>•</span>
          <span>Dịch vụ hỗ trợ 24/7 cho nghệ sĩ số</span>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-sm font-black text-[#e9c349] uppercase tracking-[0.4em] mb-12 text-center">Khám phá Danh Mục</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.length === 0 ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-[500px] rounded-[32px] bg-white/5 animate-pulse" />
              ))
            ) : (
              categories.slice(0, 3).map((cat: any, idx: number) => {
                const colors = [
                  "from-slate-400 to-slate-200",
                  "from-blue-600 to-blue-400", 
                  "from-slate-700 to-slate-900",
                  "from-emerald-600 to-emerald-400",
                  "from-amber-600 to-amber-400"
                ];
                const icons = [Monitor, Smartphone, Tablet, Watch, Diamond];
                const Icon = icons[idx % icons.length];
                
                return (
                  <motion.div 
                    key={cat.id}
                    whileHover={{ y: -10 }}
                    className={`relative h-[500px] rounded-[32px] overflow-hidden group border border-white/5 bg-gradient-to-br ${colors[idx % colors.length]} flex flex-col justify-end p-10 cursor-pointer text-black`}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                    <div className="absolute top-10 left-10 p-4 rounded-2xl bg-black/10 backdrop-blur-3xl text-white">
                      <Icon size={24} />
                    </div>
                    <div className="relative z-10 space-y-2">
                      <h3 className="text-3xl font-bold tracking-tight italic">{cat.categoryName}</h3>
                      <p className="font-medium opacity-80 text-sm max-w-[200px]">{cat.description || "Khám phá các sản phẩm tinh hoa trong bộ sưu tập này."}</p>
                      <Link href={`/collections?category=${cat.categoryName}`} className="inline-flex items-center pt-4 text-[10px] font-extrabold uppercase tracking-widest hover:translate-x-1 transition-transform group">
                        Xem danh mục <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-6 container mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tighter">Tuyệt Tác Nổi Bật</h2>
            <p className="text-slate-400 font-medium">Những sản phẩm được săn đón nhất của chúng tôi, được tuyển chọn vì hiệu suất vượt trội và thẩm mỹ vượt thời gian.</p>
          </div>
          <div className="hidden md:flex space-x-4">
             <button className="p-4 rounded-full border border-white/10 hover:bg-white/10 transition" suppressHydrationWarning><ChevronLeft /></button>
             <button className="p-4 rounded-full border border-white/10 hover:bg-white/10 transition" suppressHydrationWarning><ChevronRight /></button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
        >
          {productsLoading ? (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-20 text-[#c6c6cd]">
               <div className="w-8 h-8 rounded-full border-4 border-[#e9c349] border-t-transparent animate-spin mx-auto"></div>
            </div>
          ) : (
            featuredProducts.slice(0, 4).map((p) => (
              <ProductCard 
                key={p.id} 
                id={p.id.toString()}
                name={p.productName}
                price={`${p.price.toLocaleString()}đ`}
                category={p.category?.categoryName || "N/A"}
                image={p.image || "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800"} 
              />
            ))
          )}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
