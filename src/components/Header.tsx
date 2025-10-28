"use client";

import { usePathname } from "next/navigation";
import VTLink from "@/components/VTLink";
import type { Route } from "next";

const NAV = [
  { href: "/" as Route, label: "Home" },
  { href: "/articles" as Route, label: "Articles" },
  { href: "/about" as Route, label: "About" },
  { href: "/contact" as Route, label: "Contact" },
] as const;

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="header">
      <div className="header-inner container-60">
        <VTLink href={"/" as Route} className="site-title" title="Home">
          Dasol Cho
        </VTLink>
        <nav className="nav">
          {NAV.map((n) => (
            <VTLink
              key={n.href}
              href={n.href}
              style={{ fontWeight: pathname === n.href ? 700 : 400 }}
            >
              {n.label}
            </VTLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
