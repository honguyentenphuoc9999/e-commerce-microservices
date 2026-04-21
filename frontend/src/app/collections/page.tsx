"use client";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Search, Grid, LayoutList, ChevronLeft, ChevronRight } from "lucide-react";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalogService";

function CollectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = searchParams.get("category");
  const nameParam = searchParams.get("name");
  
  const [sortBy, setSortBy] = useState("relevant"); // "relevant", "price-asc", "price-desc"

  // Hàm helper để xây dựng URL giữ nguyên các filter hiện tại
  const getFilterUrl = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    return `/collections?${params.toString()}`;
  };

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogService.getCategories
  });

  const { data: productsData = [], isLoading } = useQuery({
    queryKey: ['products', categoryParam, nameParam], 
    queryFn: () => catalogService.getProducts({ 
      category: categoryParam || undefined, 
      name: nameParam || undefined
    })
  });

  // Fetch TẤT CẢ sản phẩm khớp với từ khóa (không quan tâm category) để lấy danh sách category đầy đủ
  const { data: allSearchProducts = [] } = useQuery({
    queryKey: ['all-search-products', nameParam],
    queryFn: () => catalogService.getProducts({ 
      name: nameParam || undefined
    }),
    enabled: !!nameParam 
  });

  // Extract unique categories from all search results
  const relevantCategories = React.useMemo(() => {
    const source = (nameParam ? allSearchProducts : categoriesData);
    if (!source || !Array.isArray(source)) return [];
    
    const cats = new Map();
    if (nameParam) {
      // Nếu đang search, lấy category từ danh sách sản phẩm khớp từ khóa
      (source as any[]).forEach(p => {
        if (p.category) {
          cats.set(p.category.id, p.category);
        }
      });
    } else {
      // Nếu không search, lấy toàn bộ category từ categoriesData
      (source as any[]).forEach(c => cats.set(c.id, c));
    }
    return Array.from(cats.values());
  }, [nameParam, allSearchProducts, categoriesData]);

  // Sort productsData based on sortBy
  const sortedProducts = React.useMemo(() => {
    if (!productsData || !Array.isArray(productsData)) return [];
    const list = [...productsData];
    if (sortBy === "price-asc") {
      return list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      return list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [productsData, sortBy]);

  return (
    <div className="bg-[#0b1326] min-h-screen text-[#dae2fd]">
      <Header />
      
      <main className="pt-28 pb-20 max-w-[1440px] mx-auto px-8">

        {/* Content Area */}
        <section className="flex-grow">
          {/* Page Title & Controls */}
          {/* Search Result Summary - Centered */}
          {nameParam && (
            <div className="flex justify-center mb-8">
              <div className="px-6 py-2.5 bg-[#131b2e] border-l-4 border-[#e9c349] rounded-r-lg inline-flex items-center shadow-lg">
                <p className="text-sm text-[#dae2fd]">
                  Tìm thấy <span className="text-[#e9c349] font-bold">{(Array.isArray(productsData) ? productsData.length : 0)}</span> sản phẩm cho từ khoá <span className="text-white font-medium">'{nameParam}'</span>
                </p>
              </div>
            </div>
          )}
          
          {/* Relevant Category Chips & Sorting - Left aligned */}
          {productsData.length > 0 && (
            <div className="mb-14 space-y-8">
              <div className="flex flex-wrap justify-start gap-3">
                <Link 
                  href={getFilterUrl({ category: null })}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all border ${!categoryParam ? 'bg-[#e9c349] text-[#0b1326] border-[#e9c349]' : 'bg-[#131b2e] text-[#c6c6cd] border-white/5 hover:border-[#e9c349]/50'}`}
                >
                  Tất cả
                </Link>
                {relevantCategories.map(cat => (
                  <Link 
                    key={cat.id}
                    href={getFilterUrl({ category: cat.categoryName })}
                    className={`px-6 py-2 rounded-xl text-sm font-medium transition-all border ${categoryParam?.toLowerCase() === cat.categoryName.toLowerCase() ? 'bg-[#e9c349] text-[#0b1326] border-[#e9c349]' : 'bg-[#131b2e] text-[#c6c6cd] border-white/5 hover:border-[#e9c349]/50'}`}
                  >
                    {cat.categoryName}
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap justify-start items-center gap-6 text-sm">
                <span className="text-[#c6c6cd]/40 font-medium uppercase tracking-widest text-[10px]">Sắp xếp theo</span>
                <div className="flex bg-[#131b2e] p-1 rounded-xl border border-white/5 shadow-inner">
                  <button 
                    onClick={() => setSortBy("relevant")}
                    className={`px-6 py-1.5 rounded-lg transition-all text-xs font-semibold ${sortBy === "relevant" ? 'bg-[#2d3449] text-[#e9c349] shadow-md' : 'text-[#c6c6cd]/60 hover:text-white'}`}
                  >
                    Liên quan
                  </button>
                  <button 
                    onClick={() => setSortBy("price-asc")}
                    className={`flex items-center gap-2 px-6 py-1.5 rounded-lg transition-all text-xs font-semibold ${sortBy === "price-asc" ? 'bg-[#2d3449] text-[#e9c349] shadow-md' : 'text-[#c6c6cd]/60 hover:text-white'}`}
                  >
                    <LayoutList className="w-3.5 h-3.5 rotate-180" /> Giá thấp
                  </button>
                  <button 
                    onClick={() => setSortBy("price-desc")}
                    className={`flex items-center gap-2 px-6 py-1.5 rounded-lg transition-all text-xs font-semibold ${sortBy === "price-desc" ? 'bg-[#2d3449] text-[#e9c349] shadow-md' : 'text-[#c6c6cd]/60 hover:text-white'}`}
                  >
                    <LayoutList className="w-3.5 h-3.5" /> Giá cao
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {isLoading ? (
            <div className="py-32 text-center flex justify-center text-[#c6c6cd]">
               <div className="w-10 h-10 rounded-full border-4 border-[#e9c349] border-t-transparent animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                {sortedProducts.map((p) => (
                  <ProductCard 
                    key={p.id} 
                    id={p.id.toString()}
                    name={p.productName}
                    price={`${p.price.toLocaleString()}đ`}
                    category={p.category?.categoryName || ""}
                    image={p.image || ""} 
                  />
                ))}
              </div>
              {productsData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-20 h-20 bg-[#131b2e] rounded-full flex items-center justify-center border border-white/5 mb-2">
                    <Search className="w-8 h-8 text-[#c6c6cd]/30" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#dae2fd]">Không tìm thấy sản phẩm</h3>
                    <p className="text-[#c6c6cd]/60 max-w-sm mx-auto">
                      Rất tiếc, chúng tôi không tìm thấy kết quả nào phù hợp với yêu cầu của bạn. Hãy thử thay đổi từ khóa hoặc danh mục khác.
                    </p>
                  </div>
                  <Link 
                    href="/collections" 
                    className="px-8 py-3 bg-[#e9c349] text-[#0b1326] font-bold rounded-xl hover:bg-[#d4b142] transition-all shadow-lg"
                  >
                    Xem tất cả sản phẩm
                  </Link>
                </div>
              )}
            </>
          )}
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
