"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, title, onClose, children, actions }: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  if (!open || !mounted) return null;

  // document.body로 모달을 이동시켜 렌더링합니다.
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">{title}</div>
        <div>{children}</div>
        <div className="modal-actions">
          {actions}
          <button className="button" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>,
    document.body
  );
}