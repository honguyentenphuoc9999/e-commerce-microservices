"use client";
import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { blogService, Article } from "@/services/blogService";
import { motion } from "framer-motion";
import { ArrowRight, Clock, FileText } from "lucide-react";

const BlogListPage = () => {
    const { data: articlesData, isLoading } = useQuery({
        queryKey: ["published-articles"],
        queryFn: () => blogService.getPublishedArticles(),
    });

    const articles = articlesData?.content || (Array.isArray(articlesData) ? articlesData : []);

    return (
        <div className="min-h-screen bg-[#050816] text-white">
            <Header />

            <main className="pt-40 pb-20 px-6 container mx-auto">
                <div className="mb-16 space-y-4">
                    <div className="inline-block px-4 py-1.5 bg-[#e9c349]/10 border border-[#e9c349]/20 text-[#e9c349] text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">
                        Phuoc Techno Blog
                    </div>
                    <h1 className="text-6xl font-bold tracking-tighter">Tin Tức Công Nghệ</h1>
                    <p className="text-slate-400 max-w-2xl font-medium">
                        Cập nhật xu hướng, đánh giá sản phẩm và hướng dẫn công nghệ mới nhất từ đội ngũ chuyên gia của chúng tôi.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white/5 rounded-[32px] animate-pulse" />
                        ))
                    ) : articles.length === 0 ? (
                        <div className="text-center py-40 bg-white/5 rounded-[32px] border border-white/10">
                            <FileText size={64} className="mx-auto text-slate-500 mb-6" />
                            <h2 className="text-2xl font-bold text-slate-300">Chưa có bài viết nào</h2>
                            <p className="text-slate-500">Quay lại sau nhé!</p>
                        </div>
                    ) : (
                        articles.map((article: Article, index: number) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Link 
                                    href={`/blog/${article.id}`}
                                    className="group grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-[#e9c349]/30 p-4 md:p-8 rounded-[40px] transition-all duration-500"
                                >
                                    <div className={`space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                                        <div className="flex items-center gap-4 text-xs text-[#e9c349] font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {new Date(article.createdAt!).toLocaleDateString('vi-VN')}
                                            </span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span>Technology</span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-bold leading-tight group-hover:text-[#e9c349] transition-colors duration-300">
                                            {article.title}
                                        </h2>
                                        <p className="text-slate-400 line-clamp-3 font-medium leading-relaxed">
                                            {/* Strip HTML tags for preview */}
                                            {article.content.replace(/<[^>]*>?/gm, '').substring(0, 200)}...
                                        </p>
                                        <div className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-[#e9c349] group-hover:translate-x-2 transition-transform duration-300">
                                            Đọc tiếp <ArrowRight className="ml-2 h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className={`relative h-[300px] md:h-[400px] overflow-hidden rounded-[32px] ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                                        <img 
                                            src={article.thumbnailUrl || "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"} 
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogListPage;
