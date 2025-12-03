"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import type { Article, ArticleBlock } from "../../types";
import ArticleBlocks from "@/components/ArticleBlocks";
import { useAuthStore } from "../../store/useAuthStore";

// 편집 버튼은 동적 로드
const BlockAddButton = dynamic(() => import("@/components/BlockAddButton"), {
  ssr: false,
});

export default function ArticleDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const isOwner = useAuthStore((state) => state.isOwner);

  const [article, setArticle] = useState<Article | null>(null);
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);

    const { data: a } = await supabase
      .from("pf_articles")
      .select("*")
      .eq("id", id)
      .single<Article>();

    const { data: bs } = await supabase
      .from("pf_article_blocks")
      .select("*")
      .eq("article_id", id)
      .order("sort_order", { ascending: true })
      .returns<ArticleBlock[]>();

    setArticle(a ?? null);
    setBlocks(bs ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const handleDelete = async () => {
    if (!article || !confirm(`"${article.title}" 글을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "삭제 실패");
      }
      alert("삭제되었습니다.");
      router.push("/articles");
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  if (loading) return <div className="container-90" style={{ paddingTop: "80px" }}><p>불러오는 중…</p></div>;
  if (!article) return <div className="container-90" style={{ paddingTop: "80px" }}><h1>게시글을 찾을 수 없습니다.</h1></div>;

  return (
    <div className="container-90" style={{ position: "relative", paddingTop: "80px" }}>
      {isOwner && (
        <button
          onClick={handleDelete}
          style={{
            position: "fixed",
            top: "80px",
            right: "5%",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
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

      <div className="flex mb-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* <h1 className="mt-2 mb-2">{article.title}</h1> */}
        {isOwner && <BlockAddButton articleId={article.id} onAdded={load} />}
      </div>

      <div className="pb-[30%]" style={{}}>
      <ArticleBlocks blocks={blocks} />
      </div>
    </div>
  );
}
