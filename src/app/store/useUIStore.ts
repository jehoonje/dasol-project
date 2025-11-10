import { create } from "zustand";

interface UIStore {
  backgroundImageUrl: string | null;
  setBackgroundImageUrl: (url: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  backgroundImageUrl: null,
  setBackgroundImageUrl: (url) => {
    console.log("[useUIStore] Setting bgUrl:", url); // 디버깅
    set({ backgroundImageUrl: url });
  },
}));