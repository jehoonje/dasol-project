"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/useAuthStore"; // 💡 Zustand 스토어 임포트 추가

export default function ContactPage() {
  // 💡 하드코딩된 true를 지우고, 실제 로그인(owner) 상태를 가져옵니다.
  const isOwner = useAuthStore((state) => state.isOwner); 

  // 연락처 정보 상태 (수정 모드용)
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contactData, setContactData] = useState({
    id: null,
    email: "",
    instagram_url: "",
  });

  // 이메일 발송 폼 상태
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // 초기 연락처 데이터 불러오기 (DB 연동)
  useEffect(() => {
    async function fetchContact() {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        if (data && !data.error) {
          setContactData({
            id: data.id,
            email: data.email,
            instagram_url: data.instagram_url,
          });
        }
      } catch (error) {
        console.error("연락처 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContact();
  }, []);

  // 연락처 저장 처리 (수정 모드 완료 시)
  const handleSaveContact = async () => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        alert("성공적으로 저장되었습니다.");
        if (!contactData.id && result.data?.id) {
          setContactData((prev) => ({ ...prev, id: result.data.id }));
        }
        setIsEditing(false);
      } else {
        alert(result.error || "저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장 에러:", error);
      alert("오류가 발생했습니다.");
    }
  };

  // ⭐️ 이메일 발송 폼 제출 처리
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderEmail || !message) {
      alert("이메일과 메시지를 모두 입력해 주세요.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: senderEmail, message }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        alert("메시지가 성공적으로 전송되었습니다!");
        setSenderEmail(""); // 폼 초기화
        setMessage("");
      } else {
        alert(result.error || "메시지 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("발송 에러:", error);
      alert("전송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  // 로딩 중일 때 중앙 스피너 표시
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <svg width="50" height="50" viewBox="0 0 50 50">
          <circle 
            cx="25" cy="25" r="20" 
            fill="none" stroke="#dadada" strokeWidth="4" 
            strokeDasharray="31.4 31.4" strokeDashoffset="0"
          >
            <animateTransform 
              attributeName="transform" type="rotate" 
              from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" 
            />
          </circle>
        </svg>
      </div>
    );
  }

  return (
    <div className="container-90" style={{ paddingTop: "80px" }}>
      <section className="page-section">
        
        {/* 헤더 및 수정 버튼 영역 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Contact</h1>
          {/* 💡 isOwner가 true일 때만 수정 버튼이 렌더링됩니다. */}
          {isOwner && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              style={{ 
                padding: "8px 20px", cursor: "pointer", backgroundColor: "#000", 
                color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold" 
              }}
            >
              내용 수정하기
            </button>
          )}
        </div>

        {/* 연락처 표시 영역 */}
        <div className="card vstack gap-2" style={{ marginTop: "16px" }}>
          <p className="muted">
            문의는 아래 연락처로 보내 주세요. 간단한 메모를 남기실 수도 있습니다.
          </p>

          {isEditing ? (
            <div className="vstack gap-2" style={{ marginTop: "16px" }}>
              <label className="vstack gap-2">
                <strong>Email</strong>
                <input
                  className="input"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                />
              </label>
              
              <label className="vstack gap-2" style={{ marginTop: "12px" }}>
                <strong>Instagram URL</strong>
                <input
                  className="input"
                  type="text"
                  value={contactData.instagram_url}
                  onChange={(e) => setContactData({ ...contactData, instagram_url: e.target.value })}
                />
              </label>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button 
                  onClick={handleSaveContact} 
                  style={{ 
                    cursor: "pointer", backgroundColor: "#0070f3", color: "white", 
                    padding: "10px 24px", border: "none", borderRadius: "8px", fontWeight: "bold" 
                  }}
                >
                  저장 완료
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  style={{ 
                    cursor: "pointer", backgroundColor: "transparent", color: "#666", 
                    padding: "10px 24px", border: "1px solid #ccc", borderRadius: "8px", fontWeight: "bold" 
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div><strong>Email</strong></div>
                <a href={`mailto:${contactData.email}`}>{contactData.email}</a>
              </div>

              <div>
                <div><strong>Instagram</strong></div>
                <a href={contactData.instagram_url} target="_blank" rel="noreferrer">
                  {contactData.instagram_url}
                </a>
              </div>
            </>
          )}
        </div>

        {/* 이메일 발송 폼 영역 */}
        <div className="card" style={{ marginTop: 24 }}>
          <form className="vstack gap-2" onSubmit={handleSendEmail}>
            <label className="vstack gap-2">
              <span>Your email</span>
              <input 
                className="input" 
                type="email" 
                placeholder="you@example.com" 
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                required
              />
            </label>
            <label className="vstack gap-2">
              <span>Message</span>
              <textarea 
                className="input" 
                rows={5} 
                placeholder="메시지를 입력하세요" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </label>
            <button 
              className="button" 
              type="submit" 
              disabled={isSending}
              style={{
                marginTop: "12px",
                opacity: isSending ? 0.7 : 1,
                cursor: isSending ? "not-allowed" : "pointer"
              }}
            >
              {isSending ? "발송 중..." : "메시지 보내기"}
            </button>
          </form>
        </div>

      </section>
    </div>
  );
}