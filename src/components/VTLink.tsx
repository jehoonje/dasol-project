"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouteTransition } from "@/components/RouteTransition";

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: Route;
  prefetch?: boolean;
};

export default function VTLink({ href, onClick, prefetch = true, ...rest }: Props) {
  const { navigate } = useRouteTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!href.startsWith("/")) return; // 외부 링크는 통과

    e.preventDefault();
    navigate(href); // ← 타입 안전, 우리 전환만 사용
  };

  // 외부 링크는 일반 a 태그 사용
  if (!href.startsWith("/")) {
    return <a href={href} onClick={onClick} {...rest} />;
  }

  // 내부 링크는 Next.js Link로 prefetch 활성화
  return (
    <Link href={href} prefetch={prefetch} onClick={handleClick} {...rest} />
  );
}
