"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import VTLink from "../components/VTLink";
import { useHeader } from "./HeaderContext";
import { useAuthStore } from "../app/store/useAuthStore";
import LoginModal from "./LoginModal";
import NavigationDrawer from "./NavigationDrawer";

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
  const [scrolled, setScrolled] = useState(false);
  const [positions, setPositions] = useState<{ top: number; left: number }[]>([]);

  const isRootPage = pathname === "/";

  // 랜덤 위치 생성 (루트 페이지 진입 시마다)
  useEffect(() => {
    if (!isRootPage || categoryClicked) return;

    const generatePositions = () => {
      const newPositions: { top: number; left: number }[] = [];
      const headerHeight = 150; // 헤더 영역
      const footerHeight = 50; // 푸터 영역
      const leftMargin = 12; // 좌측 여백 (%) - 25%에서 15%로 축소
      const rightMargin = 12; // 우측 여백 (%) - 25%에서 15%로 축소
      
      // 사용 가능한 영역 계산
      const availableHeight = window.innerHeight - headerHeight - footerHeight;
      const availableWidthPercent = 100 - leftMargin - rightMargin;

      // 각 텍스트의 대략적인 크기 (px) - 반응형 고려
      const fontSize = Math.min(Math.max(window.innerWidth * 0.05, 26), 44);
      const itemWidth = fontSize * 6; // 8에서 6으로 축소
      const itemHeight = fontSize * 1.5;
      const minDistance = 100; // 200에서 100으로 축소

      // 중심점 간의 거리로 계산 (더 효율적)
      const isOverlapping = (
        pos1: { top: number; left: number },
        pos2: { top: number; left: number }
      ) => {
        const pos1LeftPx = (pos1.left / 100) * window.innerWidth;
        const pos2LeftPx = (pos2.left / 100) * window.innerWidth;
        
        const horizontalDistance = Math.abs(pos1LeftPx - pos2LeftPx);
        const verticalDistance = Math.abs(pos1.top - pos2.top);
        
        // 중심점 간 거리 계산
        const distance = Math.sqrt(
          horizontalDistance ** 2 + verticalDistance ** 2
        );
        
        // 최소 거리보다 가까우면 겹침
        const minCenterDistance = Math.max(itemWidth, itemHeight) + minDistance;
        return distance < minCenterDistance;
      };

      NAV.forEach((_, index) => {
        let attempts = 0;
        let newPos: { top: number; left: number };
        const maxAttempts = 1000; // 합리적인 시도 횟수
        
        do {
          // 안전 여백 추가
          const safeMarginTop = itemHeight / 2;
          const safeMarginBottom = itemHeight / 2;
          
          const top = headerHeight + safeMarginTop + 
                      Math.random() * (availableHeight - itemHeight - safeMarginTop - safeMarginBottom);
          const left = leftMargin + Math.random() * availableWidthPercent;
          
          newPos = { top, left };
          attempts++;
          
          if (attempts >= maxAttempts) {
            console.warn(`항목 ${index + 1}: ${maxAttempts}번 시도 후 강제 배치`);
            break;
          }
          
        } while (
          newPositions.some(existingPos => isOverlapping(existingPos, newPos))
        );
        
        newPositions.push(newPos);
      });

      console.log('생성된 위치:', newPositions);
      setPositions(newPositions);
    };

    generatePositions();
  }, [isRootPage, categoryClicked]);

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      handleHomeClick();
      router.push("/");
    }
  };

  const handleLogout = async () => {
    await signOut();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* 네비게이션 드로어 */}
      <NavigationDrawer />

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
          fontWeight: 300,
          letterSpacing: "0.02em",
          color: "#111",
          // textShadow:
          //   "0 0 3px rgba(255,255,255,0.75), 0 1px 2px rgba(0,0,0,0.35)",
          opacity: shouldShow && !scrolled ? 1 : 0,
          pointerEvents: shouldShow && !scrolled ? "auto" : "none",
          transition: "opacity 0.5s ease", // 페이드인 시간 증가
          cursor: "pointer",
        }}
      >
        趙 dasol
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

      {/* 카테고리: 랜덤 위치 - 진입 시 바로 페이드인 */}
      {!categoryClicked && positions.length > 0 && (
        <>
          {NAV.map((n, index) => (
            <div
              key={n.href}
              style={{
                position: "fixed",
                top: `${positions[index].top}px`,
                left: `${positions[index].left}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 100,
                opacity: shouldShow ? 1 : 0,
                pointerEvents: shouldShow ? "auto" : "none",
                transition: "opacity 0.8s ease",
              }}
            >
              <VTLink
                href={n.href}
                style={{
                  fontSize: "clamp(26px, 5vw, 44px)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "#7fffa0",
                  lineHeight: 1.1,
                  textShadow:
                    "0 0 4px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.35)",
                }}
                onClick={handleCategoryClick}
              >
                {n.label}
              </VTLink>
            </div>
          ))}
        </>
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
              다솔 로그아웃
            </h2>
            <p
              style={{
                marginBottom: "24px",
                textAlign: "center",
                color: "#666",
              }}
            >
              오늘은 여기까지 !
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ddd",
                  
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  
                  backgroundColor: "#222",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}