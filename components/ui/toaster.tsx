"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToasterContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

/* ─── Context ────────────────────────────────────────────────────────────── */
const ToasterContext = createContext<ToasterContextValue>({
  toast: () => {},
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToasterContext);
}

/* ─── Icons per type ─────────────────────────────────────────────────────── */
const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
};

const borderColors: Record<ToastType, string> = {
  success: "border-green-500/30",
  error: "border-red-500/30",
  info: "border-blue-500/30",
  warning: "border-yellow-500/30",
};

/* ─── Provider + Toaster ─────────────────────────────────────────────────── */
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 4000;
    setToasts((prev) => [...prev, { ...opts, id }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  // Expose toast globally so it can be called outside React tree
  useEffect(() => {
    (window as typeof window & { __toast?: typeof toast }).__toast = toast;
  }, [toast]);

  return (
    <ToasterContext.Provider value={{ toast, dismiss }}>
      {/* Portal-style fixed container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`pointer-events-auto glass-strong rounded-2xl border p-4 shadow-2xl flex items-start gap-3 ${
                borderColors[t.type ?? "info"]
              }`}
            >
              {icons[t.type ?? "info"]}
              <div className="flex-1 min-w-0">
                {t.title && (
                  <p className="text-white font-semibold text-sm leading-tight">{t.title}</p>
                )}
                {t.description && (
                  <p className="text-slate-400 text-sm mt-0.5 leading-snug">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-slate-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToasterContext.Provider>
  );
}
