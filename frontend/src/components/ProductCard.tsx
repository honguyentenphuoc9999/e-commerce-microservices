"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  badge?: string;
  badgeColor?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  id, name, price, category, image, badge, badgeColor = "secondary" 
}) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const cartMutation = useMutation({
    mutationFn: () => shopService.addToCart(id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`Đã thêm ${name} vào giỏ hàng!`);
    },
    onError: () => {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng.");
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
        toast.error("Vui lòng đăng nhập để thực hiện hành động này.");
        return;
    }
    cartMutation.mutate();
  };
  return (
    <div className="group relative flex flex-col bg-[#131b2e] rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 border border-white/5">
      <div className="aspect-[4/5] overflow-hidden relative">
        <Link href={`/product/${id}`}>
          {image ? (
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-[#0b1326] flex items-center justify-center text-[#c6c6cd]/20 font-black text-xs uppercase tracking-[0.2em]">
              No Image
            </div>
          )}
        </Link>
        
        {badge && (
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <span className={`bg-[#0b1326]/40 backdrop-blur-md border border-white/5 px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#e9c349]`}>
              {badge}
            </span>
          </div>
        )}



        <div className="absolute inset-0 bg-gradient-to-t from-[#061127] via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"></div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 space-y-3">
          <Link href={`/product/${id}`} className="block">
            <button className="w-full py-3.5 bg-white text-[#0b1326] font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-[#e9c349] transition-colors">
              Xem Chi Tiết
            </button>
          </Link>
          <button 
            onClick={handleAddToCart}
            disabled={cartMutation.isPending}
            className="w-full py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] hover:bg-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={14} />
            {cartMutation.isPending ? "Đang thêm..." : "Thêm Vào Giỏ"}
          </button>
        </div>
      </div>
      <div className="p-8 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline font-bold text-xl group-hover:text-[#e9c349] transition-colors">
              <Link href={`/product/${id}`}>{name}</Link>
            </h3>
            <p className="text-sm text-[#c6c6cd]">{category}</p>
          </div>
          <span className="font-headline font-bold text-lg text-[#bec6e0]">{price}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
