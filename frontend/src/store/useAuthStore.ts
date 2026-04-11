import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id?: number | string;
  userName: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, userName: string, id?: number | string, role?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, userName, id, role) => {
        // Đồng thời lưu vào localStorage nguyên bản để apiClient interceptors dễ đọc đồng bộ
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ token, user: { userName, id, role } });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage', // Key lưu trên localStorage của zustand
    }
  )
);
