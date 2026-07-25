'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'border-line-strong bg-bg grid size-5 shrink-0 place-items-center rounded-sm border',
        'transition-colors duration-150',
        'hover:border-fg-subtle',
        'data-[state=checked]:border-fg data-[state=checked]:bg-accent data-[state=checked]:text-fg-onaccent',
        'data-[state=indeterminate]:border-fg data-[state=indeterminate]:bg-accent data-[state=indeterminate]:text-fg-onaccent',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        {props.checked === 'indeterminate' ? (
          <Minus size={12} strokeWidth={3} />
        ) : (
          <Check size={12} strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

export interface CheckboxFieldProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** 체크박스 오른쪽 라벨. 라벨 전체가 클릭 영역이 된다. */
  children: React.ReactNode;
  /** 라벨 아래 보조 설명 */
  description?: React.ReactNode;
  /** 오른쪽 끝 보조 액션 (예: '전문 보기') */
  action?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 라벨이 붙은 체크박스 한 줄. 약관 동의에 쓴다.
 *
 * 라벨 전체를 <label>로 감싸서 탭 영역을 넓힌다. 모바일에서 5px짜리 체크박스만
 * 눌러야 하면 동의 단계에서 이탈이 생긴다.
 */
export function CheckboxField({
  id,
  checked,
  onCheckedChange,
  children,
  description,
  action,
  required,
  disabled,
  className,
}: CheckboxFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <Checkbox
        id={inputId}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange?.(value === true)}
        disabled={disabled}
        required={required}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={inputId}
          className={cn(
            'text-fg block cursor-pointer text-sm leading-snug select-none',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          {children}
          {required && <span className="text-fg-subtle ml-1">(필수)</span>}
        </label>
        {description && (
          <p className="text-fg-muted mt-1 text-[0.8125rem] leading-snug">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
