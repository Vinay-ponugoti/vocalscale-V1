import React, { useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { ToastContext, type Toast } from './ToastContext';
import { useToast } from '../hooks/useToast';

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type, duration };

    setToasts(prev => {
      // Prevent exact duplicate messages from appearing multiple times simultaneously
      const isDuplicate = prev.some(t => t.message === message);
      if (isDuplicate) return prev;
      // Limit total toasts to 3
      const nextToasts = [...prev, newToast];
      if (nextToasts.length > 3) {
        return nextToasts.slice(1);
      }
      return nextToasts;
    });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const config = {
    success: {
      bg: 'bg-white',
      border: 'border-emerald-100',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      glow: 'shadow-[0_8px_24px_-4px_rgba(16,185,129,0.12)]',
      progress: 'bg-emerald-500'
    },
    error: {
      bg: 'bg-white',
      border: 'border-rose-100',
      icon: <XCircle className="w-5 h-5 text-rose-500" />,
      glow: 'shadow-[0_8px_24px_-4px_rgba(244,63,94,0.12)]',
      progress: 'bg-rose-500'
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-100',
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
      glow: 'shadow-[0_8px_24px_-4px_rgba(245,158,11,0.12)]',
      progress: 'bg-amber-500'
    },
    info: {
      bg: 'bg-white',
      border: 'border-blue-100',
      icon: <Info className="w-5 h-5 text-blue-500" />,
      glow: 'shadow-[0_8px_24px_-4px_rgba(59,130,246,0.12)]',
      progress: 'bg-blue-500'
    }
  };

  const style = config[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(12px)', transition: { duration: 0.2 } }}
      className="pointer-events-auto"
    >
      <div className={`relative overflow-hidden flex items-center gap-4 px-5 py-4 rounded-[1.25rem] border ${style.bg} ${style.border} ${style.glow} group transition-all duration-300 hover:scale-[1.02]`}>
        {/* Subtle Background Glow */}
        <div className={`absolute inset-0 opacity-[0.03] ${style.progress} pointer-events-none`} />

        <div className="shrink-0 relative">
          <div className="absolute inset-0 blur-md opacity-20 bg-current scale-150" />
          {style.icon}
        </div>

        <div className="flex-1">
          <p className="text-[14px] font-bold text-slate-900 tracking-tight leading-snug">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-slate-900 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Bar Timer */}
        {toast.duration && toast.duration > 0 && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: toast.duration / 1000, ease: "linear" }}
            className={`absolute bottom-0 left-0 right-0 h-[3px] origin-left ${style.progress} opacity-40`}
          />
        )}
      </div>
    </motion.div>
  );
};
