import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: {
    username: string | null;
    role: 'user' | 'admin' | null;
    status: 'pending' | 'active' | 'rejected' | null;
  } | null;
  isAdmin: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: AuthState['user']) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAdmin: false,
      setToken: (token: string | null) => {
        set({ token });
      },
      setUser: (user: AuthState['user']) => {
        set({ 
          user,
          isAdmin: user?.role === 'admin'
        });
      },
      setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
      logout: () => set({ token: null, user: null, isAdmin: false })
    }),
    {
      name: 'auth-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        return state;
      },
    }
  )
);
