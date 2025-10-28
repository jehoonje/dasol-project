"use client";

import { useEffect } from "react";
import { useUIStore } from "../app/store/useUIStore";

export default function BodyBackground() {
  const bgUrl = useUIStore((s) => s.backgroundImageUrl);

  useEffect(() => {
    const el = document.body;
    if (bgUrl) {
      el.style.backgroundImage = `url(${bgUrl})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.backgroundRepeat = "no-repeat";
    } else {
      el.style.backgroundImage = "none";
    }
  }, [bgUrl]);

  return null;
}
