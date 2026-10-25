"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn, uid } from "@/lib/utils";

export type ToastTone = "success" | "info" | "warning" | "error";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { icon: typeof Info; className: string }> = {
  success: {
    icon: CheckCircle2,
    className: "border-teal-200 bg-white text-ink",
  },
  info: {
    icon: Info,
    className: "border-brand-200 bg-white text-ink",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-gold-200 bg-white text-ink",
  },
  error: {
    icon: XCircle,
    className: "border-red-200 bg-white text-ink",
  },
};

const iconStyles: Record<ToastTone, string> = {
  success: "text-teal-600 bg-teal-50",
  info: "text-brand-600 bg-brand-50",
  warning: "text-gold-600 bg-gold-50",
  error: "text-red-600 bg-red-50",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = uid("toast");
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
      const timer = setTimeout(() => dismiss(id), 3800);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-5 right-5 z-[120] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2 sm:bottom-7 sm:right-7"
      >
        {toasts.map((item) => {
          const tone = toneStyles[item.tone];
          const Icon = tone.icon;
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-lift animate-slide-up",
                tone.className,
              )}
              role="status"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  iconStyles[item.tone],
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="flex-1 pt-1 text-sm font-medium leading-snug">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
