"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "../app/store/useUIStore";

export default function BodyBackground() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const bgUrl = useUIStore((s) => s.backgroundImageUrl);

  useEffect(() => {
    const el = document.body;

    if (isHome && bgUrl) {
      el.style.backgroundImage = `url(${bgUrl})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.backgroundRepeat = "no-repeat";
    } else {
      // Home이 아니거나 bgUrl이 없으면 즉시 원복
      el.style.backgroundImage = "none";
      el.style.backgroundSize = "";
      el.style.backgroundPosition = "";
      el.style.backgroundRepeat = "";
    }

    // 컴포넌트 언마운트 시에도 확실히 원복
    return () => {
      el.style.backgroundImage = "none";
      el.style.backgroundSize = "";
      el.style.backgroundPosition = "";
      el.style.backgroundRepeat = "";
    };
  }, [isHome, bgUrl]);

  return null;
}
