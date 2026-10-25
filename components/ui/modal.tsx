"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[min(1100px,calc(100vw-2rem))]",
};

const modalStack: string[] = [];

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  size?: keyof typeof sizes;
  zIndex?: number;
  className?: string;
  closeLabel?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  headerActions,
  size = "md",
  zIndex = 100,
  className,
  closeLabel = "Close",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    modalStack.push(titleId);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && modalStack[modalStack.length - 1] === titleId) {
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => {
      const focusable =
        panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") ??
        panelRef.current?.querySelector<HTMLElement>(
          "input, textarea, select, button, [href], [tabindex]:not([tabindex='-1'])",
        );
      focusable?.focus();
    }, 30);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKeyDown);
      const stackIndex = modalStack.lastIndexOf(titleId);
      if (stackIndex >= 0) modalStack.splice(stackIndex, 1);
      window.clearTimeout(timer);
    };
  }, [open, titleId]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      style={{ zIndex }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "max-h-[92vh] w-full overflow-hidden rounded-t-3xl border border-white/20 bg-white shadow-2xl animate-slide-up sm:rounded-3xl",
          sizes[size],
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-5 border-b border-line px-6 py-5">
            <div className="min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg font-semibold tracking-tight text-ink"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm leading-relaxed text-slate-500"
                >
                  {description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {headerActions}
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        <div className="max-h-[calc(92vh-9.5rem)] overflow-y-auto scrollbar-thin">
          {children}
        </div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-slate-50/70 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
