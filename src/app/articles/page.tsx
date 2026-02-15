// app/articles/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../lib/supabaseClient";
import VTLink from "@/components/VTLink";
import type { Route } from "next";
import { useAuthStore } from "../store/useAuthStore";
import type { ArticleCategory } from "../types";
import CategoryEditModal from "@/components/CategoryEditModal";

const CategoryCreateButton = dynamic(() => import("@/components/CategoryCreateButton"), {
  ssr: false,
});

export default function ArticlesPage() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null);
  const isOwner = useAuthStore((state) => state.isOwner);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pf_article_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    
    if (!error && data) setCategories(data as ArticleCategory[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 대제목을 삭제하시겠습니까?\n내부의 모든 글이 함께 삭제됩니다.`)) return;
    try {
      const { error } = await supabase.from("pf_article_categories").delete().eq("id", id);
      if (error) throw error;
      load();
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  return (
    <div className="container-90" style={{ paddingTop: "80px" }}>
      {isOwner && (
        <div className="plus-row" style={{ marginBottom: "40px" }}>
          <CategoryCreateButton onCreated={load} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {categories.map((cat) => (
          <div key={cat.id} style={{ position: "relative", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
            <VTLink href={`/articles/category/${cat.id}` as Route}>
              <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#111", marginTop: 20 }}>
                {cat.title}
              </h2>
            </VTLink>
            
            {isOwner && (
              <div style={{ position: "absolute", right: 0, top: "10px", display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setEditingCategory(cat)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#999",
                    fontSize: "20px",
                    cursor: "pointer",
                    padding: "0",
                    lineHeight: "1",
                  }}
                  title="수정"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.title)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ccc",
                    fontSize: "20px",
                    cursor: "pointer",
                    padding: "0",
                    lineHeight: "1",
                  }}
                  title="삭제"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && <p></p>}
      {!loading && categories.length === 0 && <p style={{ color: "#999" }}>등록된 카테고리가 없습니다.</p>}

      {editingCategory && (
        <CategoryEditModal
          categoryId={editingCategory.id}
          currentTitle={editingCategory.title}
          currentDescription={editingCategory.description || ""}
          onClose={() => setEditingCategory(null)}
          onUpdated={() => {
            load();
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}