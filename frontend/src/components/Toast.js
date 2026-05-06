import { useEffect, useState } from 'react';

const icons = {
  success: '✅',
  error:   '⚠️',
  info:    'ℹ️',
  warning: '🔔',
};

const barColors = {
  success: '#10b981',
  error:   '#ef4444',
  info:    '#3b82f6',
  warning: '#f59e0b',
};

/**
 * Single toast item — handles its own enter/exit animation.
 */
const ToastItem = ({ id, message, type = 'success', duration = 3000, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger enter animation on next tick
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Progress bar countdown
    const step = 100 / (duration / 50);
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) { clearInterval(progressTimer); return 0; }
        return p - step;
      });
    }, 50);

    // Exit animation then remove
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(id), 350);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearInterval(progressTimer);
    };
  }, [id, duration, onRemove]);

  const containerCls = {
    success: 'bg-white border-emerald-200 shadow-emerald-100',
    error:   'bg-white border-red-200   shadow-red-100',
    info:    'bg-white border-blue-200  shadow-blue-100',
    warning: 'bg-white border-amber-200 shadow-amber-100',
  }[type] || 'bg-white border-gray-200';

  const textCls = {
    success: 'text-emerald-800',
    error:   'text-red-800',
    info:    'text-blue-800',
    warning: 'text-amber-800',
  }[type] || 'text-gray-800';

  return (
    <div
      className={`toast-item relative overflow-hidden flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg min-w-[280px] max-w-[360px] ${containerCls}`}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateX(0) scale(1)' : 'translateX(60px) scale(0.95)',
        transition: 'opacity 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Icon */}
      <span className="text-lg flex-shrink-0 mt-0.5">{icons[type]}</span>

      {/* Message */}
      <p className={`text-sm font-medium leading-snug flex-1 ${textCls}`}>{message}</p>

      {/* Close button */}
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 350); }}
        className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 text-base leading-none mt-0.5"
      >
        ×
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 rounded-full transition-none"
        style={{
          width: `${progress}%`,
          backgroundColor: barColors[type],
          transition: 'width 50ms linear',
        }}
      />
    </div>
  );
};

/**
 * Toast container — renders a stack of toasts in the top-right corner.
 * Usage: pass `toasts` array and `removeToast` fn from useToast().
 */
export const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};

/**
 * Hook — returns { toasts, toast, removeToast }
 * toast.success(msg) / toast.error(msg) / toast.info(msg) / toast.warning(msg)
 */
let _id = 0;
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const toast = {
    success: (msg, dur)  => addToast(msg, 'success', dur),
    error:   (msg, dur)  => addToast(msg, 'error',   dur),
    info:    (msg, dur)  => addToast(msg, 'info',    dur),
    warning: (msg, dur)  => addToast(msg, 'warning', dur),
  };

  return { toasts, toast, removeToast };
};

export default ToastContainer;
