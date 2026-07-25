'use client';

import { AlertCircle, Check, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

/* ---------------------------------------------------------------------------
 * Toast — 짧은 결과 알림.
 *
 * 무채색이라 성공/실패를 색으로 구분할 수 없다. 아이콘과 문구로 구분하고,
 * 실패만 유채색(danger)을 허용한다 — 놓치면 안 되는 정보이기 때문이다.
 *
 * role은 종류에 따라 다르게 준다: 성공은 status(방해하지 않음), 실패는 alert
 * (스크린리더가 즉시 읽음).
 * ------------------------------------------------------------------------- */

export type ToastTone = 'success' | 'error' | 'neutral';

export interface ToastItem {
  id: string;
  message: React.ReactNode;
  tone: ToastTone;
  /** 표시 시간(ms). 0이면 자동으로 닫히지 않는다. */
  duration: number;
}

interface ToastContextValue {
  toast: (message: React.ReactNode, options?: { tone?: ToastTone; duration?: number }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast는 <ToastProvider> 안에서만 쓸 수 있습니다.');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const timersRef = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const counterRef = React.useRef(0);

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast = React.useCallback<ToastContextValue['toast']>(
    (message, options) => {
      const tone = options?.tone ?? 'neutral';
      // 실패는 사용자가 읽고 조치해야 하므로 기본 표시 시간을 더 길게 잡는다.
      const duration = options?.duration ?? (tone === 'error' ? 5000 : 3000);
      // Math.random 대신 단조 증가 카운터 — 같은 틱에 여러 개 띄워도 id가 겹치지 않는다.
      const id = `toast-${++counterRef.current}`;

      setItems((prev) => [...prev, { id, message, tone, duration }]);

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss],
  );

  // 언마운트 시 남은 타이머 정리
  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        // 하단 중앙. 모바일에서 상단은 노치·주소창과 겹친다.
        className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'animate-slide-up pointer-events-auto flex w-full max-w-sm items-start gap-2.5',
              'rounded-lg border px-4 py-3 shadow-lg',
              item.tone === 'error'
                ? 'border-danger-border bg-danger-bg text-danger'
                : 'border-line bg-fg text-bg',
            )}
          >
            <span className="mt-0.5 shrink-0">
              {item.tone === 'success' && <Check size={16} strokeWidth={2.5} />}
              {item.tone === 'error' && <AlertCircle size={16} strokeWidth={2.5} />}
            </span>
            <span className="min-w-0 flex-1 text-sm leading-snug font-medium">{item.message}</span>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="알림 닫기"
              className="-mr-1 shrink-0 rounded-sm p-0.5 opacity-60 transition-opacity hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
