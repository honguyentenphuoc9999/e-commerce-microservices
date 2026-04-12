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
  hydrated: boolean;
  setAuth: (token: string, userName: string, id?: number | string, role?: string) => void;
  setHydrated: (state: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setAuth: (token, userName, id, role) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ token, user: { userName, id, role } });
      },
      setHydrated: (state) => set({ hydrated: state }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('cartId');
        }
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: (state) => {
        return () => state.setHydrated(true); // Ghi nhận đã hydrate xong
      }
    }
  )
);
