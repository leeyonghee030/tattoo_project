'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/cn';
import { Spinner } from './spinner';

const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-2',
    'font-semibold whitespace-nowrap select-none tap-highlight-none',
    'transition-[background-color,color,border-color,transform,opacity]',
    'duration-150 ease-out-quint',
    // 누를 때 살짝 눌리는 느낌. 토스식 촉감의 핵심이고, 이동이 아니라 축소여야 한다.
    'active:scale-[0.975]',
    'disabled:pointer-events-none disabled:opacity-40',
    // 로딩 중 중복 클릭 차단. aria-busy는 Tailwind 기본 variant가 아니라 임의값으로 쓴다.
    'aria-[busy=true]:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        /** 화면당 하나. 주 행동. */
        primary: 'bg-accent text-fg-onaccent hover:bg-accent-hover active:bg-accent-active',
        /** 보조 행동. 채움은 있지만 시선을 끌지 않는다. */
        secondary:
          'bg-surface-strong text-fg hover:bg-surface-inset active:bg-line-strong border border-line',
        /** 테두리만. 목록 안 반복 행동에 적합. */
        outline:
          'border border-line-strong bg-bg text-fg hover:bg-surface active:bg-surface-strong',
        /** 배경 없음. 아이콘 버튼·툴바용. */
        ghost: 'text-fg-muted hover:bg-surface hover:text-fg active:bg-surface-strong',
        /** 파괴적 행동에만. 유채색을 쓰는 유일한 자리. */
        danger:
          'border border-danger-border bg-danger-bg text-danger hover:border-danger active:opacity-80',
        /** 인라인 텍스트 링크처럼 보이는 버튼. */
        link: 'h-auto p-0 text-fg underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-fg active:opacity-70',
      },
      size: {
        sm: 'h-8 rounded-sm px-3 text-[0.8125rem]',
        md: 'h-10 rounded-md px-4 text-sm',
        lg: 'h-12 rounded-lg px-5 text-[0.9375rem]',
        /** 주 CTA. 모바일에서 엄지로 누르는 높이(56px). */
        xl: 'h-14 rounded-lg px-6 text-base',
        /** 정사각 아이콘 버튼 */
        icon: 'size-10 rounded-md',
        'icon-sm': 'size-8 rounded-sm',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** 자식 엘리먼트에 스타일만 입힌다. Link를 버튼처럼 보이게 할 때 사용. */
  asChild?: boolean;
  /** 로딩 중 라벨을 유지한 채 스피너로 덮는다. 너비가 변하지 않아 레이아웃이 튀지 않는다. */
  loading?: boolean;
  /** 라벨 왼쪽 아이콘 */
  leadingIcon?: React.ReactNode;
  /** 라벨 오른쪽 아이콘 */
  trailingIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    block,
    asChild = false,
    loading = false,
    leadingIcon,
    trailingIcon,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  // asChild일 때는 Slot이 단일 자식만 허용하므로 스피너/아이콘 래핑을 하지 않는다.
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    >
      {/* 라벨을 자리에 남겨두고 투명하게 만들어 버튼 너비를 고정한다 */}
      <span
        className={cn(
          'inline-flex items-center gap-2 transition-opacity duration-150',
          loading && 'opacity-0',
        )}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner size={size === 'sm' || size === 'icon-sm' ? 14 : 18} />
        </span>
      )}
    </button>
  );
});

export { buttonVariants };
