"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Phase = "idle" | "leaving" | "entering";
const LEAVE_MS = 120; // CSS 애니메이션과 동기화 (0.12s)
const ENTER_MS = 120; // CSS 애니메이션과 동기화 (0.12s)

type HrefArg = Parameters<ReturnType<typeof useRouter>["push"]>[0];

const Ctx = createContext<{ navigate: (href: HrefArg) => void; phase: Phase }>({
  navigate: () => {},
  phase: "idle",
});

export function useRouteTransition() {
  return useContext(Ctx);
}

export default function RouteTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const first = useRef(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    document.body.dataset.route = phase;
    return () => { delete (document.body as any).dataset?.route; };
  }, [phase]);

  useEffect(() => { first.current = false; }, []);

  const navigate = useCallback((href: HrefArg) => {
    if (phase !== "idle") return;
    setPhase("leaving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      router.push(href);
    }, LEAVE_MS);
  }, [phase, router]);

  useEffect(() => {
    if (first.current) return;
    setPhase("entering");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPhase("idle"), ENTER_MS);
  }, [pathname]);

  return <Ctx.Provider value={{ navigate, phase }}>{children}</Ctx.Provider>;
}