import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BodyBackground from "@/components/BodyBackground";

export const metadata: Metadata = {
  title: "Photo Portfolio",
  description: "Minimal 90s-style photo portfolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      {/* ✅ 확장프로그램이 body에 붙이는 속성으로 인한 hydration 오차를 무시 */}
      <body suppressHydrationWarning>
        <Header />
        <BodyBackground />
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
