"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../lib/supabaseClient";
import VTLink from "@/components/VTLink";
import type { Route } from "next";
import { useAuthStore } from "../store/useAuthStore";

// 업로드 버튼은 동적 로드
const ArticleCreateButton = dynamic(() => import("@/components/ArticleCreateButton"), {
  ssr: false,
});

type Article = {
  id: string;
  title: string;
  cover_image_url: string | null;
  created_at: string;
};

export default function ArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const isOwner = useAuthStore((state) => state.isOwner);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pf_articles")
      .select("id, title, cover_image_url, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as Article[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container-90" style={{ paddingTop: "80px" }}>
      {isOwner && (
        <div className="plus-row">
          <ArticleCreateButton onCreated={load} />
        </div>
      )}

      <h1 className="mt-2 mb-4 font-white">.</h1>

      {loading && <p></p>}

      <div className="articles-grid" data-nopreview="true">
        {items.map((a) => (
          <div key={a.id} className="article-card" style={{ position: "relative" }}>
            {isOwner && (
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!confirm(`"${a.title}" 글을 삭제하시겠습니까?`)) return;
                  try {
                    const res = await fetch(`/api/articles/${a.id}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) {
                      const json = await res.json();
                      throw new Error(json.error || "삭제 실패");
                    }
                    alert("삭제되었습니다.");
                    load();
                  } catch (error: any) {
                    alert(`삭제 실패: ${error.message}`);
                  }
                }}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
                }}
                title="삭제"
              >
                ×
              </button>
            )}
            <VTLink href={`/articles/${a.id}` as Route} data-nopreview="true">
              <h2 className="article-title">{a.title}</h2>
              {a.cover_image_url ? (
                <div className="thumb">
                  <img
                    src={a.cover_image_url}
                    alt={a.title}
                    loading="lazy"
                    decoding="async"
                    data-nopreview="true"
                  />
                </div>
              ) : (
                <div className="thumb thumb--empty">대표 이미지 없음</div>
              )}
            </VTLink>
          </div>
        ))}
      </div>
    </div>
  );
}