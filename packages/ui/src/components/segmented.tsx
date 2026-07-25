'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '../lib/cn';

/* ---------------------------------------------------------------------------
 * Segmented / Tabs — 무채색 두 가지 형태.
 *
 *  segmented: 알약 안에서 선택된 칸이 흰 카드로 뜬다. 2~3개 항목, 상호 배타 필터에 적합.
 *  underline: 밑줄만 이동한다. 항목이 많은 관리자 화면 탭에 적합.
 * ------------------------------------------------------------------------- */

export const Tabs = TabsPrimitive.Root;
export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn('data-[state=active]:animate-fade-in focus-visible:outline-none', className)}
      {...props}
    />
  );
});

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: 'segmented' | 'underline';
}

const TabsVariantContext = React.createContext<'segmented' | 'underline'>('segmented');

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(function TabsList({ className, variant = 'segmented', ...props }, ref) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          variant === 'segmented' && 'bg-surface-strong inline-flex gap-1 rounded-lg p-1',
          variant === 'underline' &&
            'border-line flex [scrollbar-width:none] gap-1 overflow-x-auto border-b [&::-webkit-scrollbar]:hidden',
          className,
        )}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
});

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { count?: number }
>(function TabsTrigger({ className, children, count, ...props }, ref) {
  const variant = React.useContext(TabsVariantContext);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 font-medium whitespace-nowrap',
        'ease-out-quint transition-all duration-150',
        variant === 'segmented' && [
          'text-fg-muted h-9 rounded-md px-3.5 text-sm',
          'hover:text-fg',
          // 선택된 칸만 흰 카드로 띄운다. 그림자를 아주 얕게 줘야 인쇄물처럼 보이지 않는다.
          'data-[state=active]:bg-bg data-[state=active]:text-fg data-[state=active]:shadow-xs',
        ],
        variant === 'underline' && [
          'text-fg-muted relative h-11 px-3.5 text-sm',
          'hover:text-fg',
          'data-[state=active]:text-fg',
          // 밑줄은 컨테이너 테두리 위에 겹쳐 그린다(-bottom-px).
          'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full',
          'data-[state=active]:after:bg-accent after:bg-transparent',
        ],
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold',
            'bg-surface-inset text-fg-muted',
          )}
          data-numeric
        >
          {count}
        </span>
      )}
    </TabsPrimitive.Trigger>
  );
});
