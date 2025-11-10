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

      console.log("[Upload] Starting upload...");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      
      // 응답 텍스트 먼저 확인
      const text = await res.text();
      console.log("[Upload] Response status:", res.status);
      console.log("[Upload] Response text:", text);

      let json;
      try {
        json = JSON.parse(text);
      } catch (parseError) {
        console.error("[Upload] JSON parse error:", parseError);
        throw new Error(`서버 응답 파싱 실패: ${text.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(json?.error ?? `업로드 실패 (${res.status})`);
      }

      const url = json.publicUrl as string | null;
      if (!url) {
        throw new Error("publicUrl not available (bucket public 여부 확인)");
      }

      console.log("[Upload] Success! URL:", url);

      // Zustand 스토어 업데이트
      setBg(url);
      
      // localStorage에 저장
      try { 
        localStorage.setItem("bgUrl", url);
        console.log("[Upload] Saved to localStorage");
      } catch (e) {
        console.error("[Upload] localStorage error:", e);
      }

      // 서버에도 저장 (다른 기기 동기화용)
      try {
        const bgRes = await fetch("/api/background", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        
        if (bgRes.ok) {
          console.log("[Upload] Saved to database");
        } else {
          console.warn("[Upload] DB save failed but continuing");
        }
      } catch (dbError) {
        console.error("[Upload] DB save error:", dbError);
        // DB 저장 실패해도 계속 진행
      }

      setOpen(false);
      setFile(null);
      alert("배경 이미지가 성공적으로 업로드되었습니다!");
    } catch (e: any) {
      console.error("[Upload] Error:", e);
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