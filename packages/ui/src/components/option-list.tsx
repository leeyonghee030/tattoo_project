'use client';

import * as RadioGroup from '@radix-ui/react-radio-group';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

/* ---------------------------------------------------------------------------
 * OptionList — 퍼널 단계에서 쓰는 큰 단일 선택 목록.
 *
 * <select>를 쓰지 않는 이유: 모바일에서 네이티브 피커가 뜨면 흐름이 끊기고,
 * 선택지가 한눈에 안 보여 비교가 안 된다. 항목을 큰 카드로 펼쳐두면 탭 한 번에
 * 선택되고 그대로 다음 단계로 넘어갈 수 있다.
 *
 * 선택 표시는 무채색 규칙을 따른다 — 검은 2px 테두리 + 옅은 채움 + 체크 아이콘.
 * 세 신호가 중복되어 색 없이도 명확하다.
 * ------------------------------------------------------------------------- */

export interface OptionListProps extends React.ComponentPropsWithoutRef<typeof RadioGroup.Root> {
  /** 2열 그리드로 배치. 짧은 라벨(성별·나이대·크기)에 적합. */
  columns?: 1 | 2;
}

export const OptionList = React.forwardRef<
  React.ComponentRef<typeof RadioGroup.Root>,
  OptionListProps
>(function OptionList({ className, columns = 1, ...props }, ref) {
  return (
    <RadioGroup.Root
      ref={ref}
      className={cn('grid gap-2.5', columns === 2 && 'grid-cols-2', className)}
      {...props}
    />
  );
});

export interface OptionItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroup.Item> {
  /** 주 라벨 */
  label: React.ReactNode;
  /** 라벨 아래 보조 설명 (예: 예상 시간, 가격) */
  description?: React.ReactNode;
  /** 왼쪽 아이콘 또는 썸네일 */
  leading?: React.ReactNode;
  /** 오른쪽 끝 부가 정보 (예: 금액) */
  trailing?: React.ReactNode;
}

export const OptionItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroup.Item>,
  OptionItemProps
>(function OptionItem({ className, label, description, leading, trailing, ...props }, ref) {
  return (
    <RadioGroup.Item
      ref={ref}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg p-4 text-left',
        'border-line bg-bg border',
        'ease-out-quint transition-[border-color,background-color,transform] duration-150',
        'hover:border-line-strong hover:bg-surface',
        'active:scale-[0.99]',
        // 선택 상태: 테두리를 2px 검정으로. inset ring을 쓰면 레이아웃이 밀리지 않는다.
        'data-[state=checked]:border-fg data-[state=checked]:bg-surface',
        'data-[state=checked]:ring-fg data-[state=checked]:ring-1',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    >
      {leading && <span className="text-fg-muted shrink-0">{leading}</span>}

      <span className="min-w-0 flex-1">
        <span className="text-fg block text-[0.9375rem] leading-snug font-semibold">{label}</span>
        {description && (
          <span className="text-fg-muted mt-0.5 block text-[0.8125rem] leading-snug">
            {description}
          </span>
        )}
      </span>

      {trailing && <span className="text-fg-muted shrink-0 text-sm font-medium">{trailing}</span>}

      {/* 체크 표시는 선택되었을 때만 나타난다. 자리를 미리 비워두면 라벨이 흔들리지 않는다. */}
      <span
        aria-hidden
        className={cn(
          'grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-150',
          'border-line-strong bg-transparent text-transparent',
          'group-data-[state=checked]:border-fg group-data-[state=checked]:bg-accent',
          'group-data-[state=checked]:text-fg-onaccent',
        )}
      >
        <Check size={12} strokeWidth={3} />
      </span>
    </RadioGroup.Item>
  );
});

/* ---------------------------------------------------------------------------
 * ChoiceGrid — 이미지가 있는 선택지(아티스트, 도안, 부위 일러스트)용 격자.
 * ------------------------------------------------------------------------- */

export interface ChoiceGridProps extends React.ComponentPropsWithoutRef<typeof RadioGroup.Root> {
  columns?: 2 | 3;
}

export const ChoiceGrid = React.forwardRef<
  React.ComponentRef<typeof RadioGroup.Root>,
  ChoiceGridProps
>(function ChoiceGrid({ className, columns = 2, ...props }, ref) {
  return (
    <RadioGroup.Root
      ref={ref}
      className={cn(
        'grid gap-3',
        columns === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
        className,
      )}
      {...props}
    />
  );
});

export interface ChoiceCardProps extends React.ComponentPropsWithoutRef<typeof RadioGroup.Item> {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** 상단 이미지 영역. 4:5 비율로 자른다. */
  media?: React.ReactNode;
}

export const ChoiceCard = React.forwardRef<
  React.ComponentRef<typeof RadioGroup.Item>,
  ChoiceCardProps
>(function ChoiceCard({ className, label, description, media, ...props }, ref) {
  return (
    <RadioGroup.Item
      ref={ref}
      className={cn(
        'group border-line bg-bg relative overflow-hidden rounded-lg border text-left',
        'ease-out-quint transition-[border-color,transform] duration-150',
        'hover:border-line-strong active:scale-[0.99]',
        'data-[state=checked]:border-fg data-[state=checked]:ring-fg data-[state=checked]:ring-1',
        className,
      )}
      {...props}
    >
      {media && (
        <span className="bg-surface-strong relative block aspect-4/5 w-full overflow-hidden">
          {media}
          {/* 선택 시 이미지를 살짝 눌러 어둡게 — 무채색에서 선택감을 주는 방법 */}
          <span
            aria-hidden
            className={cn(
              'bg-fg/0 absolute inset-0 transition-colors duration-200',
              'group-data-[state=checked]:bg-fg/10',
            )}
          />
          <span
            aria-hidden
            className={cn(
              'absolute top-2 right-2 grid size-6 place-items-center rounded-full',
              'border border-white/70 bg-black/25 text-transparent backdrop-blur-sm',
              'transition-colors duration-150',
              'group-data-[state=checked]:border-fg group-data-[state=checked]:bg-accent',
              'group-data-[state=checked]:text-fg-onaccent',
            )}
          >
            <Check size={13} strokeWidth={3} />
          </span>
        </span>
      )}

      <span className="block p-3">
        <span className="text-fg block truncate text-sm font-semibold">{label}</span>
        {description && (
          <span className="text-fg-muted mt-0.5 block truncate text-xs">{description}</span>
        )}
      </span>
    </RadioGroup.Item>
  );
});
