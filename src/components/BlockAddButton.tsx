"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { supabase } from "../app/lib/supabaseClient";

type Props = {
  articleId: string;
  onAdded?: () => void;
};

type Mode = "menu" | "text" | "text_image" | "image" | "patterned";

export default function BlockAddButton({ articleId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("menu");
  const [loading, setLoading] = useState(false);

  // 공통 입력 상태
  const [text, setText] = useState("");
  const [img, setImg] = useState<File | null>(null);
  const [imgs, setImgs] = useState<FileList | null>(null);
  const [img2, setImg2] = useState<File | null>(null); // text_image 용

  const resetForm = () => {
    setText("");
    setImg(null);
    setImg2(null);
    setImgs(null);
    setMode("menu");
  };

  const getNextSort = async () => {
    const { data, error } = await supabase
      .from("pf_article_blocks")
      .select("sort_order")
      .eq("article_id", articleId)
      .order("sort_order", { ascending: false })
      .limit(1);
    if (!error && data && data.length) return (data[0].sort_order as number) + 1;
    return 0;
  };

  const uploadOne = async (bucket: string, file: File, path: string) => {
    const fd = new FormData();
    fd.append("bucket", bucket);
    fd.append("file", file);
    fd.append("path", path);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "upload failed");
    return json.publicUrl as string;
  };

  const submitText = async () => {
    if (!text.trim()) return alert("텍스트를 입력해 주세요.");
    setLoading(true);
    try {
      const sort = await getNextSort();
      const { error } = await supabase.from("pf_article_blocks").insert({
        article_id: articleId,
        block_type: "text",
        text_content: text,
        sort_order: sort,
      });
      if (error) throw error;
      setOpen(false);
      resetForm();
      onAdded?.();
    } catch (e: any) {
      alert(e?.message ?? e);
    } finally {
      setLoading(false);
    }
  };

  const submitTextImage = async () => {
    if (!text.trim()) return alert("텍스트를 입력해 주세요.");
    if (!img && !img2) return alert("왼쪽/오른쪽 중 최소 1개의 이미지를 선택해 주세요.");
    // 요구사항: 텍스트와 이미지 1세트(가로 50%씩)
    // 텍스트는 가운데 정렬 컨테이너, 이미지는 업로드 후 URL 저장
    setLoading(true);
    try {
      const sort = await getNextSort();
      const leftIsText = true; // 텍스트 좌측, 이미지 우측 (간단 버전). 필요 시 토글 UI 추가 가능
      const imageFile = img ?? img2!;
      const url = await uploadOne("pf_article_images", imageFile, `blocks/${articleId}/${Date.now()}_${imageFile.name}`);

      const payload = {
        article_id: articleId,
        block_type: "text_image" as const,
        text_content: text,
        image_url: url,
        sort_order: sort,
      };
      const { error } = await supabase.from("pf_article_blocks").insert(payload);
      if (error) throw error;
      setOpen(false);
      resetForm();
      onAdded?.();
    } catch (e: any) {
      alert(e?.message ?? e);
    } finally {
      setLoading(false);
    }
  };

  const submitImage = async () => {
    if (!img) return alert("이미지를 선택해 주세요.");
    setLoading(true);
    try {
      const sort = await getNextSort();
      const url = await uploadOne("pf_article_images", img, `blocks/${articleId}/${Date.now()}_${img.name}`);
      const { error } = await supabase.from("pf_article_blocks").insert({
        article_id: articleId,
        block_type: "image",
        image_url: url,
        sort_order: sort,
      });
      if (error) throw error;
      setOpen(false);
      resetForm();
      onAdded?.();
    } catch (e: any) {
      alert(e?.message ?? e);
    } finally {
      setLoading(false);
    }
  };

  const submitPatterned = async () => {
    if (!imgs || imgs.length === 0) return alert("이미지를 한 장 이상 선택해 주세요.");
    setLoading(true);
    try {
      const sort = await getNextSort();
      const files = Array.from(imgs);
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const url = await uploadOne("pf_article_images", f, `blocks/${articleId}/${Date.now()}_${i}_${f.name}`);
        urls.push(url);
      }
      const { error } = await supabase.from("pf_article_blocks").insert({
        article_id: articleId,
        block_type: "patterned",
        images: urls,
        sort_order: sort,
      });
      if (error) throw error;
      setOpen(false);
      resetForm();
      onAdded?.();
    } catch (e: any) {
      alert(e?.message ?? e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="button primary" onClick={() => setOpen(true)} title="Add Post" style={{
            marginTop: "80px"
          }}>
        ＋ Add Post
      </button>

      <Modal
        open={open}
        title={mode === "menu" ? "Add a block" :
               mode === "text" ? "Text block" :
               mode === "text_image" ? "Text with Image" :
               mode === "image" ? "Image block" :
               "Patterned Images"}
        onClose={() => !loading && (setOpen(false), setTimeout(resetForm, 0))}
        actions={
          mode === "menu" ? null : (
            <>
              {mode === "text" && (
                <button className="button primary" onClick={submitText} disabled={loading}>
                  {loading ? "저장 중..." : "추가"}
                </button>
              )}
              {mode === "text_image" && (
                <button className="button primary" onClick={submitTextImage} disabled={loading}>
                  {loading ? "업로드 중..." : "추가"}
                </button>
              )}
              {mode === "image" && (
                <button className="button primary" onClick={submitImage} disabled={loading}>
                  {loading ? "업로드 중..." : "추가"}
                </button>
              )}
              {mode === "patterned" && (
                <button className="button primary" onClick={submitPatterned} disabled={loading}>
                  {loading ? "업로드 중..." : "추가"}
                </button>
              )}
            </>
          )
        }
      >
        {mode === "menu" && (
          <div className="vstack gap-2">
            <button className="button" onClick={() => setMode("text")}>Text</button>
            <button className="button" onClick={() => setMode("text_image")}>Text with Image</button>
            <button className="button" onClick={() => setMode("image")}>Image</button>
            <button className="button" onClick={() => setMode("patterned")}>Patterned image</button>
          </div>
        )}

        {mode === "text" && (
          <div className="vstack gap-2">
            <label className="grid gap-1">
              텍스트
              <textarea className="input" rows={6} value={text} onChange={(e)=>setText(e.target.value)} />
            </label>
            <small>가운데 정렬 컨테이너로 전체 폭(100%) 영역에 스택됩니다.</small>
          </div>
        )}

        {mode === "text_image" && (
          <div className="vstack gap-2">
            <label className="grid gap-1">
              텍스트
              <textarea className="input" rows={6} value={text} onChange={(e)=>setText(e.target.value)} />
            </label>
            <label className="grid gap-1">
              이미지 (필수)
              <input className="file" type="file" accept="image/*" onChange={(e)=>setImg(e.target.files?.[0] ?? null)} />
            </label>
            <small>텍스트(좌) + 이미지(우) 50%/50%로 배치됩니다. 이미지 미선택 시 경고가 표시됩니다.</small>
          </div>
        )}

        {mode === "image" && (
          <div className="vstack gap-2">
            <label className="grid gap-1">
              이미지 (1장)
              <input className="file" type="file" accept="image/*" onChange={(e)=>setImg(e.target.files?.[0] ?? null)} />
            </label>
            <small>가운데 정렬, 폭 60%로 배치됩니다.</small>
          </div>
        )}

        {mode === "patterned" && (
          <div className="vstack gap-2">
            <label className="grid gap-1">
              이미지 여러 장
              <input className="file" type="file" accept="image/*" multiple onChange={(e)=>setImgs(e.target.files)} />
            </label>
            <small>여러 장을 바둑판식 그리드로 렌더링합니다.</small>
          </div>
        )}
      </Modal>
    </>
  );
}
