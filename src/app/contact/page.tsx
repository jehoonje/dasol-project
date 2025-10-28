"use client";

export default function ContactPage() {
  return (
    <div className="container-60">
      <section className="page-section">
        <h1>Contact</h1>

        <div className="card vstack gap-2">
          <p className="muted">
            문의는 아래 연락처로 보내 주세요. 간단한 메모를 남기실 수도 있습니다.
          </p>

          <div>
            <div><strong>Email</strong></div>
            <a href="mailto:hello@example.com">hello@example.com</a>
          </div>

          <div>
            <div><strong>Instagram</strong></div>
            <a href="https://instagram.com/" target="_blank" rel="noreferrer">instagram.com/</a>
          </div>
        </div>

        {/* 간단 메모 폼 (동작은 하지 않으며, 디자인 용도) */}
        <div className="card" style={{ marginTop: 24 }}>
          <form className="vstack gap-2" onSubmit={(e) => e.preventDefault()}>
            <label className="vstack gap-2">
              <span>Your email</span>
              <input className="input" type="email" placeholder="you@example.com" />
            </label>
            <label className="vstack gap-2">
              <span>Message</span>
              <textarea className="input" rows={5} placeholder="메시지를 입력하세요" />
            </label>
            <button className="button" type="submit" title="disabled">
              Send (demo)
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
