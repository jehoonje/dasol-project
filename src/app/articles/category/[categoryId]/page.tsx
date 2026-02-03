// app/articles/category/[categoryId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import VTLink from "@/components/VTLink";
import type { Route } from "next";
import { useAuthStore } from "@/app/store/useAuthStore";
import type { ArticleCategory } from "@/app/types";

const ArticleCreateButton = dynamic(() => import("../../../../components/ArticleCreateButton"), {
  ssr: false,
});

type Article = {
  id: string;
  title: string;
  cover_image_url: string | null;
  created_at: string;
  category_id: string;
};

export default function CategoryArticlesPage() {
  const params = useParams<{ categoryId: string }>();
  const categoryId = params.categoryId;
  const router = useRouter();
  const isOwner = useAuthStore((state) => state.isOwner);

  const [category, setCategory] = useState<ArticleCategory | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!categoryId) return;
    setLoading(true);

    // 카테고리 정보 가져오기
    const { data: cat } = await supabase
      .from("pf_article_categories")
      .select("*")
      .eq("id", categoryId)
      .single<ArticleCategory>();

    // 해당 카테고리의 글 목록 가져오기
    const { data: arts, error } = await supabase
      .from("pf_articles")
      .select("id, title, cover_image_url, created_at, category_id")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    setCategory(cat ?? null);
    if (!error && arts) setArticles(arts as Article[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [categoryId]);

  const handleDeleteArticle = async (articleId: string, title: string) => {
    if (!confirm(`"${title}" 글을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
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
  };

  if (loading) {
    return (
      <div className="container-90" style={{ paddingTop: "0px" }}>
        
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-90" style={{ paddingTop: "0px" }}>
        <button
          onClick={() => router.push("/articles")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#222",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          
        </button>
      </div>
    );
  }

  return (
    <div className="container-90" style={{ paddingTop: "0px" }}>
      <div style={{ marginBottom: "32px" }}>
        {category.description && (
          <p style={{ fontSize: "16px", color: "#666" }}>{category.description}</p>
        )}
      </div>

      {isOwner && (
        <div className="plus-row">
          <ArticleCreateButton categoryId={categoryId} onCreated={load} />
        </div>
      )}

      <h1 className="mt-2 mb-4 font-white">.</h1>

      <div className="articles-grid" data-nopreview="true">
        {articles.map((a) => (
          <div key={a.id} className="article-card" style={{ position: "relative" }}>
            {isOwner && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteArticle(a.id, a.title);
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
                <div className="thumb thumb--empty">No Images</div>
              )}
            </VTLink>
          </div>
        ))}

        {articles.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            
          </div>
        )}
      </div>
    </div>
  );
}