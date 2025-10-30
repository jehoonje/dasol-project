"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function AnimatedImageModal({
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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.8)" }}
          role="dialog"
          aria-modal="true"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
        >
          {src ? (
            <motion.img
              key={src}
              src={src}
              alt={alt ?? "이미지 미리보기"}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } }}
              style={{
                maxWidth: "95vw",
                maxHeight: "95vh",
                display: "block",
              }}
            />
          ) : (
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
              style={{ background: "#fff", color: "#333", padding: 16}}
            >
              이미지가 없습니다.
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
