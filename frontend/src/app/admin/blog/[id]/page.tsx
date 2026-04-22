"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { blogService, Article, Comment } from "@/services/blogService";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, User, MessageSquare, Send, ArrowLeft, Loader2, Edit3, Reply, X, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

const AdminArticleDetailPage = () => {
    const params = useParams();
    const id = params.id as string;

    const { user } = useAuthStore();
    const [article, setArticle] = useState<Article | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);
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

    const fetchData = async () => {
        try {
            const [articleData, commentsData] = await Promise.all([
                blogService.getArticleById(Number(id)),
                blogService.getAdminComments(Number(id))
            ]);
            setArticle(articleData);
            setComments(commentsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleToggleStatus = async () => {
        try {
            const updated = await blogService.toggleArticleStatus(Number(id));
            setArticle(updated);
        } catch (error) {
            console.error("Failed to toggle status", error);
            alert("Không thể thay đổi trạng thái bài viết");
        }
    };

    const handleToggleVisibility = async (commentId: number, isCurrentlyHidden: boolean) => {
        const action = isCurrentlyHidden ? "hiện lại" : "ẩn";
        if (confirm(`Bạn có chắc muốn ${action} bình luận này?`)) {
            try {
                await blogService.toggleCommentVisibility(commentId);
                fetchData(); // Refresh
            } catch (e) {
                alert(`Lỗi khi ${action} bình luận`);
            }
        }
    };

    const handleComment = async (e: React.FormEvent, parentId?: number) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        if (!user) return;

        setSubmitting(true);
        try {
            const displayName = (user.lastName && user.firstName)
                ? `${user.lastName} ${user.firstName}`
                : (user.userName || user.fullName || "Quản trị viên");

            await blogService.addComment(Number(id), {
                articleId: Number(id),
                userId: user.id.toString(),
                username: displayName,
                content: commentText,
                isAdmin: true,
                parentId: parentId
            });
            setCommentText("");
            setReplyingToId(null);
            fetchData();
        } catch (error) {
            console.error("Failed to add comment", error);
            alert("Có lỗi xảy ra khi gửi phản hồi");
        } finally {
            setSubmitting(false);
        }
    };

    const renderSingleComment = (comment: Comment) => (
        <div key={comment.id} className={`space-y-4 group ${comment.status === 'HIDDEN' ? 'opacity-60' : ''}`}>
            <div className="flex gap-6">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <span className={`font-black uppercase text-xs tracking-wider ${comment.isAdmin ? 'text-blue-400' : 'text-slate-400'}`}>
                                    {user && user.id.toString() === comment.userId ? "Bình luận của bạn" : comment.username}
                                </span>
                                {comment.isAdmin && <span className="bg-blue-500 text-[8px] px-1.5 py-0.5 rounded text-white font-black uppercase">Admin</span>}
                                {comment.status === 'HIDDEN' && <span className="bg-red-500/20 text-red-500 text-[8px] px-1.5 py-0.5 rounded font-black border border-red-500/30 uppercase">Đã ẩn</span>}
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">
                                {new Date(comment.createdAt || "").toLocaleString('vi-VN')}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {!comment.isAdmin && (
                                <button
                                    onClick={() => handleToggleVisibility(comment.id!, comment.status === 'HIDDEN')}
                                    className={`opacity-0 group-hover:opacity-100 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 ${comment.status === 'HIDDEN' ? 'text-green-500 hover:text-green-400' : 'text-red-500/50 hover:text-red-500'}`}
                                >
                                    {comment.status === 'HIDDEN' ? <Eye size={14} /> : <EyeOff size={14} />}
                                    {comment.status === 'HIDDEN' ? 'Hiện' : 'Ẩn'}
                                </button>
                            )}

                            {replyingToId !== comment.id &&
                                user && user.id.toString() !== comment.userId &&
                                !comments.some(c => c.parentId === comment.id) && (
                                    <button
                                        onClick={() => {
                                            setReplyingToId(comment.id!);
                                            setCommentText("");
                                        }}
                                        className="text-xs text-blue-500 font-black hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Reply size={14} /> Phản hồi
                                    </button>
                                )}
                        </div>
                    </div>
                    <div className={`p-6 rounded-2xl break-words leading-relaxed border transition-all text-lg ${comment.status === 'HIDDEN' ? 'bg-red-500/5 border-red-500/10 text-slate-500 grayscale' : 'bg-white/5 border-white/5 text-slate-300'}`}>
                        {comment.content}
                    </div>
                </div>
            </div>

            {/* Inline Reply Input */}
            <AnimatePresence>
                {replyingToId === comment.id && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[#111] border border-blue-500/30 rounded-3xl p-6 shadow-2xl mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Đang phản hồi @{comment.username}</span>
                                <button onClick={() => setReplyingToId(null)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Nhập nội dung phản hồi..."
                                className="w-full bg-transparent border-none focus:outline-none min-h-[100px] text-lg resize-none placeholder:text-slate-700"
                                autoFocus
                            />
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={(e) => handleComment(e, comment.id!)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3 rounded-xl flex items-center gap-3 transition-all shadow-xl shadow-blue-500/20"
                                >
                                    <Send size={18} /> GỬI PHẢN HỒI
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderThread = (parentId: number | null, depth = 0) => {
        const threadComments = comments
            .filter(c => c.parentId === (parentId === null ? undefined : parentId) || (parentId === null && !c.parentId))
            .sort((a, b) => {
                if (parentId === null) {
                    // Top level: newest first
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                } else {
                    // Replies: oldest first
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                }
            });

        return threadComments.map(comment => {
            const replyCount = countReplies(comment.id!);
            const isExpanded = expandedComments.includes(comment.id!);

            return (
                <div key={comment.id} className={`${depth === 1 ? 'ml-8 md:ml-16 border-l-2 border-blue-500/10 pl-8' : (depth > 1 ? 'ml-0 pl-0 border-0' : '')} space-y-6`}>
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!article) return <div className="text-white text-center py-20">Không tìm thấy bài viết</div>;

    return (
        <div className="text-white bg-transparent">
            {/* Admin Hero Header */}
            <div className="relative h-[55vh] w-full overflow-hidden">
                {article.thumbnailUrl ? (
                    <img
                        src={article.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-40 blur-[2px]"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-900/50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                <div className="absolute inset-0 p-10 md:p-16 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <Link href="/admin/blog" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl transition-all backdrop-blur-xl border border-white/10 font-bold uppercase text-[10px] tracking-widest">
                            <ArrowLeft size={16} /> Danh sách bài viết
                        </Link>
                        <div className="flex gap-4">
                            <button
                                onClick={handleToggleStatus}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/10 border ${article.status === 'PUBLISHED' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'}`}
                            >
                                {article.status === 'PUBLISHED' ? <><EyeOff size={20} /> ẨN BÀI VIẾT</> : <><Eye size={20} /> HIỆN BÀI VIẾT</>}
                            </button>
                            <Link href={`/admin/blog/${id}/edit`} className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-2xl flex items-center gap-3 font-black transition-all shadow-2xl shadow-blue-600/40">
                                <Edit3 size={20} /> CHỈNH SỬA
                            </Link>
                        </div>
                    </div>
                    <div className="max-w-6xl">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] break-words tracking-tighter"
                        >
                            {article.title}
                        </motion.h1>
                        <div className="flex flex-wrap gap-8 text-slate-300 text-xs font-black tracking-[0.2em] uppercase">
                            <span className="flex items-center gap-2"><Calendar size={18} className="text-blue-500" /> {new Date(article.createdAt || "").toLocaleDateString('vi-VN')}</span>
                            <span className={`px-4 py-1 rounded-full text-[9px] ${article.status === 'PUBLISHED' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'}`}>
                                {article.status === 'PUBLISHED' ? 'CÔNG KHAI' : 'BẢN NHÁP'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Single Column Layout Focused on Content */}
            <div className="max-w-4xl mx-auto p-10 md:p-20">
                <article className="prose prose-invert max-w-none">
                    {article.summary && (
                        <div className="text-2xl leading-relaxed text-slate-400 whitespace-pre-wrap break-words italic font-light mb-16 border-l-4 border-blue-500/50 pl-8 bg-white/5 p-8 rounded-r-3xl">
                            {article.summary}
                        </div>
                    )}
                    <div className="text-2xl text-slate-200 leading-[1.8] whitespace-pre-wrap break-words font-medium mb-32">
                        {article.content}
                    </div>
                </article>

                <div className="h-px bg-white/10 mb-24" />

                {/* Discussions focused on replying */}
                <section>
                    <h3 className="text-3xl font-black mb-16 text-blue-500 tracking-tighter uppercase italic flex items-center gap-4">
                        <MessageSquare size={32} /> Quản lý bình luận ({comments.length})
                    </h3>

                    <div className="space-y-12">
                        {comments.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                                <p className="text-slate-500 italic text-xl uppercase tracking-widest">Không có thảo luận nào</p>
                            </div>
                        ) : (
                            renderComments()
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminArticleDetailPage;
