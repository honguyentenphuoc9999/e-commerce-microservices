"use client";

import { useState, useEffect } from "react";
import { blogService, Article } from "@/services/blogService";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, Search, Edit2, Trash2, Eye, EyeOff, 
    Calendar, MoreVertical, ExternalLink, Loader2 
} from "lucide-react";
import Link from "next/link";

const AdminBlogPage = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchArticles = async () => {
        try {
            const data = await blogService.getAllArticles();
            setArticles(data);
        } catch (error) {
            console.error("Failed to fetch articles", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
        try {
            await blogService.deleteArticle(id);
            setArticles(articles.filter(a => a.id !== id));
        } catch (error) {
            alert("Lỗi khi xóa bài viết");
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const updated = await blogService.toggleArticleStatus(id);
            setArticles(articles.map(a => a.id === id ? updated : a));
        } catch (error) {
            alert("Lỗi khi thay đổi trạng thái");
        }
    };

    const filteredArticles = articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-transparent text-white">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Quản lý Bài Viết</h1>
                    <p className="text-slate-400">Xem, sửa, xóa và quản lý trạng thái các bài viết công nghệ.</p>
                </div>
                <Link 
                    href="/admin/blog/create"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} /> Tạo Bài Viết Mới
                </Link>
            </div>

            {/* Filters / Search */}
            <div className="relative mb-10 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                    type="text"
                    placeholder="Tìm kiếm bài viết theo tiêu đề..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-blue-500/50 transition-all text-lg"
                />
            </div>

            {/* Articles List */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                    {filteredArticles.map((article) => (
                        <motion.div 
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:border-blue-500/30 transition-all"
                        >
                            <div className="flex flex-col md:flex-row p-6 gap-6">
                                {/* Thumbnail */}
                                <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden relative shrink-0">
                                    {article.thumbnailUrl ? (
                                        <img 
                                            src={article.thumbnailUrl} 
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/10" />
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            article.status === 'PUBLISHED' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'
                                        }`}>
                                            {article.status === 'PUBLISHED' ? 'Công khai' : 'Bản nháp'}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-xl font-bold line-clamp-2 break-all group-hover:text-blue-400 transition-colors">
                                                {article.title}
                                            </h2>
                                            <span className="text-slate-600 text-sm font-mono">ID: {article.id}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-500 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(article.createdAt || "").toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-3 mt-6">
                                        <Link 
                                            href={`/admin/blog/${article.id}`}
                                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 px-5 py-2.5 rounded-xl transition-all"
                                        >
                                            <Eye size={18} /> Xem
                                        </Link>
                                        <Link 
                                            href={`/admin/blog/${article.id}/edit`}
                                            className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-5 py-2.5 rounded-xl transition-all"
                                        >
                                            <Edit2 size={18} /> Sửa
                                        </Link>
                                        <button 
                                            onClick={() => handleToggleStatus(article.id!)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                                                article.status === 'PUBLISHED' 
                                                ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400' 
                                                : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                                            }`}
                                        >
                                            {article.status === 'PUBLISHED' ? <><EyeOff size={18} /> Ẩn</> : <><Eye size={18} /> Hiện</>}
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(article.id!)}
                                            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-5 py-2.5 rounded-xl transition-all ml-auto"
                                        >
                                            <Trash2 size={18} /> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredArticles.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                        <p className="text-slate-500">Không tìm thấy bài viết nào phù hợp.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBlogPage;
