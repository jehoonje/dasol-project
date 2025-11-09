"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useUIStore } from "../app/store/useUIStore";

export default function BackgroundUploadButton() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const setBg = useUIStore((s) => s.setBackgroundImageUrl);

  const handleSubmit = async () => {
    if (!file) return alert("이미지를 선택해 주세요.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("bucket", "pf_backgrounds");
      fd.append("file", file);
      fd.append("path", `home/${Date.now()}_${file.name}`);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "upload failed");

      const url = json.publicUrl as string | null;
      if (!url) throw new Error("publicUrl not available (bucket public 여부 확인)");

      // Zustand 스토어 업데이트
      setBg(url);
      
      // localStorage에 저장
      try { 
        localStorage.setItem("bgUrl", url); 
      } catch {}

      // 서버에도 저장 (다른 기기 동기화용)
      await fetch("/api/background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }).catch(console.error);

      setOpen(false);
      setFile(null);
    } catch (e: any) {
      console.error(e);
      alert(`업로드 실패: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="button relative top-60" onClick={() => setOpen(true)}>
        배경 이미지 추가
      </button>

      <Modal
        open={open}
        title="배경 이미지 업로드"
        onClose={() => !loading && setOpen(false)}
        actions={
          <button className="button primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "업로드 중..." : "적용"}
          </button>
        }
      >
        <input
          className="file"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </Modal>
    </>
  );
}