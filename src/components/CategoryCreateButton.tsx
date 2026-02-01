"use client";

import { useState } from "react";
import { supabase } from "../app/lib/supabaseClient";

export default function CategoryCreateButton({ onCreated }: { onCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("pf_article_categories")
        .insert([{ title: title.trim(), sort_order: 0 }]);

      if (error) throw error;
      setTitle("");
      setIsOpen(false);
      onCreated();
    } catch (error: any) {
      alert(`생성 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "5px 10px",
          backgroundColor: "#222",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "20px",
        }}
      >
        + New Post
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{ backgroundColor: "white", padding: "32px", width: "90%", maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>대제목 생성</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="대제목을 입력하세요"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", marginBottom: "20px" }}
                required
                autoFocus
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setIsOpen(false)} style={{ flex: 1, padding: "10px", border: "1px solid #ddd", background: "#fff" }}>취소</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: "10px", background: "#222", color: "#fff", border: "none" }}>
                  {loading ? "생성 중..." : "확인"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}