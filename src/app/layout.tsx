import type { Metadata } from "next";
import "./globals.css";
import BodyBackground from "@/components/BodyBackground";
import ImagePreviewProvider from "@/components/ImagePreviewProvider";
import RouteTransitionProvider from "@/components/RouteTransition";
import { HeaderProvider } from "@/components/HeaderContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Dasol Cho",
  description: "photo portfolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <BodyBackground />
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