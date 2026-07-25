'use client';

import * as React from 'react';

import { cn } from '../lib/cn';

/* ---------------------------------------------------------------------------
 * Field — 라벨 · 입력 · 도움말 · 에러를 한 묶음으로 연결한다.
 *
 * 직접 aria-describedby를 매번 배선하면 빠뜨리기 쉬워서, Context로 id를 내려주고
 * Input/Textarea/Select가 자동으로 집어가게 했다.
 * ------------------------------------------------------------------------- */

interface FieldContextValue {
  inputId: string;
  descriptionId: string;
  errorId: string;
  hasError: boolean;
  hasDescription: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useFieldContext() {
  return React.useContext(FieldContext);
}

/** Field 안의 입력 요소가 붙여야 할 aria 속성을 계산해 준다. */
function useFieldAria() {
  const ctx = useFieldContext();
  if (!ctx) return {};
  const describedBy =
    [ctx.hasDescription ? ctx.descriptionId : null, ctx.hasError ? ctx.errorId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return {
    id: ctx.inputId,
    'aria-describedby': describedBy,
    'aria-invalid': ctx.hasError || undefined,
  } as const;
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  /** 입력 아래 회색 보조 설명 */
  description?: React.ReactNode;
  /** 값이 있으면 에러 상태가 되고 description 대신 노출된다 */
  error?: React.ReactNode;
  /** 라벨 옆 '필수' 표시 */
  required?: boolean;
  /** 라벨 오른쪽 끝에 붙는 보조 요소 (예: '아이디 찾기' 링크) */
  action?: React.ReactNode;
}

export function Field({
  label,
  description,
  error,
  required,
  action,
  className,
  children,
  ...props
}: FieldProps) {
  const generatedId = React.useId();
  const ctx: FieldContextValue = {
    inputId: `${generatedId}-input`,
    descriptionId: `${generatedId}-description`,
    errorId: `${generatedId}-error`,
    hasError: Boolean(error),
    hasDescription: Boolean(description),
  };

  return (
    <FieldContext.Provider value={ctx}>
      <div className={cn('flex flex-col gap-2', className)} {...props}>
        {(label || action) && (
          <div className="flex items-baseline justify-between gap-3">
            {label && (
              <label htmlFor={ctx.inputId} className="text-fg text-sm font-medium">
                {label}
                {required && (
                  <span className="text-fg-subtle ml-1" aria-hidden>
                    *
                  </span>
                )}
                {required && <span className="sr-only">(필수)</span>}
              </label>
            )}
            {action}
          </div>
        )}

        {children}

        {/* 에러가 있으면 에러만 보여준다. 둘 다 띄우면 읽는 순서가 흐트러진다. */}
        {error ? (
          <p id={ctx.errorId} role="alert" className="text-danger text-[0.8125rem] leading-snug">
            {error}
          </p>
        ) : description ? (
          <p id={ctx.descriptionId} className="text-fg-muted text-[0.8125rem] leading-snug">
            {description}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

/* ── Input ──────────────────────────────────────────────── */

const inputBase = [
  'w-full bg-bg text-fg',
  'border border-line rounded-md',
  'transition-colors duration-150 ease-out-quint',
  'placeholder:text-fg-subtle',
  'hover:border-line-strong',
  // 포커스 시 테두리를 검게 + 안쪽 링 1px으로 두께감. 무채색에서 대비를 확보하는 방법.
  'focus:border-fg focus:outline-none focus:ring-1 focus:ring-fg',
  'disabled:bg-surface-strong disabled:text-fg-subtle disabled:cursor-not-allowed',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger',
].join(' ');

// 'prefix'는 네이티브 HTML 속성(string)과 충돌하므로 제외하고 ReactNode로 다시 정의한다.
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  /** 왼쪽 고정 접두 요소 (예: 검색 아이콘) */
  prefix?: React.ReactNode;
  /** 오른쪽 고정 접미 요소 (예: 단위 'cm', 지우기 버튼) */
  suffix?: React.ReactNode;
  sizeVariant?: 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, prefix, suffix, sizeVariant = 'lg', ...props },
  ref,
) {
  const aria = useFieldAria();
  const height = sizeVariant === 'lg' ? 'h-12' : 'h-10';
  const text = sizeVariant === 'lg' ? 'text-[0.9375rem]' : 'text-sm';

  if (prefix || suffix) {
    return (
      <div
        className={cn(
          inputBase,
          height,
          'flex items-center gap-2 px-3.5',
          'focus-within:border-fg focus-within:ring-fg focus-within:ring-1',
          className,
        )}
        // 래퍼가 포커스 링을 담당하므로 내부 input의 링은 끈다
        data-slot="input-wrapper"
      >
        {prefix && <span className="text-fg-subtle shrink-0">{prefix}</span>}
        <input
          ref={ref}
          className={cn(
            'placeholder:text-fg-subtle min-w-0 flex-1 bg-transparent outline-none',
            text,
          )}
          {...aria}
          {...props}
        />
        {suffix && <span className="text-fg-muted shrink-0">{suffix}</span>}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      className={cn(inputBase, height, text, 'px-3.5', className)}
      {...aria}
      {...props}
    />
  );
});

/* ── Textarea ───────────────────────────────────────────── */

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  const aria = useFieldAria();
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(inputBase, 'resize-y px-3.5 py-3 text-[0.9375rem] leading-relaxed', className)}
      {...aria}
      {...props}
    />
  );
});

export { inputBase, useFieldAria };
