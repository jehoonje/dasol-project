import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  isOwner: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || "owner@example.com";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isOwner: false,
  isLoading: true,

  signIn: async (email: string, password: string) => {
    try {
      console.log("로그인 시도:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("로그인 에러 상세:", {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        throw error;
      }

      console.log("로그인 성공:", data.user?.email);
      const isOwner = data.user?.email === OWNER_EMAIL;
      set({ user: data.user, isOwner });
    } catch (error) {
      console.error("로그인 실패:", error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isOwner: false });
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const isOwner = user?.email === OWNER_EMAIL;
      set({ user, isOwner, isLoading: false });
    } catch (error) {
      console.error("인증 확인 실패:", error);
      set({ user: null, isOwner: false, isLoading: false });
    }
  },
}));
