"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { blogService, Article, Comment } from "@/services/blogService";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, User, MessageSquare, Send, ArrowLeft, Loader2, ShieldCheck, ChevronRight, X, Reply, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";

const ArticleDetailPage = () => {
    const params = useParams();
    const id = params.id as string;
    
    const [article, setArticle] = useState<Article | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [expandedComments, setExpandedComments] = useState<number[]>([]);

    const toggleExpand = (commentId: number) => {
        setExpandedComments(prev => 
            prev.includes(commentId) 
                ? prev.filter(id => id !== commentId) 
                : [...prev, commentId]
        );
    };

    const countReplies = (commentId: number): number => {
        const directReplies = comments.filter(c => c.parentId === commentId);
        let count = directReplies.length;
        directReplies.forEach(reply => {
            count += countReplies(reply.id!);
        });
        return count;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [articleData, relatedData, commentsData] = await Promise.all([
                    blogService.getArticleById(Number(id)),
                    blogService.getPublishedArticles(),
                    blogService.getComments(Number(id))
                ]);
                setArticle(articleData);
                setRelatedArticles(relatedData.filter(a => a.id !== Number(id)).slice(0, 4));
                setComments(commentsData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleComment = async (e: React.FormEvent, parentId?: number) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        if (!user) {
            alert("Vui lòng đăng nhập để bình luận");
            return;
        }

        setSubmitting(true);
        try {
            const displayName = (user.lastName && user.firstName) 
                ? `${user.lastName} ${user.firstName}` 
                : (user.userName || user.fullName || user.name || "Khách hàng");

            const newComment = await blogService.addComment(Number(id), {
                articleId: Number(id),
                userId: user.id.toString(),
                username: displayName,
                content: commentText,
                isAdmin: user.role === "ROLE_ADMIN",
                parentId: parentId
            });
            setComments([...comments, newComment]);
            setCommentText("");
            setReplyingToId(null);
        } catch (error) {
            console.error("Failed to add comment", error);
            alert("Có lỗi xảy ra khi gửi bình luận");
        } finally {
            setSubmitting(false);
        }
    };

    const renderThread = (parentId: number | null, depth = 0) => {
        const threadComments = comments
            .filter(c => c.parentId === (parentId === null ? undefined : parentId) || (parentId === null && !c.parentId))
            .sort((a, b) => {
                if (parentId === null) {
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                } else {
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                }
            });

        return threadComments.map(comment => {
            const replyCount = countReplies(comment.id!);
            const isExpanded = expandedComments.includes(comment.id!);

            return (
                <div key={comment.id} className={`${depth === 1 ? 'ml-8 md:ml-12 border-l-2 border-blue-500/10 pl-6' : (depth > 1 ? 'ml-0 pl-0 border-0' : '')} space-y-6`}>
                    {renderSingleComment(comment)}
                    
                    {/* Show toggle button ONLY for root comments (depth 0) */}
                    {depth === 0 && replyCount > 0 && (
                        <div className="mt-4">
                            <button 
                                onClick={() => toggleExpand(comment.id!)}
                                className="flex items-center gap-2 text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-[0.2em] bg-blue-500/5 px-4 py-2 rounded-full border border-blue-500/10"
                            >
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                {isExpanded ? 'Thu gọn thảo luận' : `Xem tất cả ${replyCount} phản hồi`}
                            </button>
                        </div>
                    )}

                    {/* Recursive part: If root, respect isExpanded. If nested, just render directly to show all at once */}
                    {depth === 0 ? (
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-6"
                                >
                                    {renderThread(comment.id!, depth + 1)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        renderThread(comment.id!, depth + 1)
                    )}
                </div>
            );
        });
    };

    const renderComments = () => {
        return <div className="space-y-12">{renderThread(null)}</div>;
    };

    const renderSingleComment = (comment: Comment) => (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 group"
        >
            <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className={`font-black uppercase text-[10px] tracking-wider ${comment.isAdmin ? 'text-blue-400' : (user && user.id.toString() === comment.userId ? 'text-[#e9c349]' : 'text-slate-400')}`}>
                                {user && user.id.toString() === comment.userId ? "Bình luận của bạn" : comment.username}
                            </span>
                            {comment.isAdmin && <span className="bg-blue-500 text-[7px] px-1.5 py-0.5 rounded text-white font-black uppercase">Admin</span>}
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter opacity-60">
                            {new Date(comment.createdAt || "").toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Reply Button with restrictions: no self-reply, only one reply per comment */}
                        {user && 
                         replyingToId !== comment.id && 
                         user.id.toString() !== comment.userId && 
                         !comments.some(c => c.parentId === comment.id) && (
                            <button 
                                onClick={() => {
                                    setReplyingToId(comment.id!);
                                    setCommentText("");
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-all text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 hover:text-blue-400"
                            >
                                <Reply size={12} /> Phản hồi
                            </button>
                        )}

                        {/* Self delete for user */}
                        {user && user.id.toString() === comment.userId && (
                            <button 
                                onClick={async () => {
                                    if (confirm("Bạn có chắc muốn xóa bình luận này?")) {
                                        try {
                                            await blogService.deleteComment(comment.id!, user.id.toString());
                                            setComments(comments.filter(c => c.id !== comment.id));
                                        } catch (e) {
                                            alert("Lỗi khi xóa bình luận");
                                        }
                                    }
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500/50 hover:text-red-500"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="text-slate-300 text-base leading-relaxed break-words bg-white/5 p-6 rounded-2xl border border-white/5 group-hover:bg-white/[0.08] transition-colors shadow-lg">
                    {comment.content}
                </div>

                {/* Inline Reply Input */}
                <AnimatePresence>
                    {replyingToId === comment.id && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-4"
                        >
                            <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-6 shadow-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Phản hồi @{comment.username}</span>
                                    <button onClick={() => setReplyingToId(null)} className="text-slate-500 hover:text-white transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                                <textarea 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Viết phản hồi..."
                                    className="w-full bg-transparent border-none focus:outline-none min-h-[80px] text-base resize-none placeholder:text-slate-700"
                                    autoFocus
                                />
                                <div className="flex justify-end mt-2">
                                    <button 
                                        onClick={(e) => handleComment(e, comment.id!)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-2 rounded-xl flex items-center gap-2 text-xs transition-all"
                                    >
                                        <Send size={14} /> PHẢN HỒI
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050816] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!article) return <div className="text-white text-center py-20">Không tìm thấy bài viết</div>;

    return (
        <div className="min-h-screen bg-[#050816] text-white selection:bg-blue-500/30">
            <Header />
            
            {/* Massive Hero Banner */}
            <div className="relative h-[65vh] w-full">
                {article.thumbnailUrl ? (
                    <img 
                        src={article.thumbnailUrl} 
                        alt={article.title}
                        className="w-full h-full object-cover opacity-40"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-900/50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-20">
                    <div className="max-w-[1400px] mx-auto">
                        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5 font-bold text-sm uppercase tracking-widest">
                            <ArrowLeft size={18} /> Trang chủ
                        </Link>
                        <motion.h1 
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] break-all tracking-tight max-w-5xl"
                        >
                            {article.title}
                        </motion.h1>
                        <div className="flex flex-wrap gap-8 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-blue-500" />
                                {new Date(article.createdAt || "").toLocaleDateString('vi-VN')}
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-blue-500" />
                                QUẢN TRỊ VIÊN
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-[1400px] mx-auto px-8 md:px-20 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    
                    {/* Left Column: Article Content & Comments (8/12) */}
                    <div className="lg:col-span-8 space-y-20">
                        <article className="prose prose-invert prose-blue max-w-none">
                            {article.summary && (
                                <div className="text-2xl leading-relaxed text-slate-300 whitespace-pre-wrap break-words italic font-light mb-16 border-l-4 border-blue-500 pl-8 bg-white/5 py-8 pr-8 rounded-r-3xl">
                                    {article.summary}
                                </div>
                            )}
                            <div className="text-xl leading-loose text-slate-200 whitespace-pre-wrap break-words font-medium">
                                {article.content}
                            </div>
                        </article>

                        <div className="h-px bg-gradient-to-r from-blue-500/30 via-transparent to-transparent" />

                        {/* Discussion Section */}
                        <section id="comments">
                            <h2 className="text-3xl font-black mb-12 text-blue-500 tracking-tighter uppercase italic">
                                Cuộc thảo luận ({comments.length})
                            </h2>

                            {user?.role !== 'ROLE_ADMIN' && (
                                <form onSubmit={(e) => handleComment(e)} className="mb-16">
                                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 focus-within:border-blue-500/50 transition-all shadow-xl">
                                        <textarea 
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Chia sẻ ý kiến của bạn..."
                                            className="w-full bg-transparent border-none focus:outline-none min-h-[120px] text-lg resize-none placeholder:text-slate-600"
                                        />
                                        <div className="flex justify-end mt-4">
                                            <button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-3 rounded-2xl flex items-center gap-3 transition-all">
                                                <Send size={20} /> GỬI BÌNH LUẬN
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-8">
                                {comments.length === 0 ? (
                                    <div className="text-center py-16 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                                        <p className="text-slate-500 italic uppercase tracking-widest text-sm">Bình luận trống</p>
                                    </div>
                                ) : (
                                    renderComments()
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Related Articles (4/12) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32 space-y-10">
                            <h3 className="text-2xl font-black tracking-tighter uppercase text-white border-b-2 border-blue-500 pb-4 inline-block">
                                Bài viết liên quan
                            </h3>
                            
                            <div className="space-y-8">
                                {relatedArticles.length === 0 ? (
                                    <p className="text-slate-500 italic text-sm">Đang cập nhật...</p>
                                ) : (
                                    relatedArticles.map((rel) => (
                                        <Link key={rel.id} href={`/blog/${rel.id}`} className="flex gap-4 group cursor-pointer">
                                            <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-colors">
                                                {rel.thumbnailUrl ? (
                                                    <img 
                                                        src={rel.thumbnailUrl} 
                                                        alt="" 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-white/5" />
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center gap-2">
                                                <h4 className="font-bold text-sm leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                                                    {rel.title}
                                                </h4>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    {new Date(rel.createdAt || "").toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {/* Sidebar CTA */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2rem] mt-12 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h5 className="text-xl font-black mb-4 leading-tight">Bạn muốn đọc nhiều hơn?</h5>
                                    <p className="text-blue-100 text-sm mb-6 opacity-80">Khám phá kho tàng kiến thức công nghệ mới nhất từ Phuoc Techno.</p>
                                    <Link href="/" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                                        Xem tất cả <ChevronRight size={16} />
                                    </Link>
                                </div>
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ArticleDetailPage;
