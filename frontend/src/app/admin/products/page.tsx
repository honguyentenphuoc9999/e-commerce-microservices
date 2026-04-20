"use client";
import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Package, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2,
  Box,
  Eye,
  X,
  Save,
  Image as ImageIcon,
  AlertTriangle,
  Loader2,
  Inbox
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService, Product } from "@/services/catalogService";
import { toast } from "sonner";

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => catalogService.adminGetProducts()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogService.adminDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success("Xóa sản phẩm thành công");
    },
    onError: () => toast.error("Có lỗi khi xóa sản phẩm")
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => catalogService.getCategories()
  });

  const productMutation = useMutation({
    mutationFn: (data: { id?: number, product: Partial<Product> }) => 
      data.id 
        ? catalogService.adminUpdateProduct(data.id, data.product)
        : catalogService.adminAddProduct(data.product),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      if (imageFiles.length > 0 && data.id) {
        uploadMultiMutation.mutate({ id: data.id, files: imageFiles });
      } else {
        setIsModalOpen(false);
        toast.success(modalType === "add" ? "Thêm sản phẩm thành công" : "Cập nhật thành công");
      }
    },
    onError: () => toast.error("Có lỗi xảy ra")
  });

  const uploadMultiMutation = useMutation({
    mutationFn: (data: { id: number, files: File[] }) => catalogService.adminUploadImages(data.id, data.files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setIsModalOpen(false);
      toast.success("Đã tải gallery ảnh và lưu sản phẩm thành công");
      setImageFiles([]);
      setImagePreviews([]);
    }
  });

  const [formData, setFormData] = useState<Partial<Product>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [expandedPreviewIndex, setExpandedPreviewIndex] = useState<number | null>(null);
  const [tableLightbox, setTableLightbox] = useState<{ images: string[], currentIndex: number } | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleOpenModal = (type: "add" | "edit", product?: any) => {
    setModalType(type);
    setSelectedProduct(product || null);
    setFormData(product ? {
      productName: product.productName || "",
      price: product.price || 0,
      availability: product.availability || 0,
      discription: product.discription || "",
      category: product.category,
      image: product.image || "",
      images: product.images || []
    } : {
      productName: "",
      price: 0,
      availability: 0,
      discription: "",
      category: categories[0],
      image: "",
      images: []
    });
    const initialImages = (product?.images || (product?.image ? [product.image] : []))
      .filter((img: string) => img && (img.startsWith('http') || img.startsWith('data:')));
    
    setImagePreviews(initialImages);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length > 0 && imageFiles.length < 3 && modalType === "add") {
       return toast.error("Vui lòng chọn ít nhất 3 ảnh sản phẩm.");
    }
    productMutation.mutate({ id: selectedProduct?.id, product: formData });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (imageFiles.length + newFiles.length > 9) {
      toast.error("Tối đa chỉ được chọn 9 ảnh.");
      return;
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...imageFiles, ...newFiles];
      setImageFiles(updatedFiles);
      
      const newPreviews: string[] = [];
      let loaded = 0;
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          loaded++;
          if (loaded === newFiles.length) {
            setImagePreviews([...imagePreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImageChoice = (index: number) => {
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);

    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1326]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#e9c349] animate-spin" />
          <p className="text-slate-400 font-label tracking-widest text-xs uppercase animate-pulse">Đang nạp dữ liệu kho hàng...</p>
        </div>
      </div>
    );
  }

  const totalStockValue = products.reduce((acc: number, cur: any) => acc + (cur.price * cur.availability), 0);
  const activeProducts = products.filter((p: any) => p.availability > 0).length;

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-700 relative">
      <header className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-label">Atelier Admin</span>
            <span className="text-[10px] text-slate-500">/</span>
            <span className="text-[10px] uppercase tracking-widest text-[#e9c349] font-label">Quản lý sản phẩm</span>
          </nav>
          <h1 className="text-5xl font-black font-headline tracking-tighter text-white uppercase">Kho sản phẩm</h1>
          <p className="text-slate-400 mt-2 max-w-xl font-body">Danh mục sản phẩm hiện có trong hệ thống, quản lý tồn kho và giá niêm yết.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#e9c349] transition-colors" />
            <input 
              className="bg-[#131b2e] border-none text-sm rounded-xl pl-12 pr-4 py-3 w-64 focus:ring-1 focus:ring-[#e9c349]/40 placeholder:text-slate-500 transition-all outline-none shadow-2xl" 
              placeholder="Tìm kiếm sản phẩm..." 
              type="text"
            />
          </div>
          <button 
            onClick={() => handleOpenModal("add")}
            className="flex items-center gap-2 bg-[#e9c349] text-[#0b1326] font-label font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus size={18} />
            Thêm sản phẩm
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#131b2e] p-6 rounded-2xl relative overflow-hidden group border border-white/5 shadow-xl">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Box size={60} />
           </div>
           <p className="text-[10px] uppercase tracking-widest text-slate-500 font-label mb-1">Tổng sản phẩm</p>
           <p className="text-2xl font-headline font-bold text-white">{products.length}</p>
        </div>
        <div className="bg-[#131b2e] p-6 rounded-2xl relative overflow-hidden group border border-white/5 shadow-xl">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-400">
              <Package size={60} />
           </div>
           <p className="text-[10px] uppercase tracking-widest text-slate-500 font-label mb-1">Đang kinh doanh</p>
           <p className="text-2xl font-headline font-bold text-emerald-400">{activeProducts}</p>
        </div>
        <div className="bg-[#131b2e] p-6 rounded-2xl relative overflow-hidden group border border-white/5 shadow-xl">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-[#e9c349]">
              <Activity size={60} />
           </div>
           <p className="text-[10px] uppercase tracking-widest text-slate-500 font-label mb-1">Giá trị kho</p>
           <p className="text-2xl font-headline font-bold text-[#e9c349]">{(totalStockValue / 1000000).toFixed(1)}M đ</p>
        </div>
        <div className="bg-[#131b2e] p-6 rounded-2xl relative overflow-hidden group border border-white/5 shadow-xl">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-rose-400">
              <Trash2 size={60} />
           </div>
           <p className="text-[10px] uppercase tracking-widest text-slate-500 font-label mb-1">Cần bổ sung</p>
           <p className="text-2xl font-headline font-bold text-rose-400">{products.filter((p: any) => p.availability < 5).length}</p>
        </div>
      </section>

      <section className="bg-[#131b2e] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-linear-to-b from-[#131b2e] to-[#0b1326]">
        <div className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-[#171f33]/30">
          <div className="flex gap-4">
            <button className="px-5 py-2.5 bg-[#222a3d] rounded-xl text-xs font-bold text-slate-300 hover:bg-[#2d3449] transition-all flex items-center gap-2 border border-white/5">
              <Filter size={14} />
              Bộ lọc
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Hiển thị {products.length} / {products.length} sản phẩm</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-label border-b border-white/5 bg-[#171f33]/10">
                <th className="px-8 py-5">Sản phẩm</th>
                <th className="px-8 py-5">Giá niêm yết</th>
                <th className="px-8 py-5">Tồn kho</th>
                <th className="px-8 py-5 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-body">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-600">
                      <Inbox size={48} />
                      <p className="font-label text-xs uppercase tracking-widest">Kho hàng hiện đang trống</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((prd: any) => (
                <tr key={prd.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div 
                        onClick={() => {
                          if (prd.images && prd.images.length > 0) {
                            setTableLightbox({ images: prd.images, currentIndex: 0 });
                          } else if (prd.image) {
                            setTableLightbox({ images: [prd.image], currentIndex: 0 });
                          }
                        }}
                        className={`w-12 h-16 rounded-lg bg-[#171f33] overflow-hidden border border-white/10 group-hover:border-[#e9c349]/30 transition-all duration-300 flex-shrink-0 shadow-lg p-0.5 relative ${(prd.image || prd.images?.length > 0) ? 'cursor-pointer hover:scale-105' : ''}`}
                      >
                        {prd.image ? (
                          <img src={prd.image} alt={prd.productName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="text-white/5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-[#e9c349] transition-colors leading-tight">{prd.productName}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono hover:text-slate-400">#{prd.id} / {prd.category?.categoryName || "Uncategorized"}</p>
                        
                        {/* Gallery hiển thị thu nhỏ */}
                        {prd.images && prd.images.length > 1 && (
                          <div className="flex gap-1 mt-2 items-center">
                            {prd.images.slice(1, 5).map((imgUrl: string, idx: number) => (
                               <button 
                                 type="button"
                                 title="Xem ảnh"
                                 onClick={() => setTableLightbox({ images: prd.images, currentIndex: idx + 1 })}
                                 key={idx} 
                                 className="w-6 h-6 rounded-md overflow-hidden border border-white/10 opacity-40 group-hover:opacity-100 hover:scale-110 hover:border-[#e9c349] hover:opacity-100 transition-all duration-300 shadow-sm cursor-pointer"
                               >
                                  <img src={imgUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="gallery" />
                               </button>
                            ))}
                            {prd.images.length > 5 && (
                               <button 
                                 type="button"
                                 title="Xem toàn bộ Gallery"
                                 onClick={() => setTableLightbox({ images: prd.images, currentIndex: 5 })}
                                 className="w-6 h-6 rounded-md bg-[#171f33] flex items-center justify-center border border-white/10 text-[8px] text-[#e9c349] font-black opacity-40 group-hover:opacity-100 hover:scale-110 hover:border-[#e9c349] hover:opacity-100 transition-all cursor-pointer"
                               >
                                 +{prd.images.length - 5}
                               </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-headline font-black text-white italic">{prd.price?.toLocaleString()}đ</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-300">{prd.availability} đơn vị</span>
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full ${prd.availability > 20 ? 'bg-emerald-400' : prd.availability > 5 ? 'bg-[#e9c349]' : 'bg-rose-400'}`} 
                          style={{ width: `${Math.min(prd.availability, 40) / 0.4}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block shadow-2xl ${prd.availability > 0 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-rose-400 bg-rose-400/10 border-rose-400/20'}`}>
                      {prd.availability > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         onClick={() => handleOpenModal("edit", prd)}
                         className="p-3 text-slate-400 hover:text-[#e9c349] bg-white/5 rounded-xl border border-white/5 hover:border-[#e9c349]/30 transition-all shadow-xl"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prd.id)}
                        className="p-3 text-slate-400 hover:text-rose-400 bg-white/5 rounded-xl border border-white/5 hover:border-rose-400/30 transition-all shadow-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div 
             className="absolute inset-0 bg-[#050914]/80 backdrop-blur-xl animate-in fade-in duration-500"
             onClick={() => setIsModalOpen(false)}
           />
            <form onSubmit={handleSubmit} className="relative w-full max-w-5xl bg-[#0b1326] rounded-[32px] overflow-hidden shadow-3xl border border-white/5 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[95vh] flex flex-col">
              <div className="p-8 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent flex items-center justify-between flex-shrink-0">
                 <div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                       {modalType === "add" ? "Khai thông Sản phẩm" : "Tinh chỉnh Sản phẩm"}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1">Atelier Luxury Inventory System</p>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                 >
                    <X size={20} />
                 </button>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar p-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tên sản phẩm</label>
                          <input 
                            required
                            value={formData.productName}
                            onChange={(e) => setFormData({...formData, productName: e.target.value})}
                            placeholder="Ví dụ: Chronos Platinum Limited" 
                            className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-700 font-body"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danh mục</label>
                          <select 
                            value={formData.category?.id}
                            onChange={(e) => setFormData({...formData, category: categories.find((c: any) => c.id === parseInt(e.target.value))})}
                            className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all font-body appearance-none"
                          >
                             {categories.map((cat: any) => (
                               <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                             ))}
                          </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giá bán (đ)</label>
                             <input 
                               required
                               value={formData.price}
                               onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                               type="number" 
                               step="0.01"
                               placeholder="0.00" 
                               className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-700 font-bold"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số lượng kho</label>
                             <input 
                               required
                               value={formData.availability}
                               onChange={(e) => setFormData({...formData, availability: parseInt(e.target.value)})}
                               type="number" 
                               placeholder="0" 
                               className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-700 font-bold"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gallery hình ảnh (Clouds - Ngăn cách dấu phẩy)</label>
                          <textarea 
                            value={formData.images?.join(", ") || ""}
                            onChange={(e) => {
                              const urls = e.target.value.split(",").map(u => u.trim()).filter(u => u !== "");
                              setFormData({...formData, images: urls, image: urls[0] || ""});
                              setImagePreviews(urls);
                            }}
                            placeholder="URL 1, URL 2, ..." 
                            rows={2}
                            className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-700 font-body"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tải lên Gallery (3-9 ảnh)</label>
                          <div className="min-h-[160px] border-2 border-dashed border-white/5 rounded-2xl relative overflow-hidden group/upload">
                             <input type="file" id="multi-upload" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                             
                             {imagePreviews.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 p-3 bg-[#0b1326] h-full">
                                   {imagePreviews.slice(0, 9).map((img, i) => (
                                      <div 
                                          key={i} 
                                          onClick={() => setExpandedPreviewIndex(i)}
                                          className="relative group/img aspect-square overflow-hidden rounded-xl border border-white/5 cursor-pointer"
                                      >
                                          <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-opacity" />
                                          <button 
                                             type="button"
                                             onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeImageChoice(i);
                                             }}
                                             className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-rose-500 text-white rounded-full transition-all backdrop-blur-md opacity-0 group-hover/img:opacity-100 shadow-lg"
                                          >
                                             <X size={14} />
                                          </button>
                                      </div>
                                   ))}
                                   {imagePreviews.length < 9 && (
                                      <label htmlFor="multi-upload" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl hover:border-[#e9c349]/40 hover:bg-white/[0.02] transition-all cursor-pointer group/add">
                                         <Plus size={20} className="text-slate-600 group-hover/add:text-[#e9c349] transition-colors" />
                                         <span className="text-[8px] font-bold text-slate-600 uppercase mt-1">Thêm</span>
                                      </label>
                                   )}
                                </div>
                             ) : (
                               <label htmlFor="multi-upload" className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#e9c349]/5 transition-all group/empty bg-white/[0.01]">
                                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-1 group-hover/empty:scale-110 group-hover/empty:bg-[#e9c349]/10 transition-all duration-500">
                                     <ImageIcon size={28} className="text-slate-500 group-hover/empty:text-[#e9c349]" />
                                  </div>
                                  <div className="text-center">
                                     <p className="text-sm font-black text-slate-400 group-hover/empty:text-white transition-colors">CHỌN LOẠT ẢNH SẢN PHẨM</p>
                                     <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-[0.2em] font-bold">Tối thiểu 3 hình ảnh • Định dạng JPG, PNG</p>
                                  </div>
                                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5 overflow-hidden">
                                     <div className="h-full bg-[#e9c349]/20 w-0 group-hover/empty:w-full transition-all duration-1000" />
                                   </div>
                               </label>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mô tả sản phẩm</label>
                       <textarea 
                         value={formData.discription || ""}
                         onChange={(e) => setFormData({...formData, discription: e.target.value})}
                         placeholder="Mô tả tinh hoa về sản phẩm..."
                         rows={4}
                         className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-700 font-body leading-relaxed"
                       />
                    </div>
                 </div>
              </div>

              {/* Advanced Lightbox with Navigation & Thumbnails */}
              {expandedPreviewIndex !== null && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
                    {/* Close Button */}
                    <button 
                      type="button"
                      onClick={() => setExpandedPreviewIndex(null)}
                      className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-rose-500 text-white rounded-full transition-all z-10"
                    >
                      <X size={24} />
                    </button>

                    {/* Main Image Container */}
                    <div className="relative flex items-center justify-center w-full max-w-5xl h-[60vh] px-12 mt-12">
                        {/* Prev Button */}
                        <button 
                          type="button"
                          disabled={expandedPreviewIndex === 0}
                          onClick={() => setExpandedPreviewIndex(prev => (prev !== null ? Math.max(0, prev - 1) : null))}
                          className="absolute left-0 p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all disabled:opacity-0"
                        >
                          <ChevronLeft size={32} />
                        </button>

                        <img 
                          src={imagePreviews[expandedPreviewIndex]} 
                          alt="Large Preview" 
                          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500" 
                        />

                        {/* Next Button */}
                        <button 
                          type="button"
                          disabled={expandedPreviewIndex === imagePreviews.length - 1}
                          onClick={() => setExpandedPreviewIndex(prev => (prev !== null ? Math.min(imagePreviews.length - 1, prev + 1) : null))}
                          className="absolute right-0 p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all disabled:opacity-0"
                        >
                          <ChevronRight size={32} />
                        </button>
                    </div>

                    {/* Thumbnails Reel */}
                    <div className="mt-12 flex gap-3 p-4 bg-white/5 rounded-2xl backdrop-blur-md max-w-4xl overflow-x-auto">
                        {imagePreviews.map((img, idx) => (
                           <button 
                             type="button"
                             key={idx}
                             onClick={() => setExpandedPreviewIndex(idx)}
                             className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${expandedPreviewIndex === idx ? 'border-[#e9c349] scale-110 shadow-lg shadow-[#e9c349]/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
                           >
                              <img src={img} className="w-full h-full object-cover" />
                           </button>
                        ))}
                    </div>
                </div>
              )}

              <div className="p-8 border-t border-white/5 bg-[#171f33]/30 flex justify-end gap-6 flex-shrink-0">
                 <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="px-8 py-4 rounded-xl bg-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white border border-white/5 transition-all"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                   disabled={productMutation.isPending || uploadMultiMutation.isPending}
                   type="submit"
                   className={`px-10 py-4 bg-[#e9c349] text-[#0b1326] rounded-xl font-headline font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 ${(productMutation.isPending || uploadMultiMutation.isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                    {(productMutation.isPending || uploadMultiMutation.isPending) ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {modalType === "add" ? "Đưa vào kinh doanh" : "Cập nhật thay đổi"}
                 </button>
              </div>
            </form>
        </div>
      )}
      {/* Table Image Lightbox */}
      {tableLightbox && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setTableLightbox(null)}
              className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-rose-500 text-white rounded-full transition-all z-[210] border border-white/10"
            >
              <X size={24} />
            </button>

            {/* Main Image Container */}
            <div className="relative flex items-center justify-center w-full max-w-6xl h-[70vh] px-12 mt-8">
                {/* Prev Button */}
                <button 
                  disabled={tableLightbox.currentIndex === 0}
                  onClick={() => setTableLightbox({ ...tableLightbox, currentIndex: Math.max(0, tableLightbox.currentIndex - 1) })}
                  className="absolute left-4 p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all disabled:opacity-0 border border-white/10 hover:border-white/30 z-[210]"
                >
                  <ChevronLeft size={36} />
                </button>

                <img 
                  key={tableLightbox.currentIndex}
                  src={tableLightbox.images[tableLightbox.currentIndex]} 
                  alt="Product view" 
                  className="max-w-full max-h-full object-contain rounded-3xl animate-in zoom-in-95 duration-500" 
                />

                {/* Next Button */}
                <button 
                  disabled={tableLightbox.currentIndex === tableLightbox.images.length - 1}
                  onClick={() => setTableLightbox({ ...tableLightbox, currentIndex: Math.min(tableLightbox.images.length - 1, tableLightbox.currentIndex + 1) })}
                  className="absolute right-4 p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all disabled:opacity-0 border border-white/10 hover:border-white/30 z-[210]"
                >
                  <ChevronRight size={36} />
                </button>
            </div>

            {/* Thumbnails Reel */}
            {tableLightbox.images.length > 1 && (
              <div className="mt-8 flex gap-3 p-4 bg-[#171f33]/50 rounded-2xl backdrop-blur-xl border border-white/5 max-w-4xl overflow-x-auto custom-scrollbar">
                  {tableLightbox.images.map((img, idx) => (
                     <button 
                       key={idx}
                       onClick={() => setTableLightbox({ ...tableLightbox, currentIndex: idx })}
                       className={`w-20 h-20 rounded-xl overflow-hidden transition-all flex-shrink-0 flex items-center justify-center bg-black/50 ${tableLightbox.currentIndex === idx ? 'border-2 border-[#e9c349] opacity-100 scale-105 shadow-lg shadow-[#e9c349]/20' : 'border border-white/10 opacity-40 hover:opacity-100'}`}
                     >
                        <img src={img} className="max-w-full max-h-full object-cover" alt="thumbnail" />
                     </button>
                  ))}
              </div>
            )}
        </div>
      )}

    </div>

  );
};

export default AdminProducts;
