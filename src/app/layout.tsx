// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import BodyBackground from "@/components/BodyBackground";
import ImagePreviewProvider from "@/components/ImagePreviewProvider";
import RouteTransitionProvider from "@/components/RouteTransition";
import { HeaderProvider } from "@/components/HeaderContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Dasol Cho",
  description: "photo portfolio.",
};

const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={satoshi.variable}>
      <body suppressHydrationWarning>
        <BodyBackground />
        <div id="home-bg-overlay" aria-hidden="true" /> {/* 👈 추가 */}
        <HeaderProvider>
          <RouteTransitionProvider>
            <ImagePreviewProvider>
              <div className="app-root">
                <Header />
                <main>
                  <div data-page>{children}</div>
                </main>
              </div>
            </ImagePreviewProvider>
          </RouteTransitionProvider>
        </HeaderProvider>
      </body>
    </html>
  );
}
