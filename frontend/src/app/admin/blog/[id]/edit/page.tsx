"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { blogService } from "@/services/blogService";
import { mediaService } from "@/services/mediaService";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Image as ImageIcon, Layout, Type, AlignLeft, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";

const EditArticlePage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        content: "",
        thumbnailUrl: "",
        status: "PUBLISHED",
    });

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const article = await blogService.getArticleById(Number(id));
                setFormData({
                    title: article.title,
                    summary: article.summary || "",
                    content: article.content,
                    thumbnailUrl: article.thumbnailUrl,
                    status: article.status,
                });
            } catch (error) {
                console.error("Failed to fetch article", error);
                alert("Không tìm thấy bài viết");
                router.push("/admin/blog");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await blogService.updateArticle(Number(id), formData);
            router.push("/admin/blog");
        } catch (error) {
            console.error("Failed to update article", error);
            alert("Có lỗi xảy ra khi cập nhật bài viết");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white p-8 bg-transparent">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/blog" className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-3xl font-black tracking-tight">Chỉnh Sửa Bài Viết</h1>
                    </div>
                    <button 
                        onClick={handleSubmit}
                        disabled={saving || formData.title.length > 50 || formData.summary.length > 1000 || formData.content.length > 15000 || !formData.title || !formData.content}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} /> {saving ? "Đang lưu..." : "CẬP NHẬT BÀI VIẾT"}
                    </button>
                </div>

                <div className="space-y-8 pb-20">
                    {/* Title Input */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">
                                <Type size={16} className="text-blue-500" /> Tiêu đề bài viết <span className="text-red-500">*</span>
                            </label>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${formData.title.length >= 50 ? 'text-[#e9c349]' : 'text-slate-500'}`}>
                                {formData.title.length}/50
                            </span>
                        </div>
                        <input 
                            type="text"
                            placeholder="Tiêu đề bài viết..."
                            value={formData.title}
                            maxLength={50}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`w-full bg-white/5 border rounded-2xl px-6 py-4 focus:outline-none transition-all text-xl font-bold ${formData.title.length >= 50 ? 'border-[#e9c349] focus:border-[#e9c349]' : 'border-white/10 focus:border-blue-500/50'}`}
                        />
                    </div>

                    {/* Summary Input */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">
                                <AlignLeft size={16} className="text-blue-500" /> Mô tả ngắn (Summary)
                            </label>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${formData.summary.length >= 1000 ? 'text-[#e9c349]' : 'text-slate-500'}`}>
                                {formData.summary.length}/1000
                            </span>
                        </div>
                        <textarea 
                            placeholder="Đoạn tóm tắt ngắn cho bài viết..."
                            value={formData.summary}
                            maxLength={1000}
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                            className={`w-full bg-white/5 border rounded-2xl px-6 py-4 focus:outline-none transition-all text-lg min-h-[100px] resize-none italic ${formData.summary.length >= 1000 ? 'border-[#e9c349] focus:border-[#e9c349]' : 'border-white/10 focus:border-blue-500/50'}`}
                        />
                    </div>

                    {/* Thumbnail URL & Upload */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">
                            <ImageIcon size={16} className="text-blue-500" /> Hình ảnh đại diện (Thumbnail)
                        </label>
                        
                        <div className="flex flex-col gap-4">
                            {/* Link Input */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nhập Link trực tiếp</span>
                                <input 
                                    type="text"
                                    placeholder="Dán link ảnh Cloudinary tại đây..."
                                    value={formData.thumbnailUrl}
                                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-px bg-white/10 flex-1"></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HOẶC</span>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tải ảnh lên từ máy tính</span>
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-4 cursor-pointer transition-all ${uploading ? 'border-blue-500/50 bg-blue-500/5 cursor-wait' : 'border-white/10 hover:border-blue-500/30 bg-white/5'}`}>
                                        {uploading ? (
                                            <div className="flex items-center gap-3 text-blue-400">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                                <span className="font-bold text-sm">Đang tải ảnh lên...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-slate-400 group">
                                                <Upload size={20} className="group-hover:text-blue-500 transition-colors" />
                                                <span className="font-bold text-sm">Chọn tệp hình ảnh (.jpg, .png, .webp)</span>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            disabled={uploading}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setUploading(true);
                                                    try {
                                                        const result = await mediaService.uploadImage(file);
                                                        setFormData({ ...formData, thumbnailUrl: result.url });
                                                    } catch (err) {
                                                        console.error("Upload failed", err);
                                                        alert("Lỗi khi tải ảnh lên Cloudinary!");
                                                    } finally {
                                                        setUploading(false);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {formData.thumbnailUrl && (
                            <div className="mt-6 p-4 rounded-[2.5rem] bg-white/5 border border-white/10 max-w-lg relative group">
                                <div className="rounded-[2rem] overflow-hidden aspect-video border border-white/5">
                                    <img 
                                        src={formData.thumbnailUrl} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400/000000/FFFFFF/png?text=Link+ảnh+không+hợp+lệ";
                                        }}
                                    />
                                </div>
                                <button 
                                    onClick={() => setFormData({ ...formData, thumbnailUrl: "" })}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Input */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">
                                <Layout size={16} className="text-blue-500" /> Nội dung bài viết <span className="text-red-500">*</span>
                            </label>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${formData.content.length >= 15000 ? 'text-[#e9c349]' : 'text-slate-500'}`}>
                                {formData.content.length.toLocaleString()}/15,000
                            </span>
                        </div>
                        <textarea 
                            placeholder="Nội dung bài viết..."
                            value={formData.content}
                            maxLength={15000}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className={`w-full bg-white/5 border rounded-3xl px-8 py-8 focus:outline-none transition-all min-h-[500px] text-lg leading-relaxed resize-none ${formData.content.length >= 15000 ? 'border-[#e9c349] focus:border-[#e9c349]' : 'border-white/10 focus:border-blue-500/50'}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditArticlePage;
