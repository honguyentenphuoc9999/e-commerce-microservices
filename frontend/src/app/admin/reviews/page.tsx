"use client";
import React, { useState } from "react";
import {
  Search,
  Filter,
  Star,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreVertical,
  StarOff,
  StarHalf,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Pin,
  Image as ImageIcon
} from "lucide-react";

const AdminReviews = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reviews = [
    {
      id: "#REV-001",
      product: "Chronos Gold Watch",
      category: "Phụ kiện cao cấp",
      user: "USR-101",
      userName: "Anh Tuấn Nguyễn",
      rating: 5,
      date: "22/10/2023",
      content: "Sản phẩm rất đẹp, đóng gói cẩn thận. Màu vàng của đồng hồ nhìn rất sang trọng và đẳng cấp, đúng như hình ảnh mô tả trên website. Giao hàng nhanh hơn dự kiến 2 ngày. Sẽ tiếp tục ủng hộ Digital Atelier trong tương lai.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEKHWmVixMTsi7liKzNGa6ADPelc9YfK9zXEZVhpO1QaxVApiDNrXIedvl9KmAz4sWErsWjlz5zV_Mk4kQTlwlyCgPRfsRCayEzDFkW1eURehE_5nm3lqvzRRIqk0GeLN8n2hHL24X6MwXIhqj7lwqMls0SAboQAlTBxi9KuUU0sjY287n-DtuMoJ4vuDDA-vt2KjaMYNOGnkdbIwbPYha5Rp6hfzKH6Q91hhfQipRuAATLQcqfdC99BY_hutzLJjlEmrvm-xj_g",
      reviewPhotos: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAQvfvO3ylwkXndht4azlmSz5ZOgHXZKeTlk7rI_0NYbZFzrMtSnfHO2JF7L0_zBIOj1PmZ6hkNGxo_bTCah0y2eeEAt0udafiPZgG3whwmd9DqXF6zaCQL3qexbBs3RTTxAgP1Q7xp4ZlnKhqklZxZjcYJNYhgidL3YVqBHEretgRS1jOhqWG_EmCv6gnxT9zEagBEKapS2nzOF-2AFnM2fhxDNhSKQe0A9HZ0r4ub2aerTQ_j2XO9IQ-RhGuJH_nG17v_NqzYcA",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBjraU9v6JGIxwKntbwyQYGuk_SD1IyHUAmddWZ3XezVb74xBPAi3biBaPZ_an2-Sm4ZJiiBHYunRwMM24La2hdft4XAry5HZ3Nz2ceh-q5Cz9T1PCfDF8dKWw2AxAy40sfKuJElb0OoVqY-m9j6tWznYUZXMCvUYJzFf1r2Ybb0eFHS_x_m7NFjtYxm1Ypxftf8k4DwYGRlKp7kgjkKEZXn9JP7FAEuAjIuhm0k6XhCef2Tz8oyt9rmwn9zWhAOZZ0T8ueFYl2jA"
      ]
    },
    {
      id: "#REV-002",
      product: "Atelier Leather Bag",
      category: "Túi xách & Da",
      user: "USR-205",
      userName: "Minh Hạnh",
      rating: 4,
      date: "21/10/2023",
      content: "Trọng lượng và độ chính xác tuyệt vời. Dây đeo hơi cứng hơn so với mong đợi nhưng đang dần mềm ra.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIe5Ti0_sAkev2bJJ-WibZWJN1fpoUULKa9ZMPTN85-P1iDcEOT_YXJhwJEON7wCNixovTxW6uFTgOaCaPOTey-h4PH2sN3SseYOlko7CLaAbkZgQnLzPEM5UqujL5AjrtzPem-XgALUYxbmZ7mAozQIiXU3IFQKjMkHchaTmV-8yRrEf1qJYEBdYSp1nnHBC6OOJX2MIjfiDzPOCFJthKQgOpOP_HP5qzlkQMtbh_8cAVwt8pd9Fs3bN4AO6hEPEPd_Hg1ia09g"
    }
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-12 space-y-12 bg-gradient-to-b from-[#0b1326] to-[#0f172a] animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[#e9c349] font-headline tracking-widest text-xs uppercase mb-2 italic">Phản hồi khách hàng</p>
          <h1 className="font-headline text-5xl font-black tracking-tight text-white mb-2">Quản lý Đánh giá</h1>
          <div className="flex items-center gap-3">
            <p className="text-slate-500 font-body text-sm">Giám sát trải nghiệm người dùng và phản hồi dịch vụ.</p>
            <span className="px-3 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-bold tracking-widest uppercase border border-amber-400/20 shadow-[0_0_10px_rgba(233,195,73,0.1)]">Live Feed</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#e9c349] transition-colors" />
            <input
              className="bg-[#131b2e] border-none rounded-xl pl-12 pr-6 py-3.5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 placeholder:text-slate-600 transition-all outline-none w-64 shadow-2xl shadow-black/40 border border-white/5"
              placeholder="Tìm kiếm đánh giá..."
              type="text"
            />
          </div>
        </div>
      </header>

      {/* Overview Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#131b2e] rounded-2xl p-8 relative overflow-hidden group border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-blue-400/10"></div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3">Tổng số đánh giá</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-headline font-black text-white tracking-tighter">1,284</h3>
            <span className="text-emerald-400 text-sm font-bold flex items-center mb-1 gap-1">
              <Star size={14} className="fill-emerald-400 text-emerald-400" />
              +12%
            </span>
          </div>
          <div className="mt-6 h-1 w-full bg-[#171f33] rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div className="h-full bg-blue-400 w-3/4 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
          </div>
        </div>
        <div className="bg-[#131b2e] rounded-2xl p-8 relative overflow-hidden group border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e9c349]/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-[#e9c349]/10"></div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3">Điểm trung bình</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-headline font-black text-white tracking-tighter">4.8/5</h3>
            <div className="flex text-[#e9c349] mb-1.5 gap-1">
              {[...Array(4)].map((_, i) => <Star key={i} size={16} className="fill-[#e9c349] text-[#e9c349]" />)}
              <StarHalf size={16} className="fill-[#e9c349] text-[#e9c349]" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-5 italic uppercase tracking-wider">Dựa trên 1,284 phản hồi quý 4</p>
        </div>
        <div className="bg-[#131b2e] rounded-2xl p-8 relative overflow-hidden group border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-emerald-400/10"></div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3">Tỷ lệ hài lòng</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-headline font-black text-white tracking-tighter">94%</h3>
            <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-black rounded-full mb-1.5 uppercase tracking-widest border border-emerald-400/20">Premium Status</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-5 italic uppercase tracking-wider">Lượt đánh giá tích cực 4-5 sao</p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="flex flex-col md:flex-row gap-6 items-center justify-between bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-[#0b1326] rounded-xl border border-white/5">
            <button className="px-6 py-2 rounded-lg bg-[#222a3d] text-white text-xs font-black shadow-lg shadow-black/40 border border-[#e9c349]/20 uppercase tracking-widest">Tất cả</button>
            <button className="px-6 py-2 rounded-lg text-slate-500 hover:text-white text-xs font-bold transition-all uppercase tracking-widest">5 Sao</button>
            <button className="px-6 py-2 rounded-lg text-slate-500 hover:text-white text-xs font-bold transition-all uppercase tracking-widest">4 Sao</button>
            <button className="px-6 py-2 rounded-lg text-slate-500 hover:text-white text-xs font-bold transition-all uppercase tracking-widest">1-3 Sao</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trang 1 / 129</span>
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0b1326] text-slate-500 hover:text-white transition-all border border-white/5 shadow-xl hover:bg-[#222a3d]"><ChevronLeft size={18} /></button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0b1326] text-slate-500 hover:text-white transition-all border border-white/5 shadow-xl hover:bg-[#222a3d]"><ChevronRight size={18} /></button>
          </div>
        </div>
      </section>

      {/* Reviews Table Section */}
      <section className="bg-[#131b2e] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#171f33]/50 text-slate-500 font-label text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5">
              <th className="py-6 px-10">ID Đánh giá</th>
              <th className="py-6 px-10">Sản phẩm</th>
              <th className="py-6 px-10">Khách hàng</th>
              <th className="py-6 px-10 text-center">Xếp hạng</th>
              <th className="py-6 px-10">Ngày gửi</th>
              <th className="py-6 px-10 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reviews.map((rev) => {
              const isExpanded = expandedId === rev.id;
              return (
                <React.Fragment key={rev.id}>
                  <tr
                    onClick={() => toggleExpand(rev.id)}
                    className={`group transition-all cursor-pointer ${isExpanded ? 'bg-[#e9c349]/5' : 'hover:bg-white/[0.02]'}`}
                  >
                    <td className="py-8 px-10 font-mono text-xs text-slate-500 group-hover:text-[#e9c349] transition-colors font-bold uppercase">{rev.id}</td>
                    <td className="py-8 px-10">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-16 rounded-xl bg-[#0b1326] overflow-hidden flex-shrink-0 border border-white/10 shadow-xl group-hover:border-[#e9c349]/30 transition-all duration-300">
                          <img src={rev.image} alt={rev.product} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 px-1 py-1" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white group-hover:text-[#e9c349] transition-colors leading-tight">{rev.product}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">{rev.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-10">
                      <p className="text-sm font-black text-white">{rev.userName}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono">ID: {rev.user}</p>
                    </td>
                    <td className="py-8 px-10">
                      <div className="flex text-[#e9c349] gap-1 justify-center items-center h-full">
                        {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} className="fill-[#e9c349] text-[#e9c349]" />)}
                        {[...Array(5 - rev.rating)].map((_, i) => <Star key={i} size={14} className="opacity-10 text-slate-500" />)}
                      </div>
                    </td>
                    <td className="py-8 px-10 text-xs font-bold text-slate-400 uppercase tracking-widest">{rev.date}</td>
                    <td className="py-8 px-10 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <div className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-[#e9c349] text-[#0b1326] rotate-180' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
                          <ChevronDown size={14} />
                        </div>
                        <button className="p-3 rounded-xl bg-[#222a3d] text-slate-400 hover:text-white transition-all shadow-xl shadow-black/20 border border-white/5 group-hover:opacity-100 opacity-0">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-[#0b1326]/60 border-l-[6px] border-[#e9c349] animate-in slide-in-from-top-2 duration-300">
                      <td className="px-10 py-0 overflow-hidden" colSpan={6}>
                        <div className="py-12 px-12 space-y-10">
                          <div className="flex flex-col lg:flex-row gap-16">
                            <div className="flex-1 space-y-6">
                              <div className="flex items-center gap-3">
                                <MessageSquare size={18} className="text-[#e9c349]" />
                                <h4 className="text-[11px] font-black text-[#e9c349] uppercase tracking-[0.25em]">Nội dung phản hồi tinh hoa:</h4>
                              </div>
                              <div className="relative">
                                <div className="absolute top-0 left-0 w-8 h-8 -translate-x-4 -translate-y-4 opacity-10">
                                  <MessageSquare size={32} />
                                </div>
                                <p className="text-white text-lg leading-relaxed font-light italic bg-white/5 p-10 rounded-4xl border border-white/5 shadow-inner relative z-10">
                                  "{rev.content}"
                                </p>
                              </div>
                              <div className="mt-10 flex gap-6">
                                <button className="px-10 py-4 rounded-xl bg-[#e9c349] text-[#0b1326] text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all">Trả lời khách hàng</button>
                                <button className="px-10 py-4 rounded-xl bg-white/5 text-slate-300 text-[11px] font-black uppercase tracking-[0.25em] hover:text-white transition-all flex items-center gap-4 border border-white/5">
                                  <Pin size={16} />
                                  Ghim đánh giá
                                </button>
                                <button className="px-4 py-4 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 ml-auto">
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                            {rev.reviewPhotos && (
                              <div className="lg:w-[400px] grid grid-cols-2 gap-6">
                                {rev.reviewPhotos.map((photo, i) => (
                                  <div key={i} className="group/photo relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-3xl cursor-zoom-in">
                                    <img src={photo} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover grayscale opacity-70 group-hover/photo:grayscale-0 group-hover/photo:opacity-100 group-hover/photo:scale-110 transition-all duration-1000" />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-end p-6">
                                      <div className="flex items-center gap-2">
                                        <ImageIcon size={16} className="text-[#e9c349]" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest text-[#e9c349]">Đính kèm {i + 1}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Footer Support */}
      <footer className="pt-12 flex justify-between items-center opacity-30 border-t border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.5em]">Protocol v4.2.1 Stable</p>
        <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest">
          <span className="text-slate-400">Chính sách bảo mật</span>
          <span className="text-slate-400">Trung tâm hỗ trợ</span>
        </div>
      </footer>
    </div>
  );
};

export default AdminReviews;
