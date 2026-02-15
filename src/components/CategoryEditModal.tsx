// components/CategoryEditModal.tsx
"use client";

import { useState } from "react";

type Props = {
  categoryId: string;
  currentTitle: string;
  currentDescription: string;
  onClose: () => void;
  onUpdated: () => void;
};

export default function CategoryEditModal({
  categoryId,
  currentTitle,
  currentDescription,
  onClose,
  onUpdated,
}: Props) {
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("제목을 입력하세요.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
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
          maxWidth: "500px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>
          카테고리 수정
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "10px 20px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "white",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#222",
              color: "white",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}