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
  
  // State quản lý ô nhập liệu
  const [searchTerm, setSearchTerm] = useState(nameParam || "");

  // Khi URL thay đổi (ví dụ tìm từ Header), cập nhật lại ô nhập liệu
  useEffect(() => {
    setSearchTerm(nameParam || "");
  }, [nameParam]);

  // Hàm xử lý tìm kiếm khi người dùng nhấn Enter hoặc mất focus
  const handleSearchSubmit = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("name", value.trim());
    } else {
      params.delete("name");
    }
    router.push(`/collections?${params.toString()}`);
  };

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogService.getCategories
  });

  const { data: productsData = [], isLoading } = useQuery({
    // QueryKey phải chứa giá trị THẬT từ URL để đảm bảo đồng bộ
    queryKey: ['products', categoryParam, nameParam], 
    queryFn: () => catalogService.getProducts({ 
      category: categoryParam || undefined, 
      name: nameParam || undefined 
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchTerm)}
                  onBlur={() => handleSearchSubmit(searchTerm)}
                  placeholder="Tên sản phẩm..."
                  className="w-full bg-[#131b2e] border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#e9c349]/20 placeholder:text-[#c6c6cd]/40"
                />
                <Search 
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c6c6cd] w-4 h-4 cursor-pointer hover:text-[#e9c349]" 
                   onClick={() => handleSearchSubmit(searchTerm)}
                />
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
                    href={`/collections?category=${encodeURIComponent(cat.categoryName)}`}
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
