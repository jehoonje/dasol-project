"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImageModal from "./ImageModal";
import Image from "next/image";

type ArticleImage = { id: string; image_url: string; sort_order: number };

export default function GalleryGrid({ images }: { images: ArticleImage[] }) {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  const GAP = 12;
  const ROW_HEIGHT = 8;

  const wrappersRef = useRef<Record<string, HTMLDivElement | null>>({});

  // ✅ setWrapperRef를 useCallback으로 안정화 — 렌더마다 새 함수 생성 방지 (unmount/remount 글리치 차단)
  const setWrapperRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      wrappersRef.current[id] = el;
    },
    []
  );

  const [spans, setSpans] = useState<Record<string, number>>({});

  // ✅ images 변경 시 spans 초기화 — 블록 추가/삭제 후 레이아웃 틀어짐 방지
  useEffect(() => {
    setSpans({});
  }, [images]);

  const gridTemplateColumns = useMemo(() => {
    if (!images || images.length === 0)
      return "repeat(auto-fit, minmax(clamp(96px, 30vw, 180px), 1fr))";
    if (images.length === 2) return "repeat(2, minmax(0, 1fr))";
    return "repeat(auto-fit, minmax(clamp(96px, 30vw, 180px), 1fr))";
  }, [images]);

  // ✅ useCallback으로 안정화 + 실제 변경 시에만 setState (ResizeObserver 무한루프 차단)
  const recalcSpans = useCallback(() => {
    const next: Record<string, number> = {};
    for (const im of images) {
      const el = wrappersRef.current[im.id];
      if (!el) continue;
      // wrapper 대신 img 태그의 높이를 읽어 계산 (wrapper 높이 변경 → RO 재발동 루프 차단)
      const imgEl = el.querySelector("img");
      if (!imgEl) continue;
      const h = imgEl.getBoundingClientRect().height;
      if (h === 0) continue;
      next[im.id] = Math.ceil((h + GAP) / (ROW_HEIGHT + GAP));
    }

    // ✅ 값이 실제로 바뀔 때만 setState — 루프 완전 차단
    setSpans((prev) => {
      const changed = images.some((im) => prev[im.id] !== next[im.id]);
      return changed ? next : prev;
    });
  }, [images]);

  // ✅ onLoad 후 requestAnimationFrame으로 한 프레임 뒤에 계산 — 레이아웃 미완성 시점 계산 방지
  const scheduleRecalc = useCallback(() => {
    requestAnimationFrame(recalcSpans);
  }, [recalcSpans]);

  useEffect(() => {
    recalcSpans();

    const ro = new ResizeObserver(recalcSpans);
    for (const im of images) {
      const el = wrappersRef.current[im.id];
      // ✅ wrapper가 아닌 img를 observe — wrapper는 span 변경으로 크기가 바뀌어 루프 발생
      const imgEl = el?.querySelector("img");
      if (imgEl) ro.observe(imgEl);
    }

    window.addEventListener("resize", recalcSpans);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalcSpans);
    };
  }, [images, recalcSpans]);

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
                width={800}
                height={800}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="masonry-img"
                style={{ width: "100%", height: "auto", display: "block" }}
                onLoad={scheduleRecalc}
              />
            </button>
          </div>
        ))}
      </div>

      <ImageModal open={open} src={src} onClose={() => setOpen(false)} />
    </>
  );
}