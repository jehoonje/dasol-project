"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next"; // ✅ typedRoutes 대응

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: Route; // ✅ string 대신 Route
};

export default function VTLink({ href, onClick, ...rest }: Props) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    // 새 탭/중클릭/수정키는 기본 동작 유지
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    // 내부 이동만 가로채기
    if (!href.startsWith("/")) return;

    e.preventDefault();
    const navigate = () => router.push(href); // ✅ Route 타입으로 안전

    const anyDoc: any = document;
    if (anyDoc.startViewTransition) {
      anyDoc.startViewTransition(navigate);
    } else {
      navigate();
    }
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}
