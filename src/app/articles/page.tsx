"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ArticleCreateButton from "@/components/ArticleCreateButton";
import VTLink from "@/components/VTLink";
import type { Route } from "next";

type Article = {
  id: string;
  title: string;
  cover_image_url: string | null;
  created_at: string;
};

export default function ArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="container-60">
      <div className="plus-row">
        <ArticleCreateButton onCreated={load} />
      </div>

      <h1 className="mt-2 mb-4">Articles</h1>

      {loading && <p>불러오는 중…</p>}

      <div className="list">
        {items.map((a) => (
          <div key={a.id} className="article-card">
            <VTLink href={`/articles/${a.id}` as Route}>
              <h2 className="article-title">{a.title}</h2>
              {a.cover_image_url ? (
                <img src={a.cover_image_url} alt={a.title} />
              ) : (
                <div className="border border-gray-200 p-4 text-center">대표 이미지 없음</div>
              )}
            </VTLink>
          </div>
        ))}
        {!loading && items.length === 0 && <p>아직 게시글이 없습니다. 상단의 [+]로 추가해 보세요.</p>}
      </div>
    </div>
  );
}
