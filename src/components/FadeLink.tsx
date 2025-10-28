"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

/** 클릭 시 짧은 페이드아웃 후 라우팅 */
export default function FadeLink({ href, children }: { href: string; children: ReactNode }) {
  const router = useRouter();
  const [fading, setFading] = useState(false);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setFading(true);
    setTimeout(() => router.push(href), 150);
  };

  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        opacity: fading ? 0.2 : 1,
        transition: "opacity 120ms linear",
      }}
    >
      {children}
    </a>
  );
}
