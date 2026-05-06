"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalogService";
import { blogService } from "@/services/blogService";

const HomePage = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const card = scrollRef.current.firstElementChild as HTMLElement;
      if (card) {
        const cardWidth = card.clientWidth + 32; // Width of one card + 32px gap
        const { scrollLeft } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - cardWidth : scrollLeft + cardWidth;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    }
  };

  const { data: featuredProductsData, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => catalogService.getProducts()
  });
  const featuredProducts = featuredProductsData?.content || [];

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogService.getCategories()
  });
  const categories = categoriesData?.content || [];

  const { data: articlesData, isLoading: latestArticlesLoading } = useQuery({
    queryKey: ['latest-articles'],
    queryFn: () => blogService.getPublishedArticles()
  });
  const latestArticles = articlesData?.content || [];

  return (
    <div className="min-h-screen bg-[#050816] selection:bg-blue-500 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 bg-[#e9c349]/10 border border-[#e9c349]/20 text-[#e9c349] text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">
              Hệ Sinh Thái Phuoc Techno 2026
            </div>
            <h1 className="text-7xl lg:text-8xl font-bold tracking-tighter leading-tight text-white transition-all">
              Đỉnh Cao Công Nghệ. <br />
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-xl font-medium">
              Chuyên cung cấp các dòng laptop hi-end, linh kiện PC cao cấp và thiết bị công nghệ chính hãng. Nâng tầm không gian làm việc và giải trí của bạn.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/collections" className="bg-[#e9c349] hover:bg-yellow-400 text-black px-10 py-5 rounded-xl font-bold shadow-[0_0_20px_rgba(233,195,73,0.3)] hover:shadow-[0_0_30px_rgba(233,195,73,0.5)] active:scale-95 transition-all text-sm uppercase tracking-widest">
                Mua Sắm Ngay
              </Link>
              <Link href={`/collections?category=${encodeURIComponent("Laptop & PC")}`} className="bg-white/5 border border-white/10 hover:bg-white/10 px-10 py-5 rounded-xl font-bold text-white backdrop-blur transition-all text-sm uppercase tracking-widest">
                Laptop & PC Cao Cấp
              </Link>
            </div>
          </div>

          <div className="relative h-[600px] w-full lg:w-[130%] lg:-ml-[15%] flex items-center justify-center group overflow-hidden">
            {/* Gradient hòa trộn tự nhiên ở 4 cạnh nhưng KHÔNG làm mờ tâm ảnh */}
            <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#050816] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050816] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#050816] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050816] to-transparent z-10 pointer-events-none" />

            <img
              src="https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"
              alt="Hero Device"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
          </div>
        </div>
      </section>


      {/* Category Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold tracking-tighter text-white">Khám phá Danh Mục</h2>
              <p className="text-slate-400 font-medium">Phân loại sản phẩm theo tiêu chuẩn chất lượng cao nhất của Phuoc Techno.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => scroll('left')}
                suppressHydrationWarning
                className="p-3 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-white transition active:scale-90"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                suppressHydrationWarning
                className="p-3 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-white transition active:scale-90"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth py-4"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {categories.length === 0 ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 min-w-[280px] h-[450px] rounded-[32px] bg-white/5 animate-pulse" />
              ))
            ) : (
              categories.map((cat: any) => {
                const bgImage = cat.image || "";

                return (
                  <motion.div
                    key={cat.id}
                    whileHover={{ y: -10 }}
                    style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    className="relative flex-shrink-0 w-[calc((100%-96px)/4)] h-[480px] rounded-[32px] overflow-hidden group border border-white/5 flex flex-col justify-end p-8 cursor-pointer text-white shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-all group-hover:via-black/20" />

                    <div className="relative z-10 space-y-2">
                      <h3 className="text-2xl font-bold tracking-tight uppercase leading-none">{cat.categoryName}</h3>
                      <p className="font-medium opacity-70 text-[10px] line-clamp-2">{cat.description || "Khám phá các sản phẩm tinh hoa."}</p>
                      <Link href={`/collections?category=${encodeURIComponent(cat.categoryName)}`} className="inline-flex items-center pt-2 text-[9px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform group text-[#e9c349]">
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
            <h2 className="text-5xl font-bold tracking-tighter">Sản Phẩm Nổi Bật</h2>
            <p className="text-slate-400 font-medium">Những sản phẩm được săn đón nhất của chúng tôi, được tuyển chọn vì hiệu suất vượt trội và thẩm mỹ vượt thời gian.</p>
          </div>
          <div className="hidden md:flex">
            <Link href="/collections" className="flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all">
              Xem tất cả sản phẩm
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {productsLoading ? (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-20 text-[#c6c6cd]">
              <div className="w-8 h-8 rounded-full border-4 border-[#e9c349] border-t-transparent animate-spin mx-auto"></div>
            </div>
          ) : (
            featuredProducts.slice(0, 4).map((p: any) => (
              <ProductCard
                key={p.id}
                id={p.id.toString()}
                name={p.productName}
                price={`${p.price.toLocaleString()}đ`}
                category={p.category?.categoryName || ""}
                image={p.image || ""}
              />
            ))
          )}
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold tracking-tighter">Tin Tức Công Nghệ</h2>
              <p className="text-slate-400 font-medium">Cập nhật những xu hướng và bài viết mới nhất từ Phuoc Techno.</p>
            </div>
            <Link href="/blog" className="flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all">
              Xem tất cả bài viết
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {latestArticlesLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-[400px] bg-white/5 rounded-[32px] animate-pulse" />
              ))
            ) : (
              latestArticles.slice(0, 3).map((article: any) => (
                <Link key={article.id} href={`/blog/${article.id}`} className="group space-y-6">
                  <div className="relative h-[280px] overflow-hidden rounded-[32px] border border-white/5 group-hover:border-[#e9c349]/30 transition-all">
                    {article.thumbnailUrl ? (
                      <img
                        src={article.thumbnailUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5" />
                    )}
                  </div>
                  <div className="space-y-3 px-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#e9c349]">
                      {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <h3 className="text-2xl font-bold leading-tight group-hover:text-[#e9c349] transition-colors line-clamp-2 break-all">{article.title}</h3>
                    <p className="text-slate-400 line-clamp-2 text-sm">{article.content.replace(/<[^>]*>?/gm, '')}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
