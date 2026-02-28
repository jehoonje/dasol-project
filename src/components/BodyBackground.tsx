"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "../app/store/useUIStore";
import Image from "next/image";

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
      //console.log("[BodyBackground] localStorage bgUrl:", saved); // 디버깅
      if (saved) {
        setBg(saved);
      }
    } catch (e) {
      console.error("[BodyBackground] localStorage error:", e);
    }

    // 2. 서버에서 최신 데이터 가져오기 (항상 실행하여 동기화)
    fetch("/api/background")
      .then((r) => r.json())
      .then(({ url }) => { 
        //console.log("[BodyBackground] API response url:", url); // 디버깅
        if (url) {
          setBg(url);
          // localStorage도 업데이트
          try {
            localStorage.setItem("bgUrl", url);
          } catch {}
        }
      })
      .catch((err) => {
        console.error("[BodyBackground] API error:", err);
      });
  }, [isHome, setBg]); // bgUrl 의존성 제거 유지

  // 홈일 때만 백그라운드 레이어 표시
  //console.log("[BodyBackground] Render - isHome:", isHome, "bgUrl:", bgUrl); // 디버깅
  
  if (!isHome || !bgUrl) return null;

  return (
    <div id="home-bg-layer" aria-hidden="true">
      <Image 
        src={bgUrl} 
        alt="background" 
        fill // 화면(부모 요소)에 꽉 차게 채웁니다.
        priority // 배경화면은 화면에 가장 먼저 보여야 하므로 priority를 주어 로딩 우선순위를 높입니다 (LCP 최적화).
        style={{
          objectFit: "cover", // 비율을 유지하면서 화면에 꽉 차게 자릅니다.
          objectPosition: "center", // 중앙을 기준으로 맞춥니다.
        }}
        
        onError={(e) => console.error("[BodyBackground] Image error:", bgUrl)}
      />
    </div>
  );
}