"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "../app/store/useUIStore";

export default function BodyBackground() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const bgUrl = useUIStore((s) => s.backgroundImageUrl);
  const setBg = useUIStore((s) => s.setBackgroundImageUrl);

  // 홈 첫 진입 시: localStorage → 서버 순으로 확인
  useEffect(() => {
    if (!isHome) return;

    // 1. 먼저 localStorage 확인 (빠른 로딩)
    try {
      const saved = localStorage.getItem("bgUrl");
      if (saved && !bgUrl) {
        setBg(saved);
      }
    } catch {}

    // 2. 서버에서 최신 데이터 가져오기 (항상 실행하여 동기화)
    fetch("/api/background")
      .then((r) => r.json())
      .then(({ url }) => { 
        if (url && url !== bgUrl) {
          setBg(url);
          // localStorage도 업데이트
          try {
            localStorage.setItem("bgUrl", url);
          } catch {}
        }
      })
      .catch(() => {});
  }, [isHome, setBg]); // bgUrl 의존성 제거

  // 홈일 때만 백그라운드 레이어 표시
  if (!isHome || !bgUrl) return null;

  return (
    <div id="home-bg-layer" aria-hidden="true">
      <img src={bgUrl} alt="" />
    </div>
  );
}