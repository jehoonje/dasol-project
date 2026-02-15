// components/ArticleEditModal.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import type { ArticleCategory } from "@/app/types";

type Props = {
  articleId: string;
  currentTitle: string;
  currentCategoryId: string;
  onClose: () => void;
  onUpdated: () => void;
};

export default function ArticleEditModal({
  articleId,
  currentTitle,
  currentCategoryId,
  onClose,
  onUpdated,
}: Props) {
  const [title, setTitle] = useState(currentTitle);
  const [categoryId, setCategoryId] = useState(currentCategoryId);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from("pf_article_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setCategories(data as ArticleCategory[]);
    };
    loadCategories();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("제목을 입력하세요.");
      return;
    }
    if (!categoryId) {
      alert("카테고리를 선택하세요.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category_id: categoryId }),
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
          글 수정
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
            카테고리
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
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