// components/BlockEditModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ArticleBlock } from "@/app/types";
import { supabase } from "@/app/lib/supabaseClient";

type Props = {
  block: ArticleBlock;
  onClose: () => void;
  onUpdated: () => void;
};

interface ColoredSegment {
  text: string;
  color: string;
}

type BlockType = "text" | "text_image" | "image" | "patterned";

export default function BlockEditModal({ block, onClose, onUpdated }: Props) {
  // HTML에서 색상별 세그먼트 파싱
  const parseHtmlToSegments = (html: string): ColoredSegment[] => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    const segments: ColoredSegment[] = [];
    const spans = temp.querySelectorAll('span[style*="color"]');
    
    spans.forEach(span => {
      const text = (span.textContent || '').replace(/\u00A0/g, ' ');
      const style = span.getAttribute('style') || '';
      const colorMatch = style.match(/color:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|[a-z]+)/);
      const color = colorMatch ? colorMatch[1] : '#333333';
      
      if (text.trim()) {
        segments.push({ text, color });
      }
    });
    
    if (segments.length === 0 && temp.textContent) {
      segments.push({ text: temp.textContent.replace(/\u00A0/g, ' '), color: '#333333' });
    }
    
    return segments;
  };

  // HTML에서 text-align 추출
  const parseTextAlign = (html: string): "left" | "center" | "right" | "justify" => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const firstDiv = temp.querySelector('div[style*="text-align"]');
    if (firstDiv) {
      const style = firstDiv.getAttribute('style') || '';
      const alignMatch = style.match(/text-align:\s*(left|center|right|justify)/);
      if (alignMatch) {
        return alignMatch[1] as "left" | "center" | "right" | "justify";
      }
    }
    return 'center';
  };

  const [blockType, setBlockType] = useState<BlockType>(block.block_type as BlockType);
  const [segments, setSegments] = useState<ColoredSegment[]>(
    parseHtmlToSegments(block.text_content || "")
  );
  const [currentText, setCurrentText] = useState("");
  const [currentColor, setCurrentColor] = useState("#333333");
  const [customColor, setCustomColor] = useState("#333333");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">(
    parseTextAlign(block.text_content || "")
  );
  
  // 이미지 관련
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImages, setNewImages] = useState<FileList | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);

  const colorPalette = [
    "#333333", "#E53E3E", "#DD6B20", "#D69E2E", 
    "#38A169", "#3182CE", "#805AD5", "#D53F8C", 
    "#718096", "#FFFFFF"
  ];

  const addSegment = () => {
    if (currentText.trim()) {
      setSegments([...segments, { text: currentText, color: currentColor }]);
      setCurrentText("");
    }
  };

  const removeSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const updateSegment = (index: number, text: string) => {
    const newSegments = [...segments];
    newSegments[index].text = text;
    setSegments(newSegments);
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const segmentsToHtml = (segs: ColoredSegment[]) => {
    const content = segs.map(seg => {
      const lines = seg.text.split('\n');
      return lines.map(line => {
        if (line.trim() === '') return '<br>';
        const escaped = escapeHtml(line);
        const withSpaces = escaped.replace(/ {2,}/g, (match) => '&nbsp;'.repeat(match.length));
        return `<span style="color: ${seg.color}">${withSpaces}</span>`;
      }).join('<br>');
    }).join('');
    
    return `<div style="text-align: ${textAlign}">${content}</div>`;
  };

  // 이미지 미리보기
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
    const filePath = `blocks/${block.article_id}/${Date.now()}_${safeFileName}`;
    
    const { data, error } = await supabase.storage
      .from("pf_article_images")
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from("pf_article_images")
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  // 기존 이미지 삭제
  const deleteImage = async (imageUrl: string) => {
    try {
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
    }
  };

  // 기존 블록의 모든 이미지 삭제
  const deleteOldImages = async () => {
    if (block.block_type === "image" && block.image_url) {
      await deleteImage(block.image_url);
    } else if (block.block_type === "text_image" && block.image_url) {
      await deleteImage(block.image_url);
    } else if (block.block_type === "patterned" && Array.isArray(block.images)) {
      await Promise.all(block.images.map(url => deleteImage(url)));
    }
  };

  const handleSave = async () => {
    // 타입별 유효성 검사
    if (blockType === "text" || blockType === "text_image") {
      const finalSegments = currentText.trim() 
        ? [...segments, { text: currentText, color: currentColor }]
        : segments;

      if (finalSegments.length === 0) {
        alert("텍스트를 입력하세요.");
        return;
      }
    }

    if (blockType === "text_image" && !newImage && !block.image_url) {
      alert("이미지를 선택하세요.");
      return;
    }

    if (blockType === "image" && !newImage && !block.image_url) {
      alert("이미지를 선택하세요.");
      return;
    }

    if (blockType === "patterned" && !newImages && (!block.images || block.images.length === 0)) {
      alert("이미지를 선택하세요.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        block_type: blockType,
      };

      // 블록 타입이 변경된 경우 기존 이미지 삭제
      if (blockType !== block.block_type) {
        await deleteOldImages();
      }

      // 타입별 데이터 준비
      if (blockType === "text") {
        const finalSegments = currentText.trim() 
          ? [...segments, { text: currentText, color: currentColor }]
          : segments;
        payload.text_content = segmentsToHtml(finalSegments);
        payload.image_url = null;
        payload.images = null;
      } 
      else if (blockType === "text_image") {
        const finalSegments = currentText.trim() 
          ? [...segments, { text: currentText, color: currentColor }]
          : segments;
        payload.text_content = segmentsToHtml(finalSegments);
        
        if (newImage) {
          // 타입이 같고 새 이미지가 있으면 기존 이미지 삭제
          if (blockType === block.block_type && block.image_url) {
            await deleteImage(block.image_url);
          }
          payload.image_url = await uploadImage(newImage);
        } else if (blockType === block.block_type) {
          payload.image_url = block.image_url;
        }
        payload.images = null;
      } 
      else if (blockType === "image") {
        payload.text_content = null;
        
        if (newImage) {
          // 타입이 같고 새 이미지가 있으면 기존 이미지 삭제
          if (blockType === block.block_type && block.image_url) {
            await deleteImage(block.image_url);
          }
          payload.image_url = await uploadImage(newImage);
        } else if (blockType === block.block_type) {
          payload.image_url = block.image_url;
        }
        payload.images = null;
      } 
      else if (blockType === "patterned") {
        payload.text_content = null;
        payload.image_url = null;
        
        if (newImages && newImages.length > 0) {
          // 타입이 같고 새 이미지들이 있으면 기존 이미지들 삭제
          if (blockType === block.block_type && Array.isArray(block.images)) {
            await Promise.all(block.images.map(url => deleteImage(url)));
          }
          
          const files = Array.from(newImages);
          const uploadPromises = files.map(f => uploadImage(f));
          const urls = await Promise.all(uploadPromises);
          payload.images = urls;
        } else if (blockType === block.block_type) {
          payload.images = block.images;
        }
      }

      const res = await fetch(`/api/blocks/${block.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          borderRadius: "4px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          overflow: "auto",
          padding: "24px"
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
            Edit block
          </h3>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
            Original type: {block.block_type}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 블록 타입 선택 */}
          <div>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Block Type</div>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              <button
                onClick={() => setBlockType("text")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: blockType === "text" ? "#111" : "#f5f5f5",
                  color: blockType === "text" ? "white" : "#666",
                  border: "1px solid #ddd",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Text
              </button>
              <button
                onClick={() => setBlockType("text_image")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: blockType === "text_image" ? "#111" : "#f5f5f5",
                  color: blockType === "text_image" ? "white" : "#666",
                  border: "1px solid #ddd",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Text + Image
              </button>
              <button
                onClick={() => setBlockType("image")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: blockType === "image" ? "#111" : "#f5f5f5",
                  color: blockType === "image" ? "white" : "#666",
                  border: "1px solid #ddd",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Image
              </button>
              <button
                onClick={() => setBlockType("patterned")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: blockType === "patterned" ? "#111" : "#f5f5f5",
                  color: blockType === "patterned" ? "white" : "#666",
                  border: "1px solid #ddd",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Gallery
              </button>
            </div>
            {blockType !== block.block_type && (
              <div style={{ 
                marginTop: "8px",
                padding: "8px",
                backgroundColor: "#FEF3C7",
                borderRadius: "3px",
                fontSize: "12px",
                color: "#92400E"
              }}>
                ⚠️ 타입 변경 시 기존 이미지가 삭제됩니다
              </div>
            )}
          </div>

          {/* Text 또는 Text+Image 타입 */}
          {(blockType === "text" || blockType === "text_image") && (
            <>
              {/* 텍스트 정렬 */}
              <div>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Alignment</div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button onClick={() => setTextAlign("left")} style={{ padding: "8px 12px", backgroundColor: textAlign === "left" ? "#111" : "#f5f5f5", color: textAlign === "left" ? "white" : "#666", border: "1px solid #ddd", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>←</button>
                  <button onClick={() => setTextAlign("center")} style={{ padding: "8px 12px", backgroundColor: textAlign === "center" ? "#111" : "#f5f5f5", color: textAlign === "center" ? "white" : "#666", border: "1px solid #ddd", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>↔</button>
                  <button onClick={() => setTextAlign("right")} style={{ padding: "8px 12px", backgroundColor: textAlign === "right" ? "#111" : "#f5f5f5", color: textAlign === "right" ? "white" : "#666", border: "1px solid #ddd", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>→</button>
                  <button onClick={() => setTextAlign("justify")} style={{ padding: "8px 12px", backgroundColor: textAlign === "justify" ? "#111" : "#f5f5f5", color: textAlign === "justify" ? "white" : "#666", border: "1px solid #ddd", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>≡</button>
                </div>
              </div>

              {/* 색상 선택 */}
              <div>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Color</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                  {colorPalette.map((color) => (
                    <button key={color} onClick={() => setCurrentColor(color)} style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: color, border: currentColor === color ? "2px solid #111" : "1px solid #ddd", cursor: "pointer" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); setCurrentColor(e.target.value); }} style={{ width: "32px", height: "32px", border: "1px solid #ddd", borderRadius: "3px", cursor: "pointer" }} />
                  <span style={{ fontSize: "12px", color: "#999", fontFamily: "monospace" }}>{currentColor}</span>
                </div>
              </div>

              {/* 기존 세그먼트 */}
              {segments.length > 0 && (
                <div>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Segments ({segments.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {segments.map((seg, idx) => (
                      <div key={idx} style={{ padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "3px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <div style={{ width: "16px", height: "16px", borderRadius: "2px", backgroundColor: seg.color, border: "1px solid #ddd", flexShrink: 0 }} />
                          <span style={{ fontSize: "11px", color: "#999", fontFamily: "monospace" }}>{seg.color}</span>
                          <button onClick={() => removeSegment(idx)} style={{ marginLeft: "auto", padding: "2px 6px", backgroundColor: "#e53e3e", color: "white", border: "none", borderRadius: "2px", cursor: "pointer", fontSize: "11px" }}>×</button>
                        </div>
                        <textarea value={seg.text} onChange={(e) => updateSegment(idx, e.target.value)} rows={2} style={{ width: "100%", padding: "6px", border: "1px solid #ddd", borderRadius: "3px", fontSize: "13px", fontFamily: "inherit", lineHeight: "1.5", color: seg.color, resize: "vertical" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 새 세그먼트 추가 */}
              <div>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Add new</div>
                <textarea value={currentText} onChange={(e) => setCurrentText(e.target.value)} rows={3} placeholder="Type here..." style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "3px", fontSize: "13px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.5", color: currentColor, marginBottom: "6px" }} />
                <button onClick={addSegment} disabled={!currentText.trim()} style={{ padding: "8px 14px", backgroundColor: currentText.trim() ? "#111" : "#ddd", color: "white", border: "none", borderRadius: "3px", cursor: currentText.trim() ? "pointer" : "not-allowed", fontSize: "13px", width: "100%" }}>Add segment</button>
              </div>

              {/* 미리보기 */}
              {(segments.length > 0 || currentText) && (
                <div>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Preview</div>
                  <div style={{ padding: "12px", backgroundColor: "#fafafa", borderRadius: "3px", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: segmentsToHtml([...segments, ...(currentText.trim() ? [{ text: currentText, color: currentColor }] : [])]) }} />
                </div>
              )}
            </>
          )}

          {/* Text+Image의 이미지 */}
          {blockType === "text_image" && (
            <div>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Image</div>
              {(previewUrl || block.image_url) && !newImage && (
                <div style={{ marginBottom: "12px", border: "1px solid #ddd", borderRadius: "3px", overflow: "hidden" }}>
                  <img src={previewUrl || block.image_url || ""} alt="Current" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
                </div>
              )}
              {previewUrl && newImage && (
                <div style={{ marginBottom: "12px", border: "1px solid #ddd", borderRadius: "3px", overflow: "hidden" }}>
                  <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: "13px", padding: "8px", border: "1px solid #ddd", borderRadius: "3px", width: "100%" }} />
            </div>
          )}

          {/* Image 타입 */}
          {blockType === "image" && (
            <div>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Image</div>
              {(previewUrl || block.image_url) && !newImage && (
                <div style={{ marginBottom: "12px", border: "1px solid #ddd", borderRadius: "3px", overflow: "hidden" }}>
                  <img src={previewUrl || block.image_url || ""} alt="Current" style={{ width: "100%", maxHeight: "300px", objectFit: "cover", display: "block" }} />
                </div>
              )}
              {previewUrl && newImage && (
                <div style={{ marginBottom: "12px", border: "1px solid #ddd", borderRadius: "3px", overflow: "hidden" }}>
                  <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: "300px", objectFit: "cover", display: "block" }} />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: "13px", padding: "8px", border: "1px solid #ddd", borderRadius: "3px", width: "100%" }} />
            </div>
          )}

          {/* Patterned 타입 */}
          {blockType === "patterned" && (
            <div>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Images (multiple)</div>
              {Array.isArray(block.images) && block.images.length > 0 && !newImages && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "6px", marginBottom: "12px" }}>
                  {block.images.slice(0, 6).map((img, idx) => (
                    <img key={idx} src={img} alt="" style={{ width: "100%", height: "80px", objectFit: "cover", border: "1px solid #ddd", borderRadius: "3px" }} />
                  ))}
                  {block.images.length > 6 && (
                    <div style={{ width: "100%", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #ddd", borderRadius: "3px", backgroundColor: "#f9f9f9", color: "#999", fontSize: "12px" }}>+{block.images.length - 6}</div>
                  )}
                </div>
              )}
              <input type="file" accept="image/*" multiple onChange={(e) => setNewImages(e.target.files)} style={{ fontSize: "13px", padding: "8px", border: "1px solid #ddd", borderRadius: "3px", width: "100%" }} />
              {newImages && <div style={{ fontSize: "12px", color: "#666", marginTop: "6px" }}>{newImages.length}개 이미지 선택됨</div>}
            </div>
          )}

          {/* 액션 버튼 */}
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #e5e5e5" }}>
            <button onClick={onClose} disabled={saving} style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "3px", backgroundColor: "white", cursor: saving ? "not-allowed" : "pointer", fontSize: "14px" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "3px", backgroundColor: saving ? "#ddd" : "#111", color: "white", cursor: saving ? "not-allowed" : "pointer", fontSize: "14px" }}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
}