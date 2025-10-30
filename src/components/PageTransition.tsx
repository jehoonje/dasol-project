"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/**
 * 동작:
 * - 첫 진입: 애니메이션 없음
 * - 라우트 변경: (겹쳐진 레이어)
 *    1) 기존 페이지 exit = opacity 1 -> 0
 *    2) exit 끝난 뒤에야 신규 페이지 mount
 *    3) 신규 페이지 initial 0 -> animate 1
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  // 검색파라미터 변화까지 트리거하고 싶으면 key에 포함
  const routeKey = `${pathname}?${search?.toString() ?? ""}`;

  const firstMount = useRef(true);
  useEffect(() => {
    firstMount.current = false;
  }, []);

  return (
    <div
      // 겹치기 위한 기준
      style={{
        position: "relative",
        minHeight: "calc(100vh - 56px)", // 필요시 조정
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={routeKey}
          // 겹쳐서 교차되도록 절대배치
          style={{ position: "absolute", inset: 0, display: "grid" }}
          // 첫 진입은 스킵(= 이미 보이는 상태)
          initial={firstMount.current ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 2, ease: "linear" } }} // 2s 페이드인
          exit={{ opacity: 0, transition: { duration: 2, ease: "linear" } }} // 2s 페이드아웃
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
