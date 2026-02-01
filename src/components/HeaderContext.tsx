"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface HeaderContextType {
  isMobile: boolean;
  categoryClicked: boolean;
  shouldShow: boolean; // 항상 true
  handleCategoryClick: () => void;
  handleHomeClick: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categoryClicked, setCategoryClicked] = useState(false);

  const isRootPage = pathname === "/";

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 오버레이 항상 표시
  useEffect(() => {
    if (!mounted || !isRootPage) return;
    
    const overlay = document.getElementById("home-bg-overlay");
    if (!overlay) return;

    // 진입 시 바로 오버레이 표시
    overlay.classList.add("visible");
  }, [mounted, isRootPage]);

  useEffect(() => {
    if (isRootPage) {
      setCategoryClicked(false);
    } else {
      setCategoryClicked(true);
    }
  }, [isRootPage]);

  const handleCategoryClick = () => {
    setCategoryClicked(true);
  };

  const handleHomeClick = () => {
    if (!isRootPage) {
      setCategoryClicked(false);
    }
  };

  // 항상 true - 마운트 완료되면 바로 표시
  const shouldShow = mounted;

  return (
    <HeaderContext.Provider
      value={{
        isMobile,
        categoryClicked,
        shouldShow,
        handleCategoryClick,
        handleHomeClick,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
}