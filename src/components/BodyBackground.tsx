"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "../app/store/useUIStore";

export default function BodyBackground() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const bgUrl = useUIStore((s) => s.backgroundImageUrl);
  const setBg = useUIStore((s) => s.setBackgroundImageUrl);

  // 홈 첫 진입/새로고침 시 서버 저장된 최신 배경 URL 불러오기
  useEffect(() => {
    if (!isHome) return;
    if (!bgUrl) {
      fetch("/api/background")
        .then((r) => r.json())
        .then(({ url }) => { if (url) setBg(url); })
        .catch(() => {});
    }
  }, [isHome, bgUrl, setBg]);

  // 홈일 때만 백그라운드 레이어 표시
  if (!isHome || !bgUrl) return null;

  return (
    <div id="home-bg-layer" aria-hidden="true">
      <img src={bgUrl} alt="" />
    </div>
  );
}
