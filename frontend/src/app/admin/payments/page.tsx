"use client";
import React, { useState } from "react";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Banknote,
  Wallet,
  Settings2,
  Save,
  Building,
  Loader2,
  Inbox
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

const PaymentsPage = () => {
  const queryClient = useQueryClient();

  // Fetch all orders for dynamic payment stats and table
  const { data: allOrders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['adminOrdersForPayments'],
    queryFn: () => adminService.getOrders()
  });

  // Calculate dynamic stats
  const totalRevenue = React.useMemo(() => {
    return allOrders
      .filter((o: any) => o.paymentStatus === 'PAID')
      .reduce((acc: number, o: any) => acc + (o.total || 0), 0);
  }, [allOrders]);

  const paymentSuccessRate = React.useMemo(() => {
    if (allOrders.length === 0) return 0;
    const paidCount = allOrders.filter((o: any) => o.paymentStatus === 'PAID').length;
    return ((paidCount / allOrders.length) * 100).toFixed(1);
  }, [allOrders]);

  // Format orders to payments list
  const payments = React.useMemo(() => {
    return allOrders.map((o: any) => ({
      id: `PAY-${1000 + o.id}`,
      orderId: `ATL-${80000 + o.id}`,
      customer: o.user?.userName || o.user?.email || "Khách Vãng Lai",
      method: o.paymentMethod || "VietQR / MB Bank",
      amount: `$${(o.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      date: o.orderedDate || new Date().toISOString().split('T')[0],
      status: o.paymentStatus === 'PAID' ? "Thành công" : (o.paymentStatus === 'FAILED' ? "Thất bại" : "Chờ xử lý"),
      statusColor: o.paymentStatus === 'PAID' 
         ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" 
         : (o.paymentStatus === 'FAILED' ? "text-rose-400 bg-rose-400/10 border-rose-400/20" : "text-slate-400 bg-slate-400/10 border-white/5"),
    }));
  }, [allOrders]);

  const { data: configData, isLoading: isConfigLoading } = useQuery({
    queryKey: ['adminPaymentConfig'],
    queryFn: () => adminService.getPaymentConfig()
  });

  const [bankConfig, setBankConfig] = useState({
    bankId: "MB",
    accountNo: "",
    accountName: "",
    template: "compact2"
  });

  // Sync loaded config to state
  React.useEffect(() => {
    if (configData) {
      setBankConfig({
        bankId: configData.bankId || "MB",
        accountNo: configData.accountNo || "",
        accountName: configData.accountName || "",
        template: configData.template || "compact2"
      });
    }
  }, [configData]);

  const configMutation = useMutation({
    mutationFn: (data: any) => adminService.updatePaymentConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPaymentConfig'] });
      toast.success("Cập nhật thông tin nhận tiền thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật thiết lập thanh toán.");
    }
  });

  const handleUpdateConfig = () => {
    configMutation.mutate(bankConfig);
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-1000 bg-linear-to-b from-[#0b1326] to-[#0f172a]">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[#e9c349] font-headline tracking-widest text-xs uppercase mb-2 italic">Tài chính hệ thống</p>
          <h1 className="text-5xl font-black font-headline text-white tracking-tighter">Quản lý thanh toán</h1>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-8 py-4 bg-white/5 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl border border-white/10 hover:bg-white/10 transition-all font-headline shadow-2xl">
            <Download size={18} /> Xuất báo cáo tài chính
          </button>
        </div>
      </header>

      {/* Admin Bank Config Section */}
      <section className="bg-linear-to-br from-[#171f33] to-[#131b2e] p-10 rounded-3xl border border-[#e9c349]/20 shadow-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e9c349]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start lg:items-center justify-between">
           <div className="max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <Settings2 className="text-[#e9c349]" size={24} />
                <h2 className="text-white font-headline font-black text-2xl tracking-tight">Cấu hình nhận tiền</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-body">Cập nhật thông tin tài khoản ngân hàng để hệ thống tự động tạo mã **VietQR** hoặc hướng dẫn chuyển khoản cho khách hàng.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 w-full max-w-3xl">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#e9c349]">Tên Ngân hàng</label>
                <div className="relative">
                   <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input 
                      value={bankConfig.bankId}
                      onChange={(e) => setBankConfig({...bankConfig, bankId: e.target.value})}
                      placeholder="Ví dụ: MB, VCB, TCB..."
                      className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all uppercase placeholder:normal-case placeholder:text-slate-700 font-bold"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#e9c349]">Số tài khoản</label>
                <div className="relative">
                   <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input 
                      value={bankConfig.accountNo}
                      onChange={(e) => setBankConfig({...bankConfig, accountNo: e.target.value})}
                      placeholder="Số tài khoản ngân hàng..."
                      className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all placeholder:text-slate-700 font-bold tracking-wider"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#e9c349]">Tên chủ tài khoản</label>
                <input 
                   value={bankConfig.accountName}
                   onChange={(e) => setBankConfig({...bankConfig, accountName: e.target.value})}
                   className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all uppercase font-bold"
                />
              </div>
              <div className="flex items-end">
                <button 
                   disabled={configMutation.isPending || isConfigLoading}
                   onClick={handleUpdateConfig}
                   className={`w-full py-4 bg-[#e9c349] text-[#0b1326] rounded-xl font-headline font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#e9c349]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10 ${(configMutation.isPending || isConfigLoading) ? 'opacity-50 cursor-not-allowed text-center' : ''}`}
                >
                   {configMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Cập nhật thông tin
                </button>
              </div>
           </div>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#e9c349]/20 transition-all">
          <Banknote className="text-[#e9c349] mb-4" size={32} />
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Doanh thu thuần</p>
          <h3 className="text-3xl font-headline font-black text-white">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
        </div>
        <div className="bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <Wallet className="text-blue-400 mb-4" size={32} />
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Ví điện tử</p>
          <h3 className="text-3xl font-headline font-black text-white">$0.00</h3>
        </div>
        <div className="bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <CreditCard className="text-purple-400 mb-4" size={32} />
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Đối soát Thẻ</p>
          <h3 className="text-3xl font-headline font-black text-white">$0.00</h3>
        </div>
        <div className="bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <CheckCircle className="text-emerald-400 mb-4" size={32} />
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Tỷ lệ thanh toán</p>
          <h3 className="text-3xl font-headline font-black text-white">{paymentSuccessRate}%</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#131b2e]/50 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#e9c349] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm mã giao dịch hoặc khách hàng..." 
            className="w-full bg-[#0b1326] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-[#e9c349]/40 outline-none transition-all shadow-inner placeholder:text-slate-700"
          />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-3 bg-[#131b2e] text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 hover:text-white transition-all hover:bg-white/5">
            <Filter size={16} /> Lọc nâng cao
          </button>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-[#131b2e] rounded-3xl overflow-hidden border border-white/5 shadow-3xl bg-linear-to-b from-[#131b2e] to-[#0b1326]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.25em] font-label border-b border-white/5 bg-[#171f33]/30">
                <th className="px-10 py-6 font-black">Mã giao dịch</th>
                <th className="px-10 py-6 font-black">Khách hàng</th>
                <th className="px-10 py-6 font-black">Phương thức</th>
                <th className="px-10 py-6 font-black text-right">Số tiền</th>
                <th className="px-10 py-6 font-black text-center">Trạng thái</th>
                <th className="px-10 py-6 font-black text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isOrdersLoading ? (
                 <tr>
                   <td colSpan={6} className="px-10 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                      Đang tải dữ liệu...
                   </td>
                 </tr>
              ) : payments.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-10 py-12 text-center text-slate-600">
                      <Inbox className="mx-auto mb-4 opacity-50" size={32} />
                      <p className="font-bold uppercase tracking-widest text-xs">Danh sách thanh toán trống</p>
                   </td>
                 </tr>
              ) : (
                payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-[#e9c349]/5 transition-all cursor-pointer group">
                    <td className="px-10 py-8">
                      <p className="font-mono text-xs text-[#e9c349] font-bold tracking-widest">{payment.id}</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Ref: {payment.orderId}</p>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-headline font-black text-white text-sm group-hover:text-[#e9c349] transition-colors">{payment.customer}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">{payment.date}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 text-xs text-slate-300 font-bold uppercase tracking-wider">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                           <CreditCard size={14} className="text-[#e9c349]" />
                        </div>
                        {payment.method}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right font-headline font-black text-white text-lg">{payment.amount}</td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border inline-flex items-center gap-2 shadow-2xl ${payment.statusColor}`}>
                        {payment.status === "Thành công" && <CheckCircle size={10} />}
                        {payment.status === "Chờ xử lý" && <Clock size={10} />}
                        {payment.status === "Thất bại" && <AlertCircle size={10} />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="p-3 text-slate-500 hover:text-white transition-all bg-white/5 rounded-xl hover:bg-[#e9c349] hover:text-[#0b1326] border border-white/5">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="pt-8 text-center opacity-30">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.5em]">Atelier Financial Protocol v1.4</p>
      </footer>
    </div>
  );
};

export default PaymentsPage;
