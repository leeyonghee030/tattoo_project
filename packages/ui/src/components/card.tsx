import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/cn';

const cardVariants = cva('rounded-lg', {
  variants: {
    variant: {
      /** 기본: 테두리만. 무채색에서는 그림자보다 선이 깔끔하다. */
      outline: 'border border-line bg-bg',
      /** 배경 채움. 목록 안에서 그룹을 묶을 때. */
      filled: 'bg-surface',
      /** 떠 있는 느낌. 대시보드 지표 카드 등 강조가 필요한 곳에만. */
      elevated: 'border border-line bg-bg shadow-sm',
      /** 클릭 가능한 카드. hover/active 촉감을 준다. */
      interactive: [
        'border border-line bg-bg text-left',
        'transition-[border-color,background-color,transform] duration-150 ease-out-quint',
        'hover:border-line-strong hover:bg-surface',
        'active:scale-[0.99]',
      ],
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    },
  },
  defaultVariants: { variant: 'outline', padding: 'md' },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, padding }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-subtitle text-fg', className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-fg-muted text-sm leading-relaxed', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-line mt-5 flex items-center gap-2 border-t pt-4', className)}
      {...props}
    />
  );
}

/**
 * 대시보드 지표 타일.
 * 숫자를 크게, 라벨을 작게 — 스캔할 때 숫자만 먼저 읽히는 순서를 만든다.
 */
export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  /** 값 뒤 단위 ('건', '원' 등). 값보다 작게 표시된다. */
  unit?: string;
  /** 보조 설명 또는 전기간 대비 변화 */
  hint?: React.ReactNode;
  icon?: React.ReactNode;
}

export function StatTile({ label, value, unit, hint, icon, className, ...props }: StatTileProps) {
  return (
    <Card
      variant="elevated"
      padding="md"
      className={cn('flex flex-col gap-3', className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-fg-muted text-[0.8125rem] font-medium">{label}</span>
        {icon && <span className="text-fg-subtle">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-fg text-[1.75rem] leading-none font-bold tracking-tight" data-numeric>
          {value}
        </span>
        {unit && <span className="text-fg-muted text-sm font-medium">{unit}</span>}
      </div>
      {hint && <span className="text-fg-subtle text-[0.8125rem]">{hint}</span>}
    </Card>
  );
}

export { cardVariants };
