import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/cn';

/* ---------------------------------------------------------------------------
 * Badge — 무채색만으로 상태를 구분한다.
 *
 * 예약 상태(대기 / 입금확인대기 / 확정 / 무응답 / 취소)를 색으로 구분하면 흑백 기반
 * 디자인이 깨지고, 색약 사용자에게도 안 읽힌다. 대신 세 가지를 조합한다.
 *   1) 채움 강도 — 확정은 꽉 찬 검정, 대기는 옅은 회색
 *   2) 테두리 스타일 — 무응답은 점선(=미완결이라는 시각적 은유)
 *   3) 앞머리 점(dot) — 채움 여부가 한 번 더 반복된다
 * 어느 하나만으로 판단하게 만들지 않는 것이 핵심이다.
 * ------------------------------------------------------------------------- */

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium',
  {
    variants: {
      tone: {
        /** 가장 강함. 완료·확정 상태. */
        solid: 'bg-accent text-fg-onaccent',
        /** 중간. 사용자 행동을 기다리는 진행 중 상태. */
        outline: 'border border-fg text-fg',
        /** 약함. 초기·중립 상태. */
        muted: 'bg-surface-strong text-fg-muted',
        /** 미완결. 자동 만료처럼 흐지부지 끝난 상태. */
        dashed: 'border border-dashed border-line-strong text-fg-subtle',
        /** 가장 약함. 종료되어 더 볼 필요 없는 상태. */
        subtle: 'bg-surface text-fg-subtle line-through decoration-line-strong',
        /** 차단·블랙리스트 등 경고. */
        danger: 'border border-danger-border bg-danger-bg text-danger',
      },
      size: {
        sm: 'h-5 px-2 text-[0.6875rem]',
        md: 'h-6 px-2.5 text-xs',
      },
    },
    defaultVariants: { tone: 'muted', size: 'md' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** 앞머리 점 표시. 상태 배지에는 켜두는 게 좋다. */
  dot?: boolean;
}

export function Badge({ className, tone, size, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {dot && (
        <span
          aria-hidden
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            tone === 'solid' && 'bg-fg-onaccent',
            tone === 'outline' && 'bg-fg',
            tone === 'muted' && 'bg-fg-subtle',
            tone === 'dashed' && 'border-line-strong border bg-transparent',
            tone === 'subtle' && 'bg-line-strong',
            tone === 'danger' && 'bg-danger',
          )}
        />
      )}
      {children}
    </span>
  );
}

export { badgeVariants };
