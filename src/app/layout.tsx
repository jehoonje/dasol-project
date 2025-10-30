import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BodyBackground from "@/components/BodyBackground";
import ImagePreviewProvider from "@/components/ImagePreviewProvider";
import RouteTransitionProvider from "@/components/RouteTransition";

export const metadata: Metadata = {
  title: "Dasol Cho",
  description: "photo portfolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>
        <BodyBackground />
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
      </body>
    </html>
  );
}
