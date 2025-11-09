"use client";

import { usePathname } from "next/navigation";
import BackgroundUploadButton from "../components/BackgroundUploadButton";
import { useHeader } from "../components/HeaderContext";

export default function HomePage() {
  const pathname = usePathname();
  const { isMobile, isClicked, shouldShow, handleClick } = useHeader();

  const isRootPage = pathname === "/";

  return (
    <div
      className="home-centered-layout"
      onClick={handleClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 72px)",
        padding: "32px 16px",
        cursor: isMobile && !isClicked && isRootPage ? "pointer" : "default",
      }}
    >
      {/* 배경 업로드 버튼: 루트 페이지에서만 표시 */}
      {isRootPage && (
        <div
          style={{
            marginTop: "200px",
            opacity: shouldShow ? 1 : 0,
            pointerEvents: shouldShow ? "auto" : "none",
            transition: "opacity 0.5s ease",
          }}
        >
          <BackgroundUploadButton />
        </div>
      )}
    </div>
  );
}