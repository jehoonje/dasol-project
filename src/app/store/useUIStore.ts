"use client";
import { create } from "zustand";

type UIState = {
  backgroundImageUrl: string | null;
  setBackgroundImageUrl: (url: string | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  backgroundImageUrl: null,
  setBackgroundImageUrl: (url) => set({ backgroundImageUrl: url }),
}));
