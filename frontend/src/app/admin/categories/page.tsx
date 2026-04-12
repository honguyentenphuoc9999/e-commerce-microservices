"use client";
import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  X,
  Save,
  Check,
  Loader2,
  Inbox,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService, Category } from "@/services/catalogService";

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<Category>>({ categoryName: "", description: "", image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => catalogService.getCategories()
  });

  const uploadMutation = useMutation({
    mutationFn: (data: { id: number, file: File }) => catalogService.adminUploadCategoryImage(data.id, data.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      setIsModalOpen(false);
      alert("Đã tải ảnh và lưu danh mục thành công");
      setImageFile(null);
    },
    onError: () => alert("Có lỗi khi tải ảnh lên")
  });

  const categoryMutation = useMutation({
    mutationFn: (data: { id?: number, category: Partial<Category> }) =>
      data.id
        ? catalogService.adminUpdateCategory(data.id, data.category)
        : catalogService.adminAddCategory(data.category),
    onSuccess: (data) => {
      if (imageFile && data.id) {
        uploadMutation.mutate({ id: data.id, file: imageFile });
      } else {
        queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
        setIsModalOpen(false);
        alert(modalType === "add" ? "Thêm danh mục thành công" : "Cập nhật thành công");
      }
    },
    onError: () => alert("Có lỗi xảy ra")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogService.adminDeleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      alert("Xóa danh mục thành công");
    },
    onError: () => alert("Có lỗi khi xóa danh mục")
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (type: "add" | "edit", category?: any) => {
    setModalType(type);
    setSelectedCategory(category || null);
    setFormData(category ? {
      categoryName: category.categoryName || "",
      description: category.description || "",
      image: category.image || ""
    } : {
      categoryName: "",
      description: "",
      image: ""
    });
    setImagePreview(category?.image || null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Xóa danh mục này có thể ảnh hưởng đến sản phẩm liên quan. Bạn có chắc không?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    categoryMutation.mutate({ id: selectedCategory?.id, category: formData });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1326]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#e9c349] animate-spin" />
          <p className="text-slate-400 font-label tracking-widest text-xs uppercase animate-pulse">Đang nạp phân loại hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-700 relative bg-gradient-to-b from-[#0b1326] to-[#0f172a]">
      {/* Header Section */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <nav className="flex gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-label">Bảng điều hướng</span>
            <span className="text-[10px] text-slate-500">/</span>
            <span className="text-[10px] uppercase tracking-widest text-[#e9c349] font-label">Quản lý danh mục</span>
          </nav>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-white uppercase italic">Hệ thống phân loại</h1>
          <p className="text-slate-400 mt-2 max-w-xl font-body text-sm leading-relaxed">Định nghĩa và tổ chức hệ thống phân loại sản phẩm cho toàn bộ cửa hàng Digital Atelier.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 focus:text-[#e9c349] transition-colors" />
            <input
              className="bg-[#131b2e] border-none text-sm rounded-xl pl-12 pr-6 py-3.5 w-64 focus:ring-1 focus:ring-[#e9c349]/40 placeholder:text-slate-600 transition-all outline-none border border-white/5"
              placeholder="Lọc danh mục..."
              type="text"
            />
          </div>
          <button
            onClick={() => handleOpenModal("add")}
            className="flex items-center gap-2 bg-[#e9c349] text-[#0b1326] font-label font-black px-8 py-3.5 rounded-xl shadow-2xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
          >
            <Plus size={18} />
            Thêm danh mục mới
          </button>
        </div>
      </header>

      {/* Category Table Section */}
      <section className="bg-[#131b2e] rounded-3xl overflow-hidden shadow-3xl border border-white/5 bg-linear-to-b from-[#131b2e] to-[#0b1326]">
        <div className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-[#171f33]/30">
          <div className="flex gap-4">
            <button className="px-5 py-2.5 bg-[#222a3d] rounded-xl text-xs font-bold text-slate-300 hover:bg-[#2d3449] transition-all flex items-center gap-2 border border-white/5">
              <Filter size={16} /> Bộ lọc
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Digital Atelier Taxonomy</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-label border-b border-white/5 bg-[#171f33]/10">
                <th className="px-10 py-6">ID</th>
                <th className="px-10 py-6">Tên Danh mục</th>
                <th className="px-10 py-6">Mô tả</th>
                <th className="px-10 py-6 text-center">Sản phẩm</th>
                <th className="px-10 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-600">
                      <Inbox size={48} />
                      <p className="font-label text-xs uppercase tracking-widest">Hệ thống phân loại chưa được thiết lập</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <span className="font-mono text-xs text-slate-500 group-hover:text-[#e9c349] transition-colors font-bold">#CAT-{cat.id}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-[#0b1326] overflow-hidden flex items-center justify-center border border-white/5 group-hover:border-[#e9c349]/30 transition-all font-bold shadow-xl text-slate-700">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.categoryName} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="opacity-20" />
                          )}
                        </div>
                        <span className="font-headline font-black text-white group-hover:text-[#e9c349] transition-colors text-base">{cat.categoryName}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-sm text-slate-400 max-w-xs">{cat.description}</td>
                    <td className="px-10 py-8 text-center">
                      <span className="bg-[#222a3d] text-slate-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 shadow-xl">
                        Hỗ trợ hệ thống
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <button
                          onClick={() => handleOpenModal("edit", cat)}
                          className="p-3 text-slate-400 hover:text-[#e9c349] bg-white/5 rounded-xl border border-white/5 hover:border-[#e9c349]/20 transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-3 text-slate-400 hover:text-rose-400 bg-white/5 rounded-xl border border-white/5 hover:border-rose-400/20 transition-all" title="Xóa"
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

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <form onSubmit={handleSubmit} className="bg-[#131b2e] w-full max-w-2xl rounded-3xl border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500 scale-100">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-[#171f33] to-[#131b2e]">
              <div>
                <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight italic">
                  {modalType === "add" ? "Kiến tạo danh mục mới" : "Cấu trúc lại danh mục"}
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2 font-black">Taxonomy Structure Engine</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-4 rounded-2xl hover:bg-white/5 text-slate-500 hover:text-white transition-all border border-white/5"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#e9c349]">Tên danh mục</label>
                    <input
                      required
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                      placeholder="Ví dụ: Trang sức Heritage"
                      className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4.5 px-6 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-800 font-headline font-bold text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#e9c349]">Mô tả chi tiết</label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Mô tả tầm nhìn của danh mục này..."
                      rows={4}
                      className="w-full bg-[#0b1326] border border-white/5 rounded-2xl p-6 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-800 font-body leading-relaxed italic"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#e9c349]">Link hình ảnh (Cloudinary)</label>
                    <input
                      value={formData.image || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://res.cloudinary.com/..."
                      className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-6 text-xs text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-800 font-mono"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#e9c349]">Hoặc tải ảnh lên</label>
                    <label className="min-h-[160px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-[#e9c349]/20 hover:bg-white/[0.02] transition-all cursor-pointer group/upload relative overflow-hidden">
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      {imagePreview ? (
                        <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover/upload:scale-110 transition-transform duration-1000" />
                      ) : null}
                      <div className="relative z-10 flex flex-col items-center text-center p-6 bg-[#0b1326]/40 backdrop-blur-sm rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover/upload:scale-110 transition-transform">
                          <ImageIcon size={18} className="text-slate-500 group-hover:text-[#e9c349]" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kéo thả hoặc <span className="text-[#e9c349]">Tải lên</span></p>
                        <p className="text-[9px] text-slate-600 mt-1">GIẢM TẢI CHO CLOUDINARY</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-white/5 bg-[#171f33]/30 flex justify-end gap-8">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-10 py-5 rounded-2xl text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-white transition-all"
              >
                Bỏ qua
              </button>
              <button
                disabled={categoryMutation.isPending || uploadMutation.isPending}
                type="submit"
                className={`px-14 py-5 bg-[#e9c349] text-[#0b1326] rounded-2xl font-headline font-black text-xs uppercase tracking-widest shadow-3xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 ${(categoryMutation.isPending || uploadMutation.isPending) ? 'opacity-50' : ''}`}
              >
                {(categoryMutation.isPending || uploadMutation.isPending) ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {modalType === "add" ? "Xác nhận khởi tạo" : "Lưu thay đổi kiến trúc"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="pt-24 border-t border-white/5 py-12 flex justify-between items-center opacity-30">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em]">Digital Atelier Core Infrastructure</p>
        <div className="flex gap-10">
          <span className="text-[9px] font-black uppercase tracking-widest">Protocol v1.1.0</span>
          <span className="text-[9px] font-black uppercase tracking-widest mr-4">Atelier OS</span>
        </div>
      </footer>
    </div>
  );
};

export default AdminCategories;
