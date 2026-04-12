"use client";
import React, { useState } from "react";
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
      alert("Xóa sản phẩm thành công");
    },
    onError: () => alert("Có lỗi khi xóa sản phẩm")
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
      if (imageFile && data.id) {
        uploadMutation.mutate({ id: data.id, file: imageFile });
      } else {
        setIsModalOpen(false);
        alert(modalType === "add" ? "Thêm sản phẩm thành công" : "Cập nhật thành công");
      }
    },
    onError: () => alert("Có lỗi xảy ra")
  });

  const uploadMutation = useMutation({
    mutationFn: (data: { id: number, file: File }) => catalogService.adminUploadImage(data.id, data.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setIsModalOpen(false);
      alert("Đã tải ảnh và lưu sản phẩm thành công");
      setImageFile(null);
    }
  });

  const [formData, setFormData] = useState<Partial<Product>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleOpenModal = (type: "add" | "edit", product?: any) => {
    setModalType(type);
    setSelectedProduct(product || null);
    setFormData(product ? {
      productName: product.productName || "",
      price: product.price || 0,
      availability: product.availability || 0,
      discription: product.discription || "",
      category: product.category,
      image: product.image || ""
    } : {
      productName: "",
      price: 0,
      availability: 0,
      discription: "",
      category: categories[0],
      image: ""
    });
    setImagePreview(product?.image || null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    productMutation.mutate({ id: selectedProduct?.id, product: formData });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-label">Atelier Admin</span>
            <span className="text-[10px] text-slate-500">/</span>
            <span className="text-[10px] uppercase tracking-widest text-[#e9c349] font-label">Quản lý sản phẩm</span>
          </nav>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-white uppercase italic">Kho sản phẩm</h1>
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

      {/* Stats Bento Grid */}
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
           <p className="text-2xl font-headline font-bold text-[#e9c349]">${(totalStockValue / 1000).toFixed(1)}k</p>
        </div>
        <div className="bg-[#131b2e] p-6 rounded-2xl relative overflow-hidden group border border-white/5 shadow-xl">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-rose-400">
              <Trash2 size={60} />
           </div>
           <p className="text-[10px] uppercase tracking-widest text-slate-500 font-label mb-1">Cần bổ sung</p>
           <p className="text-2xl font-headline font-bold text-rose-400">{products.filter((p: any) => p.availability < 5).length}</p>
        </div>
      </section>

      {/* Product Table Table Section */}
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
                      <div className="w-12 h-16 rounded-lg bg-[#171f33] overflow-hidden border border-white/10 group-hover:border-[#e9c349]/30 transition-all duration-300 flex-shrink-0 shadow-lg p-0.5 relative">
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
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono">#{prd.id} / {prd.category?.categoryName || "Uncategorized"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-headline font-black text-white italic">${prd.price?.toLocaleString()}</td>
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

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <form onSubmit={handleSubmit} className="bg-[#131b2e] w-full max-w-3xl rounded-3xl border border-white/10 shadow-3xl overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#171f33]/50">
                 <div>
                    <h2 className="text-2xl font-headline font-black text-white uppercase tracking-tight italic">
                       {modalType === "add" ? "Thiết lập sản phẩm mới" : "Tinh chỉnh sản phẩm"}
                    </h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-bold">Atelier Luxury Inventory System</p>
                 </div>
                 <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"
                 >
                    <X size={20} />
                 </button>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
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
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giá bán ($)</label>
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
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đường dẫn hình ảnh (Cloudinary)</label>
                       <input 
                         value={formData.image || ""}
                         onChange={(e) => {
                           setFormData({...formData, image: e.target.value});
                           setImagePreview(e.target.value);
                         }}
                         placeholder="https://res.cloudinary.com/..." 
                         className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-700 font-body"
                       />
                    </div>
                    <div className="space-y-2 h-full">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hoặc Tải ảnh lên</label>
                       <label className="min-h-[160px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-[#e9c349]/20 hover:bg-white/[0.02] transition-all cursor-pointer group/upload relative overflow-hidden">
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                          {imagePreview ? (
                             <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover/upload:scale-110 transition-transform duration-1000" />
                          ) : null}
                          <div className="relative z-10 flex flex-col items-center text-center p-6 bg-[#0b1326]/40 backdrop-blur-sm rounded-2xl border border-white/5">
                             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover/upload:scale-110 transition-transform">
                                <ImageIcon size={20} className="text-slate-500 group-hover:text-[#e9c349]" />
                             </div>
                             <p className="text-xs font-bold text-slate-400">Kéo thả ảnh hoặc <span className="text-[#e9c349]">Tải lên</span></p>
                             <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-tight">Định dạng JPG, PNG (Tối đa 5MB)</p>
                          </div>
                       </label>
                    </div>
                 </div>
                 
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mô tả sản phẩm</label>
                    <textarea 
                      value={formData.discription || ""}
                      onChange={(e) => setFormData({...formData, discription: e.target.value})}
                      placeholder="Mô tả tinh hoa về sản phẩm của bạn..."
                      rows={4}
                      className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-700 font-body leading-relaxed"
                    />
                 </div>
              </div>

              <div className="p-10 border-t border-white/5 bg-[#171f33]/30 flex justify-end gap-6">
                 <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="px-10 py-4 rounded-xl bg-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white border border-white/5 transition-all"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                   disabled={productMutation.isPending || uploadMutation.isPending}
                   type="submit"
                   className={`px-12 py-4 bg-[#e9c349] text-[#0b1326] rounded-xl font-headline font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 ${(productMutation.isPending || uploadMutation.isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                    {(productMutation.isPending || uploadMutation.isPending) ? (
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

      {/* Footer Support */}
      <footer className="pt-24 flex justify-between items-center opacity-30 border-t border-white/5">
         <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.5em]">Inventory Manager v6.0</p>
         <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest">
            <span className="text-slate-400">Báo cáo tài chính</span>
            <span className="text-slate-400">Log hoạt động</span>
         </div>
      </footer>
    </div>
  );
};

export default AdminProducts;
