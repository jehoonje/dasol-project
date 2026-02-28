"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ImageModal from "./ImageModal";
import Image from "next/image";

type ArticleImage = { id: string; image_url: string; sort_order: number };

/**
 * Masonry(Grid row span) + 반응형
 * - 모바일에서도 2~3열 유지: min width를 clamp(96px, 30vw, 180px)로 낮춰 auto-fill이 1열로 무너지지 않게 함
 * - auto-fit으로 변경하여 실제 아이템 개수만큼만 열 생성, 빈 공간 없이 가로 전체 사용
 */
export default function GalleryGrid({ images }: { images: ArticleImage[] }) {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  // 간격/행단위(px)
  const GAP = 12;
  const ROW_HEIGHT = 8;

  // 각 카드(wrapper) DOM을 보관
  const wrappersRef = useRef<Record<string, HTMLDivElement | null>>({});
  const setWrapperRef = (id: string) => (el: HTMLDivElement | null) => {
    wrappersRef.current[id] = el;
  };

  // 각 카드의 grid-row-end: span N 값을 상태로 보관
  const [spans, setSpans] = useState<Record<string, number>>({});

  // ✅ 반응형 열 정의
  // - 2장이면 2열 정확히 분할
  // - 3장 이상이면 min width를 clamp로 낮춰 모바일에서도 2~3열 유지
  // - auto-fit으로 변경하여 실제 아이템 개수만큼만 열 생성, 빈 공간 없이 가로 전체 사용
  const gridTemplateColumns = useMemo(() => {
    if (!images || images.length === 0)
      return "repeat(auto-fit, minmax(clamp(96px, 30vw, 180px), 1fr))";
    if (images.length === 2) return "repeat(2, minmax(0, 1fr))";
    return "repeat(auto-fit, minmax(clamp(96px, 30vw, 180px), 1fr))";
  }, [images]);

  const recalcSpans = () => {
    const next: Record<string, number> = {};
    for (const im of images) {
      const el = wrappersRef.current[im.id];
      if (!el) continue;
      const h = el.getBoundingClientRect().height;
      const span = Math.ceil((h + GAP) / (ROW_HEIGHT + GAP));
      next[im.id] = span;
    }
    setSpans(next);
  };

  useEffect(() => {
    recalcSpans();
    const ro = new ResizeObserver(recalcSpans);
    for (const im of images) {
      const el = wrappersRef.current[im.id];
      if (el) ro.observe(el);
    }
    const onResize = () => recalcSpans();
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [images]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns,
          gridAutoRows: `${ROW_HEIGHT}px`,
          gap: `${GAP}px`,
          alignItems: "start",
        }}
      >
        {images.map((img) => (
          <div
            key={img.id}
            ref={setWrapperRef(img.id)}
            style={{
              gridRowEnd: `span ${spans[img.id] ?? 1}`,
              border: "0px solid #eee",
              background: "#fff",
            }}
          >
            <button
              className="button ghost"
              style={{ padding: 0, width: "100%", background: "transparent", border: "none" }}
              onClick={() => {
                setSrc(img.image_url);
                setOpen(true);
              }}
              aria-label="확대 보기"
            >
              <Image
                src={img.image_url}
                alt=""
                width={800}    // 필수 속성 추가
                height={800}   // 필수 속성 추가
                sizes="(max-width: 768px) 50vw, 33vw"
                className="masonry-img"
                style={{ width: "100%", height: "auto", display: "block" }}
                onLoad={recalcSpans}
              />
            </button>
          </div>
        ))}
      </div>

      <ImageModal open={open} src={src} onClose={() => setOpen(false)} />
    </>
  );
}