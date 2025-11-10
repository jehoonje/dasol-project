"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import type { Article, ArticleBlock } from "../../types";
import ArticleBlocks from "@/components/ArticleBlocks";

// 편집 버튼은 동적 로드
const BlockAddButton = dynamic(() => import("@/components/BlockAddButton"), {
  ssr: false,
});

export default function ArticleDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

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

  if (loading) return <div className="container-90"><p>불러오는 중…</p></div>;
  if (!article) return <div className="container-90"><h1>게시글을 찾을 수 없습니다.</h1></div>;

  return (
    <div className="container-90">
      <div className="flex mb-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="mt-2 mb-2">{article.title}</h1>
        <BlockAddButton articleId={article.id} onAdded={load} />
      </div>

      <div className="pb-[30%]" style={{}}>
      <ArticleBlocks blocks={blocks} />
      </div>
    </div>
  );
}
