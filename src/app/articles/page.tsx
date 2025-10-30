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

      <div className="list" data-nopreview="true">
  {items.map((a) => (
    <div key={a.id} className="article-card">
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
