"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/**
 * 요구사항:
 * - 첫 로드(초기 진입)에는 애니메이션 없음 (깜박임 방지)
 * - 라우트 변경 시: 현재 페이지 2s 페이드아웃 후, 다음 페이지 2s 페이드인
 * - 빈 화면 프레임 방지: 겹쳐진 레이아웃 유지
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 첫 마운트 여부 추적 → 첫 화면은 애니메이션 스킵
  const isFirstMount = useRef(true);
  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  return (
    <div
      className="page"
      style={{
        display: "grid",
        gridAutoRows: "minmax(min-content, auto)",
        minHeight: "calc(100vh - 56px)", // 헤더 높이에 맞춰 필요 시 조정
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          style={{ gridArea: "1 / 1" }}
          // 첫 진입 때는 initial 애니메이션을 건너뜁니다.
          initial={isFirstMount.current ? false : "initial"}
          animate="animate"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { duration: 2, ease: "linear" }, // 2s 페이드인
            },
            exit: {
              opacity: 0,
              transition: { duration: 2, ease: "linear" }, // 2s 페이드아웃
            },
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
