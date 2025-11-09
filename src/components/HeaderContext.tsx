"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface HeaderContextType {
  isMobile: boolean;
  isClicked: boolean;
  categoryClicked: boolean;
  shouldShow: boolean;
  handleClick: () => void;
  handleCategoryClick: () => void;
  handleHomeClick: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
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

  useEffect(() => {
    if (mounted && isMobile && !isClicked && isRootPage) {
      const bgLayer = document.getElementById("home-bg-layer");
      if (bgLayer) {
        bgLayer.classList.add("floating");
        bgLayer.classList.remove("stopped");
      }
    }
  }, [mounted, isMobile, isClicked, isRootPage]);

  useEffect(() => {
    if (isRootPage) {
      setCategoryClicked(false);
      if (isMobile) {
        setIsClicked(false);
      }
    } else {
      setCategoryClicked(true);
    }
  }, [isRootPage, isMobile]);

  const handleClick = () => {
    if (isMobile && !isClicked && isRootPage) {
      setIsClicked(true);
      const bgLayer = document.getElementById("home-bg-layer");
      if (bgLayer) {
        bgLayer.classList.remove("floating");
        bgLayer.classList.add("stopped");
      }
    }
  };

  const handleCategoryClick = () => {
    setCategoryClicked(true);
  };

  const handleHomeClick = () => {
    if (!isRootPage) {
      setCategoryClicked(false);
      if (isMobile) {
        setIsClicked(false);
      }
    }
  };

  const shouldShow = mounted && (!isMobile || isClicked);

  return (
    <HeaderContext.Provider
      value={{
        isMobile,
        isClicked,
        categoryClicked,
        shouldShow,
        handleClick,
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