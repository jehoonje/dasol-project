"use client";

import Modal from "./Modal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../app/lib/supabaseClient";
import imageCompression from "browser-image-compression"; // 👈 압축 라이브러리 추가

export default function ArticleCreateButton({
  categoryId,
  onCreated,
}: {
  categoryId: string;
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력해 주세요.");
    if (!file) return alert("대표 이미지를 선택해 주세요.");
    if (!categoryId) return alert("카테고리 정보가 없습니다.");

    setLoading(true);
    try {
      const articleId = crypto.randomUUID();

      // ✅ 1. 대표 이미지 압축 로직 추가
      let fileToUpload = file;
      try {
        const options = {
          maxSizeMB: 1, // 1MB 제한
          maxWidthOrHeight: 1920, // 최대 해상도
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
      } catch (error) {
        console.error("이미지 압축 에러 (원본 파일로 업로드 진행):", error);
      }

      // 파일명 난수화 (덮어쓰기 방지)
      const safeFileName = fileToUpload.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const uniqueSuffix = Math.random().toString(36).substring(2, 8);
      const uploadPath = `articles/${articleId}/cover_${Date.now()}_${uniqueSuffix}_${safeFileName}`;

      // 2. 대표 이미지 업로드 (/api/upload 사용)
      const fd = new FormData();
      fd.append("bucket", "pf_article_images");
      fd.append("file", fileToUpload); // 원본 대신 압축된 파일 사용
      fd.append("path", uploadPath);
      
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "이미지 업로드에 실패했습니다.");
      const cover = json.publicUrl as string;

      // 3. 글 생성 (category_id 포함)
      const { data, error: artErr } = await supabase
        .from("pf_articles")
        .insert({
          id: articleId,
          title: title.trim(),
          cover_image_url: cover,
          category_id: categoryId, // 카테고리 연결!
        })
        .select()
        .single();

      if (artErr) throw artErr;

      alert("글이 생성되었습니다.");
      setOpen(false);
      setTitle("");
      setFile(null);
      onCreated?.();
      
      // 생성 직후 해당 글 상세 페이지로 이동
      if (data) {
        router.push(`/articles/${data.id}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`생성 실패: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className="button primary" 
        onClick={() => setOpen(true)} 
        style={{
          padding: "5px 10px",
          backgroundColor: "#222",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600"
        }}
      >
        ＋ 새 글 작성
      </button>
      
      <Modal
        open={open}
        title="새 Article 작성"
        onClose={() => !loading && setOpen(false)}
        actions={
          <button 
            className="button primary" 
            onClick={handleSubmit} 
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: loading ? "#ccc" : "#222",
              color: "white",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "업로드 및 생성 중..." : "글 생성"}
          </button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ fontWeight: "600", fontSize: "14px" }}>제목</span>
            <input
              style={{ padding: "10px", border: "1px solid #ddd", fontSize: "14px" }}
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          
          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ fontWeight: "600", fontSize: "14px" }}>대표 이미지 (Thumbnail)</span>
            <input
              type="file"
              accept="image/*"
              style={{ fontSize: "14px" }}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
            * 선택한 이미지는 목록 화면의 대표 썸네일로 사용됩니다.
          </p>
        </div>
      </Modal>
    </>
  );
}