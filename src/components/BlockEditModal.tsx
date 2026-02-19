// components/BlockEditModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ArticleBlock } from "@/app/types";

type Props = {
  block: ArticleBlock;
  onClose: () => void;
  onUpdated: () => void;
};

interface ColoredSegment {
  text: string;
  color: string;
}

export default function BlockEditModal({ block, onClose, onUpdated }: Props) {
  // HTML에서 색상별 세그먼트 파싱
  const parseHtmlToSegments = (html: string): ColoredSegment[] => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    const segments: ColoredSegment[] = [];
    const spans = temp.querySelectorAll('span[style*="color"]');
    
    spans.forEach(span => {
      const text = (span.textContent || '').replace(/\u00A0/g, ' '); // &nbsp;를 일반 공백으로
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

  const [segments, setSegments] = useState<ColoredSegment[]>(
    parseHtmlToSegments(block.text_content || "")
  );
  const [currentText, setCurrentText] = useState("");
  const [currentColor, setCurrentColor] = useState("#333333");
  const [customColor, setCustomColor] = useState("#333333");
  const [saving, setSaving] = useState(false);



  // 기본 색상 팔레트
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

  // HTML 엔티티 이스케이프
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // 세그먼트를 HTML로 변환 (띄어쓰기 유지)
  const segmentsToHtml = (segs: ColoredSegment[]) => {
    return segs.map(seg => {
      const lines = seg.text.split('\n');
      return lines.map(line => {
        if (line.trim() === '') return '<br>';
        const escaped = escapeHtml(line);
        const withSpaces = escaped.replace(/ {2,}/g, (match) => '&nbsp;'.repeat(match.length));
        return `<span style="color: ${seg.color}">${withSpaces}</span>`;
      }).join('<br>');
    }).join('');
  };

  const handleSave = async () => {
    if (block.block_type === "text" || block.block_type === "text_image") {
      const finalSegments = currentText.trim() 
        ? [...segments, { text: currentText, color: currentColor }]
        : segments;

      if (finalSegments.length === 0) {
        alert("내용을 입력하세요.");
        return;
      }

      setSaving(true);
      try {
        const htmlContent = segmentsToHtml(finalSegments);

        const res = await fetch(`/api/blocks/${block.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text_content: htmlContent }),
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
              Edit block
            </h3>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
              Type: {block.block_type}
            </div>
          </div>

          {(block.block_type === "text" || block.block_type === "text_image") && (
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

              {/* 기존 세그먼트 */}
              {segments.length > 0 && (
                <div>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
                    Segments ({segments.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {segments.map((seg, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "10px",
                          backgroundColor: "#f9f9f9",
                          borderRadius: "3px"
                        }}
                      >
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "6px"
                        }}>
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
                          <span style={{ fontSize: "11px", color: "#999", fontFamily: "monospace" }}>
                            {seg.color}
                          </span>
                          <button
                            onClick={() => removeSegment(idx)}
                            style={{
                              marginLeft: "auto",
                              padding: "2px 6px",
                              backgroundColor: "#e53e3e",
                              color: "white",
                              border: "none",
                              borderRadius: "2px",
                              cursor: "pointer",
                              fontSize: "11px"
                            }}
                          >
                            ×
                          </button>
                        </div>
                        <textarea
                          value={seg.text}
                          onChange={(e) => updateSegment(idx, e.target.value)}
                          rows={2}
                          style={{
                            width: "100%",
                            padding: "6px",
                            border: "1px solid #ddd",
                            borderRadius: "3px",
                            fontSize: "13px",
                            fontFamily: "inherit",
                            lineHeight: "1.5",
                            color: seg.color,
                            resize: "vertical"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 새 세그먼트 추가 */}
              <div>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Add new</div>
                <textarea
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  rows={3}
                  placeholder="Type here..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "3px",
                    fontSize: "13px",
                    resize: "vertical",
                    fontFamily: "inherit",
                    lineHeight: "1.5",
                    color: currentColor,
                    marginBottom: "6px"
                  }}
                />
                <button
                  onClick={addSegment}
                  disabled={!currentText.trim()}
                  style={{
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
            </div>
          )}

          {block.block_type === "text_image" && block.image_url && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Current image</div>
              <img
                src={block.image_url}
                alt=""
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "200px",
                  border: "1px solid #ddd",
                  borderRadius: "3px",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {block.block_type === "image" && (
            <div>
              <p style={{ color: "#666", marginBottom: "12px", fontSize: "13px" }}>
                Image blocks cannot be edited.
              </p>
              {block.image_url && (
                <img
                  src={block.image_url}
                  alt=""
                  style={{ 
                    maxWidth: "100%", 
                    border: "1px solid #ddd",
                    borderRadius: "3px",
                  }}
                />
              )}
            </div>
          )}

          {block.block_type === "patterned" && (
            <div>
              <p style={{ color: "#666", fontSize: "13px", marginBottom: "12px" }}>
                Gallery blocks cannot be edited.
              </p>
              {Array.isArray(block.images) && block.images.length > 0 && (
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", 
                  gap: "6px",
                }}>
                  {block.images.slice(0, 6).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      style={{ 
                        width: "100%", 
                        height: "80px",
                        objectFit: "cover",
                        border: "1px solid #ddd",
                        borderRadius: "3px",
                      }}
                    />
                  ))}
                  {block.images.length > 6 && (
                    <div style={{
                      width: "100%",
                      height: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px dashed #ddd",
                      borderRadius: "3px",
                      backgroundColor: "#f9f9f9",
                      color: "#999",
                      fontSize: "12px",
                    }}>
                      +{block.images.length - 6}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div style={{ display: "flex", gap: "8px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e5e5e5" }}>
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
              disabled={saving || block.block_type === "patterned" || block.block_type === "image"}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "3px",
                backgroundColor: 
                  saving || block.block_type === "patterned" || block.block_type === "image" 
                    ? "#ddd" 
                    : "#111",
                color: "white",
                cursor: 
                  saving || block.block_type === "patterned" || block.block_type === "image"
                    ? "not-allowed" 
                    : "pointer",
                fontSize: "14px"
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    ) : null;
}