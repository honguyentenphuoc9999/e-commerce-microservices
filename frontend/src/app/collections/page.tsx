"use client";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Search, Grid, LayoutList, ChevronLeft, ChevronRight, Home, Compass, ShoppingBag, User } from "lucide-react";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalogService";

function CollectionsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogService.getCategories
  });

  const { data: productsData = [], isLoading } = useQuery({
    queryKey: ['products', categoryParam, searchTerm],
    queryFn: () => catalogService.getProducts({ 
      category: categoryParam || undefined, 
      name: searchTerm || undefined 
    })
  });

  return (
    <div className="bg-[#0b1326] min-h-screen text-[#dae2fd]">
      <Header />
      
      <main className="pt-28 pb-20 max-w-[1440px] mx-auto px-8 flex gap-8">
        {/* Sidebar Filters */}
        <aside className="w-72 flex-shrink-0 hidden lg:block sticky top-28 h-[calc(100vh-8rem)]">
          <div className="flex flex-col gap-10">
            {/* Search */}
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-lg text-[#bec6e0] tracking-tight text-white/90">Khám Phá</h3>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tên sản phẩm..."
                  className="w-full bg-[#131b2e] border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#e9c349]/20 placeholder:text-[#c6c6cd]/40"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c6c6cd] w-4 h-4" />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-[#c6c6cd]/60">Bộ Sưu Tập</h3>
              <div className="flex flex-col gap-1">
                <Link 
                  href="/collections" 
                  className={`flex items-center justify-between group px-4 py-2.5 rounded-xl transition-all ${!categoryParam ? 'bg-[#2d3449] text-[#e9c349]' : 'hover:bg-[#131b2e]'}`}
                >
                  <span className={`font-medium ${!categoryParam ? 'text-[#e9c349]' : 'text-[#c6c6cd] group-hover:text-[#bec6e0]'}`}>
                    Tất Cả Sản Phẩm
                  </span>
                </Link>
                {categoriesData.map((cat, i) => (
                  <Link 
                    key={cat.id || i} 
                    href={`/collections?category=${cat.categoryName}`}
                    className={`flex items-center justify-between group px-4 py-2.5 rounded-xl transition-all ${categoryParam === cat.categoryName ? 'bg-[#2d3449] text-[#e9c349]' : 'hover:bg-[#131b2e]'}`}
                  >
                    <span className={`font-medium ${categoryParam === cat.categoryName ? 'text-[#e9c349]' : 'text-[#c6c6cd] group-hover:text-[#bec6e0]'}`}>
                      {cat.categoryName}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-6">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-[#c6c6cd]/60">Mức Giá</h3>
              <div className="px-2">
                <div className="h-1.5 w-full bg-[#222a3d] rounded-full relative">
                  <div className="absolute left-0 right-1/4 h-full bg-linear-to-r from-[#bec6e0] to-[#e9c349] rounded-full"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-[#bec6e0] cursor-pointer"></div>
                  <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-[#e9c349] cursor-pointer"></div>
                </div>
                <div className="flex justify-between mt-4 text-xs font-mono text-[#c6c6cd]">
                  <span>0đ</span>
                  <span>2.500.000đ</span>
                </div>
              </div>
            </div>

            {/* Workshop Selection */}
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-[#c6c6cd]/60">Xưởng Thiết Kế</h3>
              <div className="flex flex-wrap gap-2">
                {["Milan", "Copenhagen", "Paris", "Tokyo"].map((city, i) => (
                  <span 
                    key={i} 
                    className={`px-3 py-1.5 rounded-full text-xs border cursor-pointer transition-colors ${city === 'Paris' ? 'bg-[#e9c349]/10 border-[#e9c349]/30 text-[#e9c349]' : 'bg-[#131b2e] border-white/10 text-[#c6c6cd] hover:border-[#e9c349]'}`}
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-grow">
          {/* Page Title & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h1 className="font-headline text-4xl font-extrabold text-[#dae2fd] tracking-tight mb-2 uppercase italic">{categoryParam || "Tất cả sản phẩm"}</h1>
              <p className="text-[#c6c6cd]">Khám phá các tác phẩm độc bản dành cho người theo đuổi phong cách tối giản hiện đại.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-[#131b2e] p-1 rounded-xl">
                <button className="p-2 rounded-lg bg-[#222a3d] text-[#bec6e0]"><Grid size={20} /></button>
                <button className="p-2 rounded-lg text-[#c6c6cd]/40 hover:text-[#c6c6cd]"><LayoutList size={20} /></button>
              </div>
              <button className="flex items-center gap-3 px-5 py-2.5 bg-[#222a3d] rounded-xl text-sm font-medium border border-white/5 hover:border-[#bec6e0]/30 transition-all">
                <span>Sắp xếp: Phù hợp nhất</span>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="py-20 text-center flex justify-center text-[#c6c6cd]">
               <div className="w-8 h-8 rounded-full border-4 border-[#e9c349] border-t-transparent animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {productsData.map((p) => (
                <ProductCard 
                  key={p.id} 
                  id={p.id.toString()}
                  name={p.productName}
                  price={`${p.price.toLocaleString()}đ`}
                  category={p.category?.categoryName || ""}
                  image={p.image || ""} 
                />
              ))}
              {productsData.length === 0 && (
                <div className="col-span-3 text-center py-20 text-white/50">Không tìm thấy sản phẩm nào phù hợp.</div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-20 flex justify-center items-center gap-4">
            <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#c6c6cd] hover:border-[#bec6e0] transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-full bg-[#bec6e0] text-[#131b2e] font-bold">1</button>
              <button className="w-12 h-12 rounded-full hover:bg-[#222a3d] transition-all font-bold">2</button>
              <button className="w-12 h-12 rounded-full hover:bg-[#222a3d] transition-all font-bold">3</button>
              <span className="w-12 h-12 flex items-center justify-center opacity-40">...</span>
              <button className="w-12 h-12 rounded-full hover:bg-[#222a3d] transition-all font-bold">12</button>
            </div>
            <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#c6c6cd] hover:border-[#bec6e0] transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b1326] flex items-center justify-center text-white font-headline">Đang tải bộ sưu tập...</div>}>
      <CollectionsContent />
    </Suspense>
  );
}
