"use client";

/**
 * 전체 화면 오버레이에 중앙 배치, 최대 95vw/95vh로 확대
 * 바깥(백드롭) 클릭 시 닫힘
 */
export default function ImageModal({
  open,
  src,
  alt,
  onClose,
}: {
  open: boolean;
  src: string | null;
  alt?: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? "preview"}
          style={{
            maxWidth: "95vw",
            maxHeight: "95vh",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          style={{ background: "#fff", color: "#333", padding: 16 }}
          onClick={(e) => e.stopPropagation()}
        >
          이미지가 없습니다.
        </div>
      )}
    </div>
  );
}
