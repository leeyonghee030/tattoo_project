import * as React from 'react';

import { cn } from '../lib/cn';

// 'title'은 네이티브 HTML 속성(string)과 충돌하므로 제외하고 ReactNode로 다시 정의한다.
export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 다음 행동 버튼. 빈 화면에서 사용자를 막다른 길에 두지 않는다. */
  action?: React.ReactNode;
}

/**
 * 데이터가 없을 때의 화면.
 *
 * "결과 없음"만 띄우면 사용자는 뭘 해야 할지 모른다. 항상 다음 행동을 함께 준다
 * (검색어 지우기, 조건 넓히기, 등록하기 등).
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-16 text-center',
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="bg-surface-strong text-fg-subtle grid size-12 place-items-center rounded-full">
          {icon}
        </div>
      )}
      <p className="text-fg text-[0.9375rem] font-semibold">{title}</p>
      {description && (
        <p className="text-fg-muted max-w-sm text-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
