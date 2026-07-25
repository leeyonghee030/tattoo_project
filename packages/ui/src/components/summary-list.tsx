'use client';

import { Check, Copy, Pencil } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

/* ---------------------------------------------------------------------------
 * SummaryList — 제출 직전 "지금까지 고른 것" 확인 목록.
 *
 * 8단계를 거친 사용자는 자기가 뭘 골랐는지 잊는다. 마지막에 전부 나열하고 각 항목에
 * 수정 버튼을 달아 해당 단계로 되돌릴 수 있게 하면, 처음부터 다시 하지 않아도 된다.
 * 이게 없으면 사용자는 실수를 발견했을 때 흐름을 버린다.
 * ------------------------------------------------------------------------- */

export interface SummaryItemProps {
  label: string;
  value: React.ReactNode;
  /** 값이 없을 때 표시할 문구 */
  placeholder?: string;
  /** 수정 버튼을 누르면 해당 단계로 이동한다. */
  onEdit?: () => void;
}

export function SummaryItem({ label, value, placeholder = '미선택', onEdit }: SummaryItemProps) {
  const isEmpty = value === null || value === undefined || value === '';

  return (
    <div className="flex items-baseline gap-3 py-3">
      <dt className="text-fg-muted w-20 shrink-0 text-[0.8125rem]">{label}</dt>
      <dd className="text-fg min-w-0 flex-1 text-sm font-medium break-words">
        {isEmpty ? <span className="text-fg-subtle">{placeholder}</span> : value}
      </dd>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-1',
            'text-fg-muted hover:bg-surface hover:text-fg text-xs transition-colors',
          )}
        >
          <Pencil size={12} />
          수정
        </button>
      )}
    </div>
  );
}

export function SummaryList({ className, ...props }: React.HTMLAttributes<HTMLDListElement>) {
  return <dl className={cn('divide-line divide-y', className)} {...props} />;
}

/* ---------------------------------------------------------------------------
 * CopyField — 예약번호처럼 "받아서 다른 데 붙여야 하는" 값.
 *
 * README 시나리오상 고객은 예약번호를 카톡/라인 채널로 보내야 한다. 손으로 옮겨
 * 적게 하면 오타가 나고 그건 곧 문의로 돌아온다. 복사 버튼과 복사 완료 피드백이
 * 반드시 있어야 한다.
 * ------------------------------------------------------------------------- */

export interface CopyFieldProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyField({ value, label, className }: CopyFieldProps) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // 언마운트 시 타이머를 정리하지 않으면 사라진 컴포넌트에 setState가 호출된다.
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard 권한이 없거나 http 환경이면 실패한다. 값 자체는 화면에 보이므로
      // 사용자가 직접 선택해 복사할 수 있다 — 조용히 넘긴다.
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <span className="text-fg-muted text-[0.8125rem]">{label}</span>}
      <div className="border-line bg-surface flex items-center gap-2 rounded-lg border p-3 pl-4">
        <span
          className="text-fg min-w-0 flex-1 truncate font-mono text-[0.9375rem] font-semibold tracking-wide"
          data-numeric
        >
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5',
            'text-xs font-semibold transition-colors duration-150',
            copied
              ? 'bg-accent text-fg-onaccent'
              : 'bg-bg text-fg-muted hover:text-fg border-line border',
          )}
          aria-live="polite"
        >
          {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
    </div>
  );
}
