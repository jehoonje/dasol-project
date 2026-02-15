// components/BlockEditModal.tsx
"use client";

import { useState } from "react";
import type { ArticleBlock } from "@/app/types";

type Props = {
  block: ArticleBlock;
  onClose: () => void;
  onUpdated: () => void;
};

export default function BlockEditModal({ block, onClose, onUpdated }: Props) {
  const [textContent, setTextContent] = useState(block.text_content || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (block.block_type === "text" || block.block_type === "text_image") {
      if (!textContent.trim()) {
        alert("내용을 입력하세요.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/blocks/${block.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_content: textContent }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "수정 실패");
      }

      alert("수정되었습니다.");
      onUpdated();
      onClose();
    } catch (error: any) {
      alert(`수정 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold", color: "#111" }}>
          블록 수정
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#666" }}>
            블록 타입: <span style={{ color: "#111" }}>{block.block_type}</span>
          </label>
        </div>

        {(block.block_type === "text" || block.block_type === "text_image") && (
          <div style={{ marginBottom: "30px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#111" }}>
              텍스트 내용
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={10}
              placeholder="내용을 입력하세요..."
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "15px",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: "1.6",
              }}
            />
          </div>
        )}

        {block.block_type === "text_image" && block.image_url && (
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#111" }}>
              현재 이미지
            </label>
            <img
              src={block.image_url}
              alt=""
              style={{ 
                maxWidth: "100%", 
                maxHeight: "200px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                objectFit: "cover",
              }}
            />
            <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
              * 이미지 변경은 현재 지원하지 않습니다.
            </p>
          </div>
        )}

        {block.block_type === "image" && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#666", marginBottom: "12px" }}>
              이미지 블록은 텍스트 수정을 지원하지 않습니다.
            </p>
            {block.image_url && (
              <img
                src={block.image_url}
                alt=""
                style={{ 
                  maxWidth: "100%", 
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            )}
          </div>
        )}

        {block.block_type === "patterned" && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#666" }}>
              갤러리 블록은 현재 수정을 지원하지 않습니다.
            </p>
            {Array.isArray(block.images) && block.images.length > 0 && (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", 
                gap: "8px",
                marginTop: "12px",
              }}>
                {block.images.slice(0, 4).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    style={{ 
                      width: "100%", 
                      height: "100px",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                ))}
                {block.images.length > 4 && (
                  <div style={{
                    width: "100%",
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                    +{block.images.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "10px 20px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "white",
              color: "#111",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || block.block_type === "patterned" || block.block_type === "image"}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: 
                saving || block.block_type === "patterned" || block.block_type === "image" 
                  ? "#ccc" 
                  : "#222",
              color: "white",
              cursor: 
                saving || block.block_type === "patterned" || block.block_type === "image"
                  ? "not-allowed" 
                  : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!saving && block.block_type !== "patterned" && block.block_type !== "image") {
                e.currentTarget.style.backgroundColor = "#111";
              }
            }}
            onMouseLeave={(e) => {
              if (block.block_type !== "patterned" && block.block_type !== "image") {
                e.currentTarget.style.backgroundColor = "#222";
              }
            }}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}