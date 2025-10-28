"use client";

import { usePathname } from "next/navigation";
import VTLink from "@/components/VTLink";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="header">
      <div className="header-inner container-60">
        <VTLink href="/" className="site-title" title="Home">
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
