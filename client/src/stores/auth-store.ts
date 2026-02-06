import { create } from 'zustand';

interface AuthState {
  isLoggingOut: boolean;
  setLoggingOut: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggingOut: false,
  setLoggingOut: (value) => set({ isLoggingOut: value }),
}));
