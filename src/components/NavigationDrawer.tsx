"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../app/lib/supabaseClient";
import VTLink from "./VTLink";
import type { Route } from "next";
import type { ArticleCategory } from "@/app/types";

const NAV_ITEMS = [
  { href: "/about" as Route, label: "About" },
  { href: "/articles" as Route, label: "Articles" },
  { href: "/contact" as Route, label: "Contact" },
];

export default function NavigationDrawer() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const isRootPage = pathname === "/";

  // 카테고리 목록 로드
  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("pf_article_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setCategories(data as ArticleCategory[]);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadCategories();
  }, []);

  // 드로어가 열릴 때마다 카테고리 목록 새로고침
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // 페이지 변경 시 드로어 닫기
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
      setShowCategories(false);
    }
  }, [pathname]);

  // 드로어 열기/닫기
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    setShowCategories(false);
  };

  // Articles 클릭 시 카테고리 보기
  const handleArticlesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAnimating(true);
    
    // 카테고리를 보여주기 전에 최신 목록 로드
    loadCategories();
    
    setTimeout(() => {
      setShowCategories(true);
      setIsAnimating(false);
    }, 300);
  };

  // 뒤로가기 (카테고리에서 메인 메뉴로)
  const handleBack = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      setShowCategories(false);
      setIsAnimating(false);
    }, 300);
  };

  // 메인 페이지에서는 햄버거 버튼 숨김
  if (isRootPage) {
    return null;
  }

  return (
    <>
      {/* 햄버거 버튼 */}
      <button
        onClick={toggleDrawer}
        style={{
          position: "fixed",
          top: "16px",
          left: "5%",
          zIndex: 200,
          width: "44px",
          height: "44px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? "none" : "auto",
          transition: "opacity 0.3s ease",
        }}
        aria-label="메뉴 열기"
      >
        <span
          style={{
            display: "block",
            width: "28px",
            height: "2px",
            backgroundColor: "#111",
          }}
        />
        <span
          style={{
            display: "block",
            width: "28px",
            height: "2px",
            backgroundColor: "#111",
          }}
        />
        <span
          style={{
            display: "block",
            width: "28px",
            height: "2px",
            backgroundColor: "#111",
          }}
        />
      </button>

      {/* 오버레이 */}
      {isOpen && (
        <div
          onClick={toggleDrawer}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 150,
            opacity: isOpen ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* 드로어 */}
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "90%",
          height: "90%",
          maxWidth: "400px",
          maxHeight: "100vh",
          backgroundColor: "#ffffff",
          zIndex: 180,
          transform: isOpen ? "scale(1)" : "scale(0)",
          transformOrigin: "top left",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
          boxShadow: isOpen ? "4px 4px 24px rgba(0, 0, 0, 0.15)" : "none",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: "0 0 12px 0",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* 드로어 헤더 */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #e5e5e5",
            position: "relative",
            height: "88px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={toggleDrawer}
            style={{
              position: "absolute",
              top: "24px",
              right: "35px",
              width: "32px",
              height: "32px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "28px",
              color: "#111",
              display: "flex",
              opacity: "0.5",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#111";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#666";
            }}
            aria-label="메뉴 닫기"
          >
            ×
          </button>

          {/* Back 버튼 영역 */}
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              fontWeight: "600",
              color: "#111",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: 0,
              opacity: showCategories ? 1 : 0,
              pointerEvents: showCategories ? "auto" : "none",
              transition: "opacity 0.3s ease",
            }}
          >
            <span style={{ fontSize: "24px", padding: "0"}}>←</span> Back
          </button>
        </div>

        {/* 드로어 컨텐츠 */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
          }}
        >
          {/* 메인 메뉴 */}
          <div
            style={{
              opacity: showCategories || isAnimating ? 0 : 1,
              transform: showCategories || isAnimating ? "translateX(-20px)" : "translateX(0)",
              transition: "all 0.3s ease",
              pointerEvents: showCategories || isAnimating ? "none" : "auto",
              display: showCategories && !isAnimating ? "none" : "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {NAV_ITEMS.map((item) => (
              item.label === "Articles" ? (
                <button
                  key={item.label}
                  onClick={handleArticlesClick}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#111",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background-color 0.2s ease",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {item.label}
                  <span style={{ fontSize: "18px", opacity: 0.5 }}>→</span>
                </button>
              ) : (
                <VTLink
                  key={item.label}
                  href={item.href}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#111",
                    backgroundColor: "transparent",
                    borderRadius: "8px",
                    textDecoration: "none",
                    display: "block",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {item.label}
                </VTLink>
              )
            ))}
          </div>

          {/* 카테고리 목록 */}
          <div
            style={{
              opacity: showCategories && !isAnimating ? 1 : 0,
              transform: showCategories && !isAnimating ? "translateX(0)" : "translateX(20px)",
              transition: "all 0.3s ease",
              pointerEvents: showCategories && !isAnimating ? "auto" : "none",
              display: !showCategories && !isAnimating ? "none" : "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {categories.map((category) => {
              const categoryPath = `/articles/category/${category.id}` as Route;
              const isCurrentPage = pathname === categoryPath;
              
              return (
                <VTLink
                  key={category.id}
                  href={categoryPath}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (isCurrentPage) {
                      e.preventDefault();
                      setIsOpen(false);
                      setShowCategories(false);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    fontSize: "18px",
                    fontWeight: "500",
                    color: "#111",
                    backgroundColor: "transparent",
                    borderRadius: "8px",
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "block",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {category.title}
                </VTLink>
              );
            })}

            {categories.length === 0 && (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                등록된 카테고리가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}