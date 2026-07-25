'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

/* ---------------------------------------------------------------------------
 * Sheet — 아래에서 올라오는 바텀시트.
 *
 * 모바일에서 확인·선택을 받을 때 화면 중앙 모달보다 낫다. 엄지가 닿는 아래쪽에서
 * 올라오고, 뒤 화면이 남아 있어 맥락이 끊기지 않는다. 약관 동의, 예약금 안내,
 * 필터 선택처럼 "흐름을 벗어나지 않는 부가 입력"에 쓴다.
 * ------------------------------------------------------------------------- */

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function SheetTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-subtitle text-fg', className)}
      {...props}
    />
  );
});

export const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function SheetDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-fg-muted mt-1.5 text-sm leading-relaxed', className)}
      {...props}
    />
  );
});

const overlayClass = cn(
  'fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]',
  'data-[state=open]:animate-fade-in',
  'data-[state=closed]:opacity-0 data-[state=closed]:transition-opacity data-[state=closed]:duration-200',
);

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** 상단 손잡이(그래버) 표시. 드래그로 닫는 느낌을 암시한다. */
  showHandle?: boolean;
  /** 우상단 닫기 버튼 표시 */
  showClose?: boolean;
}

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(function SheetContent(
  { className, children, showHandle = true, showClose = false, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClass} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'max-w-content fixed inset-x-0 bottom-0 z-50 mx-auto w-full',
          'border-line bg-bg shadow-overlay rounded-t-2xl border border-b-0',
          // 화면을 다 덮지 않게 최대 높이를 제한하고 내부만 스크롤시킨다.
          'max-h-[88dvh] overflow-y-auto',
          'data-[state=open]:animate-sheet-in',
          'focus:outline-none',
          className,
        )}
        {...props}
      >
        {showHandle && (
          <div className="bg-bg sticky top-0 flex justify-center pt-3 pb-1">
            <span aria-hidden className="bg-line-strong h-1 w-9 rounded-full" />
          </div>
        )}

        {showClose && (
          <DialogPrimitive.Close
            aria-label="닫기"
            className={cn(
              'absolute top-3.5 right-4 grid size-8 place-items-center rounded-full',
              'text-fg-muted hover:bg-surface hover:text-fg transition-colors',
            )}
          >
            <X size={18} />
          </DialogPrimitive.Close>
        )}

        <div className="safe-bottom px-5 pt-3 pb-5">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

/* ---------------------------------------------------------------------------
 * Dialog — 데스크톱 중앙 모달. 관리자 화면의 확인·편집에 쓴다.
 * ------------------------------------------------------------------------- */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = SheetTitle;
export const DialogDescription = SheetDescription;

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showClose?: boolean }
>(function DialogContent({ className, children, showClose = true, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClass} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
          'border-line bg-bg shadow-overlay rounded-xl border p-6',
          'max-h-[85dvh] overflow-y-auto',
          'data-[state=open]:animate-scale-in',
          'focus:outline-none',
          className,
        )}
        {...props}
      >
        {showClose && (
          <DialogPrimitive.Close
            aria-label="닫기"
            className={cn(
              'absolute top-4 right-4 grid size-8 place-items-center rounded-full',
              'text-fg-muted hover:bg-surface hover:text-fg transition-colors',
            )}
          >
            <X size={18} />
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
