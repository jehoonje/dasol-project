"use client";

import { ReactNode } from "react";

export default function Modal({
  open,
  title,
  onClose,
  children,
  actions,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">{title}</div>
        <div>{children}</div>
        <div className="modal-actions">
          {actions}
          <button className="button" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}
