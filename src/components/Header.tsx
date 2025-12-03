"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import VTLink from "../components/VTLink";
import { useHeader } from "./HeaderContext";
import { useAuthStore } from "../app/store/useAuthStore";
import LoginModal from "./LoginModal";

const NAV = [
  { href: "/articles" as Route, label: "Articles" },
  { href: "/about" as Route, label: "About" },
  { href: "/contact" as Route, label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { shouldShow, categoryClicked, handleCategoryClick, handleHomeClick } = useHeader();
  const { user, isOwner, checkAuth, signOut } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isRootPage = pathname === "/";

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRootPage) {
      // 루트 페이지: 로그인/로그아웃 동작
      if (user) {
        setShowLogoutConfirm(true);
      } else {
        setIsLoginModalOpen(true);
      }
    } else {
      // 다른 페이지: 홈으로 이동
      router.push("/");
    }
  };

  const handleLogout = async () => {
    await signOut();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* 홈 버튼: 상단 중앙 고정 */}
      <div
        className="site-title"
        title="Home"
        onClick={handleTitleClick}
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          fontSize: "22px",
          fontWeight: 400,
          letterSpacing: "0.02em",
          color: "#111",
          // 배경선 위에서도 또렷하게 보이도록 흰 하이라이트 + 아주 약한 그림자
          textShadow:
            "0 0 3px rgba(255,255,255,0.75), 0 1px 2px rgba(0,0,0,0.35)",
          opacity: shouldShow ? 1 : 0,
          pointerEvents: shouldShow ? "auto" : "none",
          transition: "opacity 0.5s ease",
          cursor: "pointer",
        }}
      >
        Dasol Cho
        {isOwner && (
          <span
            style={{
              fontSize: "12px",
              marginLeft: "8px",
              color: "#666",
              fontWeight: 400,
            }}
          >
            (Owner)
          </span>
        )}
      </div>

      {/* 카테고리: 화면 중앙 */}
      {!categoryClicked && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            opacity: shouldShow ? 1 : 0,
            pointerEvents: shouldShow ? "auto" : "none",
            transition: "opacity 0.5s ease",
          }}
        >
          {NAV.map((n) => (
            <VTLink
              key={n.href}
              href={n.href}
              style={{
                fontSize: "clamp(56px, 5vw, 44px)",   // 모바일~데스크탑 대응
                fontWeight: 400,
                letterSpacing: "0.04em",
                color: "#111",
                lineHeight: 1.1,
                // 흰색 아우라로 먼저 띄우고, 아래로 살짝 그림자
                textShadow:
                  "0 0 4px rgba(255,255,255,0.75), 0 2px 4px rgba(0,0,0,0.35)",
              }}
              onClick={handleCategoryClick}
            >
              {n.label}
            </VTLink>
          ))}
        </div>
      )}

      {/* 로그인 모달 */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* 로그아웃 확인 모달 */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "32px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              로그아웃
            </h2>
            <p
              style={{
                marginBottom: "24px",
                textAlign: "center",
                color: "#666",
              }}
            >
              로그아웃 하시겠습니까?
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                취소
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "#222",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}