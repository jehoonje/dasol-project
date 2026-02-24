// app/about/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AboutEditModal from "@/components/AboutEditModal";

type AboutData = {
  id: string | null;
  content: string;
  image_url: string | null;
};

export default function AboutPage() {
  const isOwner = useAuthStore((state) => state.isOwner);
  const [aboutData, setAboutData] = useState<AboutData>({
    id: null,
    content: '',
    image_url: null
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAboutData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/about');
      if (res.ok) {
        const data = await res.json();
        setAboutData(data);
      }
    } catch (error) {
      console.error('About 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAboutData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        paddingTop: "80px",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "80px 5% 0 5%"
      }}>
        <section className="page-section">
        </section>
      </div>
    );
  }

  return (
    <div style={{ 
      paddingTop: "80px", 
      position: "relative",
      maxWidth: "800px", // 원하는 너비로 조정 (600px, 700px, 800px 등)
      margin: "0 auto",
      padding: "80px 5% 0 5%"
    }}>
      {/* Owner 전용 수정 버튼 */}
      {isOwner && (
        <button
          onClick={() => setShowEditModal(true)}
          style={{
            position: "fixed",
            top: "80px",
            right: "5%",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
          }}
          title="수정"
        >
          ✎
        </button>
      )}

      <section className="page-section">
        <div className="card">
          {/* 이미지가 있으면 표시 */}
          {aboutData.image_url && (
            <div style={{ marginBottom: "40px" }}>
              <img
                src={aboutData.image_url}
                alt="About"
                style={{
                  width: "70%",
                  margin: "0 auto",  
                  maxHeight: "400px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            </div>
          )}

          {/* HTML 콘텐츠 렌더링 */}
          {aboutData.content ? (
            <div
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: aboutData.content }}
            />
          ) : (
            <div>
              <p className="muted">
                미니멀한 사진 포트폴리오 사이트입니다. 90년대 HTML 느낌의
                모노톤 스타일을 지향합니다.
              </p>
              <p>
                Articles 섹션에서는 대표 이미지가 포함된 글 목록을 확인하고,
                상세 페이지에서 텍스트/이미지 블록을 스택해 콘텐츠를 구성할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {showEditModal && (
        <AboutEditModal
          currentId={aboutData.id}
          currentContent={aboutData.content}
          currentImageUrl={aboutData.image_url}
          onClose={() => setShowEditModal(false)}
          onUpdated={loadAboutData}
        />
      )}
    </div>
  );
}