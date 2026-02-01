"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useHeader } from "../components/HeaderContext";
import { useAuthStore } from "./store/useAuthStore";

// 업로드 버튼은 일반 사용자에게 필요 없으므로 동적 로드
const BackgroundUploadButton = dynamic(() => import("../components/BackgroundUploadButton"), {
  ssr: false,
});

export default function HomePage() {
  const pathname = usePathname();
  const { shouldShow } = useHeader(); // 클릭 관련 제거
  const isOwner = useAuthStore((state) => state.isOwner);

  const isRootPage = pathname === "/";

  return (
    <div
      className="home-centered-layout"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 72px)",
        padding: "32px 16px",
        cursor: "default", // 항상 default
      }}
    >
      {/* Owner 업로드 버튼 - 진입 시 바로 페이드인 */}
      {isRootPage && isOwner && (
        <div
          style={{
            marginTop: "200px",
            opacity: shouldShow ? 1 : 0,
            pointerEvents: shouldShow ? "auto" : "none",
            transition: "opacity 0.8s ease",
          }}
        >
          <BackgroundUploadButton />
        </div>
      )}
    </div>
  );
}