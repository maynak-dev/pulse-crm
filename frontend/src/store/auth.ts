import { create } from "zustand";

interface User { id: string; email: string; name: string }
interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
    location.href = "/login";
  },
}));
