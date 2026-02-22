// components/ArticleEditModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/app/lib/supabaseClient";
import type { ArticleCategory } from "@/app/types";

type Props = {
  articleId: string;
  currentTitle: string;
  currentCategoryId: string;
  currentCoverImage?: string | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function ArticleEditModal({
  articleId,
  currentTitle,
  currentCategoryId,
  currentCoverImage,
  onClose,
  onUpdated,
}: Props) {
  const [title, setTitle] = useState(currentTitle);
  const [categoryId, setCategoryId] = useState(currentCategoryId);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCoverImage || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from("pf_article_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setCategories(data as ArticleCategory[]);
    };
    loadCategories();
  }, []);

  // 이미지 선택 시 미리보기
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 업로드
  const uploadImage = async (file: File): Promise<string> => {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = `articles/${articleId}/${Date.now()}_${safeFileName}`;
    
    const { data, error } = await supabase.storage
      .from("pf_article_images")
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from("pf_article_images")
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  // 기존 이미지 삭제 (Storage에서만)
  const deleteOldImage = async (imageUrl: string) => {
    try {
      // URL에서 파일 경로 추출
      const urlObj = new URL(imageUrl);
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/pf_article_images\/(.+)/);
      
      if (pathMatch && pathMatch[1]) {
        const filePath = decodeURIComponent(pathMatch[1]);
        await supabase.storage
          .from("pf_article_images")
          .remove([filePath]);
      }
    } catch (error) {
      console.error("이미지 삭제 중 오류:", error);
      // 삭제 실패해도 계속 진행 (이미지가 이미 삭제되었을 수 있음)
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("제목을 입력하세요.");
      return;
    }
    if (!categoryId) {
      alert("카테고리를 선택하세요.");
      return;
    }

    setSaving(true);
    try {
      let coverImageUrl = currentCoverImage;

      // 새 이미지가 있으면 업로드
      if (newImage) {
        coverImageUrl = await uploadImage(newImage);
        
        // 기존 이미지가 있으면 삭제
        if (currentCoverImage) {
          await deleteOldImage(currentCoverImage);
        }
      }

      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          category_id: categoryId,
          cover_image_url: coverImageUrl 
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "수정 실패");
      }

      alert("수정되었습니다.");
      onUpdated();
      onClose();
    } catch (error: any) {
      alert(`수정 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return typeof window !== 'undefined' ? createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
        overflow: "auto"
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "4px",
          width: "100%",
          maxWidth: "580px",
          maxHeight: "90vh",
          overflow: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          marginBottom: "20px",
          paddingBottom: "12px",
          borderBottom: "1px solid #e5e5e5"
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: "18px", 
            fontWeight: "600",
            color: "#111"
          }}>
            Edit Article
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 제목 */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontSize: "13px",
              color: "#666"
            }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "3px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontSize: "13px",
              color: "#666"
            }}>
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "3px",
                fontSize: "14px",
              }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          {/* 커버 이미지 */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontSize: "13px",
              color: "#666"
            }}>
              Cover Image
            </label>
            
            {/* 현재 이미지 미리보기 */}
            {previewUrl && (
              <div style={{ 
                marginBottom: "12px",
                border: "1px solid #ddd",
                borderRadius: "3px",
                overflow: "hidden"
              }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                    display: "block"
                  }}
                />
              </div>
            )}

            {/* 이미지 선택 */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                fontSize: "13px",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "3px",
                width: "100%"
              }}
            />
            <div style={{ 
              fontSize: "12px", 
              color: "#999", 
              marginTop: "6px" 
            }}>
              {newImage ? "새 이미지가 선택되었습니다" : "새 이미지를 선택하면 기존 이미지를 대체합니다"}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            marginTop: "8px",
            paddingTop: "16px",
            borderTop: "1px solid #e5e5e5"
          }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "3px",
                backgroundColor: "white",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "14px"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "3px",
                backgroundColor: saving ? "#ddd" : "#111",
                color: "white",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "14px"
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
}