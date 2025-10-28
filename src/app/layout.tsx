import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BodyBackground from "@/components/BodyBackground";

export const metadata: Metadata = {
  title: "Dasol Cho",
  description: "Minimal 90s-style photo portfolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <BodyBackground />
        {/* ✅ 전역 전환은 View Transitions로 처리하므로, 단순 main만 유지 */}
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
