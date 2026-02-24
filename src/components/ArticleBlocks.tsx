// components/ArticleBlocks.tsx
"use client";

import { useState } from "react";
import type { ArticleBlock } from "../app/types";
import GalleryGrid from "./GalleryGrid";
import BlockEditModal from "./BlockEditModal";
import BlockAddButton from "./BlockAddButton";
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

  const handleDelete = async (blockId: string) => {
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
  };

  const renderBlock = (b: ArticleBlock) => {
    if (b.block_type === "text") {
      return (
        <div key={b.id} className="block-center article-text-block" style={{ position: "relative" }}>
          {isOwner && (
            <div style={{ 
              position: "absolute", 
              top: "12px", 
              right: "12px", 
              display: "flex", 
              gap: "6px", 
              zIndex: 10 
            }}>
              <button
                onClick={() => setEditingBlock(b)}
                style={editButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                }}
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                style={deleteButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.7)";
                }}
              >
                삭제
              </button>
            </div>
          )}
          <div className="article-text-card">
            <div 
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: b.text_content || "" }}
            />
          </div>
        </div>
      );
    }

    if (b.block_type === "text_image") {
      return (
        <div key={b.id} className="block-center text-image-block" style={{ position: "relative" }}>
          {isOwner && (
            <div style={{ 
              position: "absolute", 
              top: "12px", 
              right: "12px", 
              display: "flex", 
              gap: "6px", 
              zIndex: 10 
            }}>
              <button
                onClick={() => setEditingBlock(b)}
                style={editButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                }}
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                style={deleteButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.7)";
                }}
              >
                삭제
              </button>
            </div>
          )}
          <div
            className="text-image-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(140px, 1.2fr) minmax(140px, 1fr)",
              gap: 12,
              alignItems: "stretch",
            }}
          >
            <div className="text-panel" style={{ display: "grid", placeItems: "center" }}>
              <div 
                style={{ whiteSpace: "pre-wrap", width: "100%" }}
                dangerouslySetInnerHTML={{ __html: b.text_content || "" }}
              />
            </div>
            <div className="image-panel">
              {b.image_url ? (
                <img
                  src={b.image_url}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    border: "1px solid #eee",
                    background: "#fff",
                  }}
                  loading="lazy"
                />
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
        <div key={b.id} className="block-center single-image-block" style={{ position: "relative" }}>
          {isOwner && (
            <div style={{ 
              position: "absolute", 
              top: "12px", 
              right: "12px", 
              display: "flex", 
              gap: "6px", 
              zIndex: 10 
            }}>
              <button
                onClick={() => setEditingBlock(b)}
                style={editButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                }}
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                style={deleteButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.7)";
                }}
              >
                삭제
              </button>
            </div>
          )}
          <div className="single-image-wrap">
            {b.image_url ? (
              <img
                src={b.image_url}
                alt=""
                style={{ width: "100%", height: "auto", display: "block", border: "1px solid #eee", background: "#fff" }}
              />
            ) : (
              <div style={{ padding: 16, textAlign: "center" }}>이미지 없음</div>
            )}
          </div>
        </div>
      );
    }

    const images = Array.isArray(b.images)
      ? b.images.map((u, i) => ({ id: `${b.id}-${i}`, image_url: u, sort_order: i }))
      : [];
      
    return (
      <div key={b.id} className="block-center patterned-block" style={{ position: "relative" }}>
        {isOwner && (
          <div style={{ 
            position: "absolute", 
            top: "12px", 
            right: "12px", 
            display: "flex", 
            gap: "6px", 
            zIndex: 10 
          }}>
            <button
              onClick={() => setEditingBlock(b)}
              style={editButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
              }}
            >
              수정
            </button>
            <button
              onClick={() => handleDelete(b.id)}
              style={deleteButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.7)";
              }}
            >
              삭제
            </button>
          </div>
        )}
        <div style={{ width: "100%", maxWidth: "var(--container-max)" }}>
          <GalleryGrid images={images} />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="vstack">
        {blocks.map((b, index) => (
          <div key={b.id}>
            {renderBlock(b)}
            
            {/* 블록 사이 삽입 버튼 */}
            {isOwner && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                margin: "16px 0",
              }}>
                <button
                  onClick={() => setInsertAfterSortOrder(b.sort_order)}
                  style={{
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
                  }}
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

// 공통 버튼 스타일 정의
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