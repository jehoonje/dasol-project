"use client";

import type { Route } from "next";
import VTLink from "../components/VTLink";
import { useHeader } from "./HeaderContext";

const NAV = [
  { href: "/articles" as Route, label: "Articles" },
  { href: "/about" as Route, label: "About" },
  { href: "/contact" as Route, label: "Contact" },
];

export default function Header() {
  const { shouldShow, categoryClicked, handleCategoryClick, handleHomeClick } = useHeader();

  return (
    <>
      {/* 홈 버튼: 상단 중앙 고정 */}
      <VTLink
        href={"/" as Route}
        className="site-title"
        title="Home"
        onClick={handleHomeClick}
        style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          fontSize: "24px",
          color: "#222",
          textShadow: "-3px 0px white, 0px 3px white",
          fontWeight: 900,
          opacity: shouldShow ? 1 : 0,
          pointerEvents: shouldShow ? "auto" : "none",
          transition: "opacity 0.5s ease",
        }}
      >
        Dasol Cho
      </VTLink>

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
                fontSize: "36px",
                color: "#222",
                textShadow: "-2px 0px white, 0px 2px white",
                fontWeight: 900,
              }}
              onClick={handleCategoryClick}
            >
              {n.label}
            </VTLink>
          ))}
        </div>
      )}
    </>
  );
}