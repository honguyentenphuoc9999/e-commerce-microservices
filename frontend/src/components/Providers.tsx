"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Tạo QueryClient instance duy nhất cho toàn bộ session của frontend
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Cache dữ liệu trong vòng 1 phút
        refetchOnWindowFocus: false, // Tạm tắt tự call lại API khi chuyển tab
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        theme="dark"
        toastOptions={{
          style: {
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
          success: {
            style: {
              background: 'rgba(16, 185, 129, 0.15)', // Xanh lá mờ
              border: '1px solid rgba(16, 185, 129, 0.3)',
            },
          },
          error: {
            style: {
              background: 'rgba(239, 68, 68, 0.15)', // Đỏ mờ
              border: '1px solid rgba(239, 68, 68, 0.3)',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
