"use client";

import { useState, useCallback } from "react";
import type { ArticleBlock } from "../app/types";
import GalleryGrid from "./GalleryGrid";
import BlockEditModal from "./BlockEditModal";
import BlockAddButton from "./BlockAddButton";
import Image from "next/image";
import { useAuthStore } from "@/app/store/useAuthStore";

export default function ArticleBlocks({
  blocks,
  onBlocksChange,
}: {
  blocks: ArticleBlock[];
  onBlocksChange?: () => void;
}) {
  const isOwner = useAuthStore((state) => state.isOwner);
  const [editingBlock, setEditingBlock] = useState<ArticleBlock | null>(null);
  const [insertAfterSortOrder, setInsertAfterSortOrder] = useState<number | null>(null);

  const handleDelete = useCallback(async (blockId: string) => {
    if (!confirm("이 블록을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/blocks/${blockId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "삭제 실패");
      }
      alert("삭제되었습니다.");
      onBlocksChange?.();
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
    }
  }, [onBlocksChange]);

  // ✅ 오너 버튼 공통 컴포넌트 — renderBlock 내 중복 제거 + 불필요한 리렌더 방지
  const OwnerButtons = useCallback(({ block }: { block: ArticleBlock }) => {
    if (!isOwner) return null;
    return (
      <div style={ownerButtonWrapStyle}>
        <button
          onClick={() => setEditingBlock(block)}
          style={editButtonStyle}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)"; }}
        >
          수정
        </button>
        <button
          onClick={() => handleDelete(block.id)}
          style={deleteButtonStyle}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.9)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.7)"; }}
        >
          삭제
        </button>
      </div>
    );
  }, [isOwner, handleDelete]);

  // ✅ renderBlock을 useCallback으로 안정화 — isOwner/blocks 변경 시에만 재생성
  const renderBlock = useCallback((b: ArticleBlock) => {
    if (b.block_type === "text") {
      return (
        <div key={b.id} className="block-center article-text-block" style={relativeStyle}>
          <OwnerButtons block={b} />
          <div className="article-text-card">
            <div
              style={preWrapStyle}
              dangerouslySetInnerHTML={{ __html: b.text_content || "" }}
            />
          </div>
        </div>
      );
    }

    if (b.block_type === "text_image") {
      return (
        <div key={b.id} className="block-center text-image-block" style={relativeStyle}>
          <OwnerButtons block={b} />
          <div
            className="text-image-grid"
            style={textImageGridStyle}
          >
            <div className="text-panel" style={textPanelStyle}>
              <div
                style={preWrapStyle}
                dangerouslySetInnerHTML={{ __html: b.text_content || "" }}
              />
            </div>
            <div className="image-panel" style={imagePanelStyle}>
              {b.image_url ? (
                <Image
                  src={b.image_url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 50vw"
                  style={imageFillStyle}
                />
              ) : (
                <div style={noImageStyle}>이미지 없음</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (b.block_type === "image") {
      return (
        <div key={b.id} className="block-center single-image-block" style={relativeStyle}>
          <OwnerButtons block={b} />
          <div className="single-image-wrap">
            {b.image_url ? (
              <Image
                src={b.image_url}
                alt=""
                width={1200}
                height={800}
                sizes="(max-width: 1200px) 100vw, 1200px"
                style={imageSingleStyle}
              />
            ) : (
              <div style={noImageStyle}>이미지 없음</div>
            )}
          </div>
        </div>
      );
    }

    const images = Array.isArray(b.images)
      ? b.images.map((u, i) => ({ id: `${b.id}-${i}`, image_url: u, sort_order: i }))
      : [];

    return (
      <div key={b.id} className="block-center patterned-block" style={relativeStyle}>
        <OwnerButtons block={b} />
        <div style={galleryWrapStyle}>
          <GalleryGrid images={images} />
        </div>
      </div>
    );
  }, [OwnerButtons]);

  return (
    <>
      <div className="vstack">
        {blocks.map((b) => (
          <div key={b.id}>
            {renderBlock(b)}

            {/* 블록 사이 삽입 버튼 */}
            {isOwner && (
              <div style={insertButtonWrapStyle}>
                <button
                  onClick={() => setInsertAfterSortOrder(b.sort_order)}
                  style={insertButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                    e.currentTarget.style.borderColor = "#999";
                    e.currentTarget.style.color = "#333";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#ddd";
                    e.currentTarget.style.color = "#999";
                  }}
                  title="블록 추가"
                >
                  +
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingBlock && (
        <BlockEditModal
          block={editingBlock}
          onClose={() => setEditingBlock(null)}
          onUpdated={() => {
            onBlocksChange?.();
            setEditingBlock(null);
          }}
        />
      )}

      {insertAfterSortOrder !== null && (
        <BlockAddButton
          articleId={blocks[0]?.article_id || ""}
          insertAfterSortOrder={insertAfterSortOrder}
          onAdded={() => {
            onBlocksChange?.();
            setInsertAfterSortOrder(null);
          }}
          onClose={() => setInsertAfterSortOrder(null)}
        />
      )}
    </>
  );
}

// ✅ 모든 인라인 스타일 객체를 모듈 스코프 상수로 선언 — 렌더마다 새 객체 생성 방지

const relativeStyle: React.CSSProperties = { position: "relative" };

const preWrapStyle: React.CSSProperties = { whiteSpace: "pre-wrap", width: "100%" };

const ownerButtonWrapStyle: React.CSSProperties = {
  position: "absolute",
  top: "12px",
  right: "12px",
  display: "flex",
  gap: "6px",
  zIndex: 10,
};

const textImageGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(140px, 1.2fr) minmax(140px, 1fr)",
  gap: 12,
  alignItems: "stretch",
};

const textPanelStyle: React.CSSProperties = { display: "grid", placeItems: "center" };

const imagePanelStyle: React.CSSProperties = { position: "relative", minHeight: "250px" };

const imageFillStyle: React.CSSProperties = {
  objectFit: "cover",
  display: "block",
  border: "1px solid #eee",
  background: "#fff",
};

const imageSingleStyle: React.CSSProperties = {
  width: "100%",
  height: "auto",
  display: "block",
  border: "1px solid #eee",
  background: "#fff",
};

const noImageStyle: React.CSSProperties = { padding: 16, textAlign: "center" };

const galleryWrapStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "var(--container-max)",
};

const insertButtonWrapStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  margin: "16px 0",
};

const insertButtonStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  border: "2px dashed #ddd",
  backgroundColor: "white",
  color: "#999",
  fontSize: "24px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const editButtonStyle: React.CSSProperties = {
  padding: "4px 10px",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500",
  transition: "background-color 0.2s",
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "4px 10px",
  backgroundColor: "rgba(220, 38, 38, 0.7)",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500",
  transition: "background-color 0.2s",
};