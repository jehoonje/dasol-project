"use client";

import * as React from "react";
import type { Route } from "next";
import { useRouteTransition } from "@/components/RouteTransition";

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: Route;
};

export default function VTLink({ href, onClick, ...rest }: Props) {
  const { navigate } = useRouteTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!href.startsWith("/")) return; // 외부 링크는 통과

    e.preventDefault();
    navigate(href); // ← 타입 안전, 우리 전환만 사용
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}
