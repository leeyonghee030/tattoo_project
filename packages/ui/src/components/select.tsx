'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';
import { useFieldAria } from './field';

/* ---------------------------------------------------------------------------
 * Select — 관리자 화면 필터·설정용 드롭다운.
 *
 * 고객 퍼널에서는 OptionList(큰 카드)를 쓴다. Select는 선택지가 많고 화면 공간이
 * 아까운 관리자 테이블 상단 필터에 적합하다.
 * ------------------------------------------------------------------------- */

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;

export const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger({ className, children, ...props }, ref) {
  const aria = useFieldAria();
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between gap-2 rounded-md px-3.5',
        'border-line bg-bg text-fg border text-sm',
        'transition-colors duration-150',
        'hover:border-line-strong',
        'focus:border-fg focus:ring-fg focus:ring-1 focus:outline-none',
        'data-[placeholder]:text-fg-subtle',
        'disabled:bg-surface-strong disabled:text-fg-subtle disabled:cursor-not-allowed',
        className,
      )}
      {...aria}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="text-fg-subtle shrink-0">
        <ChevronDown size={16} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

export const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, position = 'popper', ...props }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        sideOffset={4}
        className={cn(
          'z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden',
          'border-line bg-bg rounded-lg border shadow-lg',
          'data-[state=open]:animate-scale-in',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

export const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'text-fg relative flex cursor-pointer items-center gap-2 rounded-sm py-2 pr-2 pl-8 text-sm',
        'outline-none select-none',
        'data-highlighted:bg-surface-strong',
        'data-[state=checked]:font-semibold',
        'data-disabled:pointer-events-none data-disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 grid size-4 place-items-center">
        <SelectPrimitive.ItemIndicator>
          <Check size={14} strokeWidth={3} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

export const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn('text-fg-subtle px-2 py-1.5 text-xs font-semibold', className)}
      {...props}
    />
  );
});
