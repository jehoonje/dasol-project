"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Modal from "./Modal";
import { supabase } from "../app/lib/supabaseClient";

type Props = {
  articleId: string;
  onAdded?: () => void;
};

type Mode = "menu" | "text" | "text_image" | "image" | "patterned";

interface ColoredSegment {
  text: string;
  color: string;
}

export default function BlockAddButton({ articleId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("menu");
  const [loading, setLoading] = useState(false);

  // 리치 텍스트 에디터 상태
  const [segments, setSegments] = useState<ColoredSegment[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [currentColor, setCurrentColor] = useState("#333333");
  const [customColor, setCustomColor] = useState("#333333");
  
  const [img, setImg] = useState<File | null>(null);
  const [imgs, setImgs] = useState<FileList | null>(null);
  const [img2, setImg2] = useState<File | null>(null);

  // 기본 색상 팔레트
  const colorPalette = [
    "#333333", "#E53E3E", "#DD6B20", "#D69E2E", 
    "#38A169", "#3182CE", "#805AD5", "#D53F8C", 
    "#718096", "#FFFFFF"
  ];



  const resetForm = () => {
    setSegments([]);
    setCurrentText("");
    setCurrentColor("#333333");
    setCustomColor("#333333");
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

  const uploadOne = async (bucket: string, file: File, pathPrefix: string) => {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const safePath = `${pathPrefix}/${Date.now()}_${safeFileName}`;
  
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(safePath, file);
  
    if (error) throw error;
  
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(safePath);
  
    return publicUrl;
  };

  // 현재 입력된 텍스트를 세그먼트에 추가
  const addSegment = () => {
    if (currentText.trim()) {
      setSegments([...segments, { text: currentText, color: currentColor }]);
      setCurrentText("");
    }
  };

  // 세그먼트 삭제
  const removeSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  // HTML 엔티티 이스케이프 (XSS 방지)
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // 세그먼트들을 HTML로 변환 (띄어쓰기 유지)
  const segmentsToHtml = (segs: ColoredSegment[]) => {
    return segs.map(seg => {
      const lines = seg.text.split('\n');
      return lines.map(line => {
        if (line.trim() === '') return '<br>';
        // 연속된 공백을 &nbsp;로 변환하여 띄어쓰기 유지
        const escaped = escapeHtml(line);
        const withSpaces = escaped.replace(/ {2,}/g, (match) => '&nbsp;'.repeat(match.length));
        return `<span style="color: ${seg.color}">${withSpaces}</span>`;
      }).join('<br>');
    }).join('');
  };

  const submitText = async () => {
    const finalSegments = currentText.trim() 
      ? [...segments, { text: currentText, color: currentColor }]
      : segments;

    if (finalSegments.length === 0) {
      return alert("텍스트를 입력해 주세요.");
    }

    setLoading(true);
    try {
      const sort = await getNextSort();
      const htmlContent = segmentsToHtml(finalSegments);
      
      const { error } = await supabase.from("pf_article_blocks").insert({
        article_id: articleId,
        block_type: "text",
        text_content: htmlContent,
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
    const finalSegments = currentText.trim() 
      ? [...segments, { text: currentText, color: currentColor }]
      : segments;

    if (finalSegments.length === 0) {
      return alert("텍스트를 입력해 주세요.");
    }
    if (!img && !img2) return alert("이미지를 선택해 주세요.");
    
    setLoading(true);
    try {
      const sort = await getNextSort();
      const imageFile = img ?? img2!;
      const url = await uploadOne("pf_article_images", imageFile, `blocks/${articleId}/${Date.now()}_${imageFile.name}`);

      const htmlContent = segmentsToHtml(finalSegments);

      const payload = {
        article_id: articleId,
        block_type: "text_image" as const,
        text_content: htmlContent,
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
    if (!imgs || imgs.length === 0) return alert("이미지를 선택해 주세요.");
    setLoading(true);
    try {
      const sort = await getNextSort();
      const files = Array.from(imgs);
      
      const uploadPromises = files.map((f, i) => 
        uploadOne("pf_article_images", f, `blocks/${articleId}`)
      );
      
      const urls = await Promise.all(uploadPromises);
  
      const { error } = await supabase.from("pf_article_blocks").insert({
        article_id: articleId,
        block_type: "patterned",
        images: urls as any,
        sort_order: sort,
      });
      
      if (error) throw error;
      setOpen(false);
      resetForm();
      onAdded?.();
    } catch (e: any) {
      alert(`업로드 실패: ${e.message}`);
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

      {/* Portal을 사용하여 body에 직접 렌더링 */}
      {open && typeof window !== 'undefined' && createPortal(
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
          onClick={() => !loading && setOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "4px",
              width: "100%",
              maxWidth: "580px",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "24px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
              {/* 헤더 */}
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
                  {mode === "menu" ? "Add a block" :
                   mode === "text" ? "Text block" :
                   mode === "text_image" ? "Text with Image" :
                   mode === "image" ? "Image block" :
                   "Patterned Images"}
                </h3>
              </div>

              {/* 메뉴 */}
              {mode === "menu" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button 
                    className="button" 
                    onClick={() => setMode("text")}
                    style={{ 
                      padding: "12px", 
                      textAlign: "left",
                      fontSize: "14px"
                    }}
                  >
                    Text
                  </button>
                  <button 
                    className="button" 
                    onClick={() => setMode("text_image")}
                    style={{ 
                      padding: "12px", 
                      textAlign: "left",
                      fontSize: "14px"
                    }}
                  >
                    Text with Image
                  </button>
                  <button 
                    className="button" 
                    onClick={() => setMode("image")}
                    style={{ 
                      padding: "12px", 
                      textAlign: "left",
                      fontSize: "14px"
                    }}
                  >
                    Image
                  </button>
                  <button 
                    className="button" 
                    onClick={() => setMode("patterned")}
                    style={{ 
                      padding: "12px", 
                      textAlign: "left",
                      fontSize: "14px"
                    }}
                  >
                    Patterned image
                  </button>
                </div>
              )}

              {/* Text 블록 */}
              {mode === "text" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* 색상 선택 */}
                  <div>
                    <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Color</div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCurrentColor(color)}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: color,
                            border: currentColor === color ? "2px solid #111" : "1px solid #ddd",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setCurrentColor(e.target.value);
                        }}
                        style={{
                          width: "32px",
                          height: "32px",
                          border: "1px solid #ddd",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }}
                      />
                      <span style={{ fontSize: "12px", color: "#999", fontFamily: "monospace" }}>
                        {currentColor}
                      </span>
                    </div>
                  </div>

                  {/* 텍스트 입력 */}
                  <div>
                    <textarea 
                      className="input" 
                      rows={4} 
                      value={currentText} 
                      onChange={(e) => setCurrentText(e.target.value)}
                      style={{
                        width: "100%",
                        color: currentColor,
                        fontSize: "14px",
                        lineHeight: "1.5"
                      }}
                      placeholder="Type here..."
                    />
                    <button
                      onClick={addSegment}
                      disabled={!currentText.trim()}
                      style={{
                        marginTop: "8px",
                        padding: "8px 14px",
                        backgroundColor: currentText.trim() ? "#111" : "#ddd",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: currentText.trim() ? "pointer" : "not-allowed",
                        fontSize: "13px",
                        width: "100%"
                      }}
                    >
                      Add segment
                    </button>
                  </div>

                  {/* 세그먼트 목록 */}
                  {segments.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {segments.map((seg, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px",
                            backgroundColor: "#f9f9f9",
                            borderRadius: "3px"
                          }}
                        >
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "2px",
                              backgroundColor: seg.color,
                              border: "1px solid #ddd",
                              flexShrink: 0
                            }}
                          />
                          <div
                            style={{
                              flex: 1,
                              color: seg.color,
                              fontSize: "13px",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word"
                            }}
                          >
                            {seg.text}
                          </div>
                          <button
                            onClick={() => removeSegment(idx)}
                            style={{
                              padding: "2px 6px",
                              backgroundColor: "#e53e3e",
                              color: "white",
                              border: "none",
                              borderRadius: "2px",
                              cursor: "pointer",
                              fontSize: "11px",
                              flexShrink: 0
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 미리보기 */}
                  {(segments.length > 0 || currentText) && (
                    <div>
                      <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Preview</div>
                      <div 
                        style={{
                          padding: "12px",
                          backgroundColor: "#fafafa",
                          borderRadius: "3px",
                          fontSize: "14px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap"
                        }}
                        dangerouslySetInnerHTML={{
                          __html: segmentsToHtml([
                            ...segments,
                            ...(currentText.trim() ? [{ text: currentText, color: currentColor }] : [])
                          ])
                        }}
                      />
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button
                      onClick={() => (setOpen(false), setTimeout(resetForm, 0))}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "3px",
                        backgroundColor: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitText}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "none",
                        borderRadius: "3px",
                        backgroundColor: loading ? "#ddd" : "#111",
                        color: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      }}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {/* Text + Image 블록 */}
              {mode === "text_image" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* 색상 선택 */}
                  <div>
                    <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Color</div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCurrentColor(color)}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: color,
                            border: currentColor === color ? "2px solid #111" : "1px solid #ddd",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setCurrentColor(e.target.value);
                        }}
                        style={{
                          width: "32px",
                          height: "32px",
                          border: "1px solid #ddd",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }}
                      />
                      <span style={{ fontSize: "12px", color: "#999", fontFamily: "monospace" }}>
                        {currentColor}
                      </span>
                    </div>
                  </div>

                  {/* 텍스트 입력 */}
                  <div>
                    <textarea 
                      className="input" 
                      rows={4} 
                      value={currentText} 
                      onChange={(e) => setCurrentText(e.target.value)}
                      style={{
                        width: "100%",
                        color: currentColor,
                        fontSize: "14px",
                        lineHeight: "1.5"
                      }}
                      placeholder="Type here..."
                    />
                    <button
                      onClick={addSegment}
                      disabled={!currentText.trim()}
                      style={{
                        marginTop: "8px",
                        padding: "8px 14px",
                        backgroundColor: currentText.trim() ? "#111" : "#ddd",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: currentText.trim() ? "pointer" : "not-allowed",
                        fontSize: "13px",
                        width: "100%"
                      }}
                    >
                      Add segment
                    </button>
                  </div>

                  {/* 세그먼트 목록 */}
                  {segments.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {segments.map((seg, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px",
                            backgroundColor: "#f9f9f9",
                            borderRadius: "3px"
                          }}
                        >
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "2px",
                              backgroundColor: seg.color,
                              border: "1px solid #ddd",
                              flexShrink: 0
                            }}
                          />
                          <div
                            style={{
                              flex: 1,
                              color: seg.color,
                              fontSize: "13px",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word"
                            }}
                          >
                            {seg.text}
                          </div>
                          <button
                            onClick={() => removeSegment(idx)}
                            style={{
                              padding: "2px 6px",
                              backgroundColor: "#e53e3e",
                              color: "white",
                              border: "none",
                              borderRadius: "2px",
                              cursor: "pointer",
                              fontSize: "11px",
                              flexShrink: 0
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 미리보기 */}
                  {(segments.length > 0 || currentText) && (
                    <div>
                      <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Preview</div>
                      <div 
                        style={{
                          padding: "12px",
                          backgroundColor: "#fafafa",
                          borderRadius: "3px",
                          fontSize: "14px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap"
                        }}
                        dangerouslySetInnerHTML={{
                          __html: segmentsToHtml([
                            ...segments,
                            ...(currentText.trim() ? [{ text: currentText, color: currentColor }] : [])
                          ])
                        }}
                      />
                    </div>
                  )}

                  {/* 이미지 업로드 */}
                  <div>
                    <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Image</div>
                    <input 
                      className="file" 
                      type="file" 
                      accept="image/*" 
                      onChange={(e)=>setImg(e.target.files?.[0] ?? null)}
                      style={{ fontSize: "13px" }}
                    />
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button
                      onClick={() => (setOpen(false), setTimeout(resetForm, 0))}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "3px",
                        backgroundColor: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitTextImage}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "none",
                        borderRadius: "3px",
                        backgroundColor: loading ? "#ddd" : "#111",
                        color: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      }}
                    >
                      {loading ? "Uploading..." : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {/* Image 블록 */}
              {mode === "image" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Image</div>
                    <input 
                      className="file" 
                      type="file" 
                      accept="image/*" 
                      onChange={(e)=>setImg(e.target.files?.[0] ?? null)}
                      style={{ fontSize: "13px" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => (setOpen(false), setTimeout(resetForm, 0))}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "3px",
                        backgroundColor: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitImage}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "none",
                        borderRadius: "3px",
                        backgroundColor: loading ? "#ddd" : "#111",
                        color: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      }}
                    >
                      {loading ? "Uploading..." : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {/* Patterned 블록 */}
              {mode === "patterned" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Images</div>
                    <input 
                      className="file" 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={(e)=>setImgs(e.target.files)}
                      style={{ fontSize: "13px" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => (setOpen(false), setTimeout(resetForm, 0))}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "3px",
                        backgroundColor: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitPatterned}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "none",
                        borderRadius: "3px",
                        backgroundColor: loading ? "#ddd" : "#111",
                        color: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      }}
                    >
                      {loading ? "Uploading..." : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}