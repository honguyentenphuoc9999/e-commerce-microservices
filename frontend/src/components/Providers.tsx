"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

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
    </QueryClientProvider>
  );
}
