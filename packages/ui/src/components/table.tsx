import * as React from 'react';

import { cn } from '../lib/cn';

/* ---------------------------------------------------------------------------
 * 관리자 목록용 테이블 프리미티브.
 *
 * 무채색 테이블에서 가장 흔한 실패는 줄무늬(zebra)와 굵은 테두리로 정보를 가리는 것이다.
 * 여기서는 가로선 하나만 쓰고, 헤더는 배경 대신 글자 크기·색으로 구분한다.
 * 숫자 열은 tabular-nums(전역 base 레이어에서 table에 적용)로 자리폭이 고정된다.
 * ------------------------------------------------------------------------- */

/** 가로 스크롤 컨테이너. 좁은 화면에서 테이블이 페이지 전체를 밀지 않게 한다. */
export function TableWrap({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-line bg-bg w-full overflow-x-auto rounded-lg border', className)}
      {...props}
    />
  );
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-left text-sm', className)} {...props} />;
}

export function Thead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-line border-b', className)} {...props} />;
}

export function Tbody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-line divide-y', className)} {...props} />;
}

export interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** 행 클릭으로 상세를 열 때. hover 배경과 커서를 준다. */
  clickable?: boolean;
}

export function Tr({ className, clickable, ...props }: TrProps) {
  return (
    <tr
      className={cn(
        'transition-colors duration-100',
        clickable && 'hover:bg-surface cursor-pointer',
        className,
      )}
      {...props}
    />
  );
}

export interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'right' | 'center';
}

export function Th({ className, align = 'left', ...props }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        'text-fg-muted px-4 py-3 text-xs font-semibold whitespace-nowrap',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...props}
    />
  );
}

export interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'right' | 'center';
  /** 이 셀을 행의 주 식별자로 취급해 강조한다 (예: 예약번호, 고객명). */
  primary?: boolean;
}

export function Td({ className, align = 'left', primary, ...props }: TdProps) {
  return (
    <td
      className={cn(
        'text-fg-muted px-4 py-3.5 align-middle',
        primary && 'text-fg font-medium',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...props}
    />
  );
}
