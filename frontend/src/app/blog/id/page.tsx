"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { blogService, Article, Comment } from "@/services/blogService";
import { motion } from "framer-motion";
import { Calendar, User, MessageSquare, Send, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

const ArticleDetailPage = () => {
    const params = useParams();
    const id = params.id as string;
    
    const [article, setArticle] = useState<Article | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [articleData, commentsData] = await Promise.all([
                    blogService.getArticleById(Number(id)),
                    blogService.getComments(Number(id))
                ]);
                setArticle(articleData);
                setComments(commentsData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            // Mock user info - in real app, get from Auth Context
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const newComment = await blogService.addComment({
                articleId: Number(id),
                userId: user.id || "guest",
                username: user.username || "Người dùng ẩn danh",
                content: commentText,
                isAdmin: user.role === "ROLE_ADMIN" || user.isAdmin || false
            });
            setComments([...comments, newComment]);
            setCommentText("");
        } catch (error) {
            console.error("Failed to add comment", error);
            alert("Vui lòng đăng nhập để bình luận");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!article) return <div className="text-white text-center py-20">Không tìm thấy bài viết</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header / Hero */}
            <div className="relative h-[60vh] w-full">
                <img 
                    src={article.thumbnailUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
                    alt={article.title}
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-20">
                    <div className="max-w-5xl mx-auto">
                        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
                            <ArrowLeft size={20} /> Quay lại trang chủ
                        </Link>
                        <motion.h1 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl md:text-6xl font-black mb-6 leading-tight"
                        >
                            {article.title}
                        </motion.h1>
                        <div className="flex flex-wrap gap-6 text-slate-400">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-blue-500" />
                                {new Date(article.createdAt || "").toLocaleDateString('vi-VN')}
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-blue-500" />
                                Quản trị viên
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare size={18} className="text-blue-500" />
                                {comments.length} bình luận
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-8 md:px-20 py-16">
                <div className="prose prose-invert prose-blue max-w-none mb-20">
                    <div className="text-xl leading-relaxed text-slate-300 whitespace-pre-wrap">
                        {article.content}
                    </div>
                </div>

                <hr className="border-white/10 mb-16" />

                {/* Comments Section */}
                <section id="comments">
                    <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
                        <MessageSquare className="text-blue-500" />
                        Thảo luận ({comments.length})
                    </h2>

                    {/* Comment Form */}
                    <form onSubmit={handleComment} className="mb-16">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 focus-within:border-blue-500/50 transition-all">
                            <textarea 
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Chia sẻ ý kiến của bạn về bài viết này..."
                                className="w-full bg-transparent border-none focus:outline-none min-h-[120px] text-lg resize-none"
                            />
                            <div className="flex justify-end mt-4">
                                <button 
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {submitting ? "Đang gửi..." : <><Send size={18} /> Gửi bình luận</>}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-8">
                        {comments.length === 0 ? (
                            <p className="text-slate-500 italic text-center py-10">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                        ) : (
                            comments.map((comment) => (
                                <motion.div 
                                    key={comment.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                                        <User className="text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-blue-400">{comment.username}</span>
                                            {comment.isAdmin && (
                                                <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                                    <ShieldCheck size={10} /> ADMIN
                                                </span>
                                            )}
                                            <span className="text-slate-500 text-xs">
                                                {new Date(comment.createdAt || "").toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-slate-300 leading-relaxed">
                                            {comment.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ArticleDetailPage;
