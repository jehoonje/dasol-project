"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

// Framer Motion을 사용하는 무거운 컴포넌트를 동적으로 로드
const AnimatedImageModal = dynamic(() => import("./AnimatedImageModal"), {
  ssr: false,
});

type Ctx = {
  open: (src: string, alt?: string) => void;
  close: () => void;
};

const PreviewCtx = createContext<Ctx | null>(null);

export function useImagePreview() {
  const ctx = useContext(PreviewCtx);
  if (!ctx) throw new Error("ImagePreviewProvider가 트리 위에 있어야 합니다.");
  return ctx;
}

/**
 * 전역 이미지 프리뷰
 * - 문서 전체 클릭(capture)에서 <img>를 감지해 모달 오픈
 * - 제외하고 싶은 이미지는 data-nopreview="true" 속성으로 opt-out
 * - 너무 작은 아이콘(48px 미만)은 자동 제외
 * - ESC로 닫기, 모달 열릴 때 body 스크롤 락
 */
export default function ImagePreviewProvider({ children }: { children: React.ReactNode }) {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const openPreview = useCallback((s: string, a?: string) => {
    setSrc(s);
    setAlt(a);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  // 전역 클릭 캡처: 모든 <img>를 프리뷰
  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (open) return; // 이미 모달 열려 있으면 무시
      if (e.defaultPrevented) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const img = target.closest("img") as HTMLImageElement | null;
      if (!img) return;

      // opt-out
      if (img.dataset.nopreview === "true") return;
      const containerOptOut = img.closest("[data-nopreview='true']");
      if (containerOptOut) return;

      // 너무 작은 아이콘은 제외 (필요 없으면 제거해도 됨)
      const r = img.getBoundingClientRect();
      if (r.width < 48 && r.height < 48) return;

      // 링크/버튼 등 기본 동작 대신 프리뷰
      e.preventDefault();
      e.stopPropagation();

      openPreview(img.currentSrc || img.src, img.alt || undefined);
    };

    // 캡처 단계에서 먼저 가로챔
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [open, openPreview]);

  // 바디 스크롤 락
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const value = useMemo<Ctx>(() => ({ open: openPreview, close }), [openPreview, close]);

  return (
    <PreviewCtx.Provider value={value}>
      {children}
      <AnimatedImageModal open={open} src={src} alt={alt} onClose={close} />
    </PreviewCtx.Provider>
  );
}
