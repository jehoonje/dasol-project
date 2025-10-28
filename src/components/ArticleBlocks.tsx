"use client";

import type { ArticleBlock } from "../app/types";
import GalleryGrid from "./GalleryGrid";

export default function ArticleBlocks({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="vstack">
      {blocks.map((b) => {
        if (b.block_type === "text") {
          return (
            <div key={b.id} className="block-center article-text-block">
              <div className="article-text-card">
                <div style={{ whiteSpace: "pre-wrap" }}>{b.text_content}</div>
              </div>
            </div>
          );
        }

        if (b.block_type === "text_image") {
          return (
            <div key={b.id} className="block-center text-image-block">
              <div className="text-image-grid">
                {/* 좌측: 텍스트(가운데 정렬, 카드 스타일) */}
                <div className="text-panel">
                  <div style={{ whiteSpace: "pre-wrap" }}>{b.text_content}</div>
                </div>
                {/* 우측: 이미지 */}
                <div className="image-panel">
                  {b.image_url ? (
                    <img src={b.image_url} alt="" />
                  ) : (
                    <div style={{ padding: 16, textAlign: "center" }}>이미지 없음</div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (b.block_type === "image") {
          return (
            <div key={b.id} className="block-center single-image-block">
              <div className="single-image-wrap">
                {b.image_url ? (
                  <img
                    src={b.image_url}
                    alt=""
                    style={{ width: "100%", height: "auto", display: "block", border: "1px solid #eee", background:"#fff" }}
                  />
                ) : (
                  <div style={{ padding: 16, textAlign: "center" }}>이미지 없음</div>
                )}
              </div>
            </div>
          );
        }

        // patterned: 내부 갤러리 컴포넌트 그대로 사용
        const images = Array.isArray(b.images)
          ? b.images.map((u, i) => ({ id: `${b.id}-${i}`, image_url: u, sort_order: i }))
          : [];
        return (
          <div key={b.id} className="block-center patterned-block">
            <div style={{ width: "100%", maxWidth: "var(--container-max)" }}>
              <GalleryGrid images={images} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
