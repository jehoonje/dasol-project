"use client";

import Modal from "./Modal";
import { useState } from "react";
import { supabase } from "../app/lib/supabaseClient";

export default function ArticleCreateButton({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력해 주세요.");
    if (!file) return alert("대표 이미지를 선택해 주세요.");

    setLoading(true);
    try {
      const articleId = crypto.randomUUID();

      // 대표 이미지 1장 업로드 (서비스 롤 API 경유)
      const fd = new FormData();
      fd.append("bucket", "pf_article_images");
      fd.append("file", file);
      fd.append("path", `articles/${articleId}/cover_${Date.now()}_${file.name}`);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "upload failed");
      const cover = json.publicUrl as string;

      // 글 생성
      const { error: artErr } = await supabase.from("pf_articles").insert({
        id: articleId,
        title,
        cover_image_url: cover,
      });
      if (artErr) throw artErr;

      setOpen(false);
      setTitle("");
      setFile(null);
      onCreated?.();
    } catch (e: any) {
      console.error(e);
      alert(`생성 실패: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="button primary" onClick={() => setOpen(true)} title="새 글">＋ New Post</button>
      <Modal
        open={open}
        title="새 Article"
        onClose={() => !loading && setOpen(false)}
        actions={
          <button className="button primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "업로드 중..." : "생성"}
          </button>
        }
      >
        <div className=".vstack gap-2">
          <label className="grid gap-1">
            제목
            <input
              className="input"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            대표 이미지 (1장)
            <input
              className="file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <small>대표 이미지는 목록의 썸네일로 사용됩니다.</small>
        </div>
      </Modal>
    </>
  );
}
