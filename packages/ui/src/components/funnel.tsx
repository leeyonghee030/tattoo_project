'use client';

import { ChevronLeft, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';
import { Button } from './button';

/* ---------------------------------------------------------------------------
 * 다단계 흐름(퍼널) 구성 요소.
 *
 * 설계 원칙 — 한 화면에 질문 하나.
 *   커스텀 예약은 선택 항목이 7개다. 한 페이지에 폼으로 다 늘어놓으면 사용자는
 *   전체 분량을 먼저 보고 부담을 느껴 이탈한다. 한 번에 하나만 묻고 즉시 다음으로
 *   넘기면 각 단계가 사소해 보이고, 진행 표시로 끝이 가까움을 계속 알려준다.
 * ------------------------------------------------------------------------- */

/* ── 상단 진행 표시 ─────────────────────────────────────── */

export interface StepProgressProps {
  /** 0-based 현재 인덱스 */
  index: number;
  total: number;
  className?: string;
}

/**
 * 얇은 진행 바. 숫자("3 / 8")를 함께 보여준다.
 * 바만 있으면 남은 분량이 감으로만 잡히고, 숫자만 있으면 진행감이 약하다.
 */
export function StepProgress({ index, total, className }: StepProgressProps) {
  const current = index + 1;
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="bg-surface-inset h-1 flex-1 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`전체 ${total}단계 중 ${current}단계`}
      >
        <div
          className="bg-accent ease-out-quint h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-fg-muted shrink-0 text-[0.8125rem] font-medium" data-numeric>
        {current}
        <span className="text-fg-subtle"> / {total}</span>
      </span>
    </div>
  );
}

/* ── 상단 바 ────────────────────────────────────────────── */

export interface FunnelHeaderProps {
  /** 뒤로가기. 없으면 버튼을 숨긴다(첫 단계). */
  onBack?: () => void;
  /** 흐름 전체를 닫는다. 보통 목록으로 복귀. */
  onClose?: () => void;
  /** 진행 표시. StepProgress를 넣는다. */
  progress?: React.ReactNode;
  className?: string;
}

/**
 * 스크롤에 붙어 있는 상단 바.
 * 뒤로가기를 왼쪽 최상단에 고정해 두면 사용자가 "언제든 되돌릴 수 있다"고 느껴
 * 각 단계를 부담 없이 진행한다.
 */
export function FunnelHeader({ onBack, onClose, progress, className }: FunnelHeaderProps) {
  return (
    <header
      className={cn(
        'border-line bg-bg/85 sticky top-0 z-30 border-b backdrop-blur-md',
        'supports-[backdrop-filter]:bg-bg/70',
        className,
      )}
    >
      <div className="max-w-narrow mx-auto flex h-14 items-center gap-2 px-4">
        {onBack ? (
          <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="이전 단계로">
            <ChevronLeft size={20} />
          </Button>
        ) : (
          <span className="size-8 shrink-0" aria-hidden />
        )}

        <div className="min-w-0 flex-1">{progress}</div>

        {onClose ? (
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="예약 그만두기">
            <X size={18} />
          </Button>
        ) : (
          <span className="size-8 shrink-0" aria-hidden />
        )}
      </div>
    </header>
  );
}

/* ── 단계 컨테이너 ──────────────────────────────────────── */

// 'title'은 네이티브 HTML 속성(string)과 충돌하므로 제외하고 ReactNode로 다시 정의한다.
export interface FunnelStepProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 큰 질문 문구. 한 단계에 하나만. */
  title: React.ReactNode;
  /** 질문 아래 보조 설명 */
  description?: React.ReactNode;
  /** 진입 애니메이션 방향. useFunnel의 direction을 그대로 넘긴다. */
  direction?: 'forward' | 'backward';
  /** 애니메이션 재실행 키. 보통 단계 이름. */
  stepKey?: string;
}

/**
 * 단계 하나를 감싸는 컨테이너.
 *
 * 진행 방향에 따라 진입 애니메이션이 달라진다(앞으로 갈 때 오른쪽에서, 뒤로 갈 때
 * 왼쪽에서). 방향이 일관되면 사용자는 자기가 흐름 위 어디로 움직였는지 무의식적으로
 * 파악한다. 이동 거리는 16px로 짧게 — 크게 움직이면 화면이 산만해진다.
 */
export function FunnelStep({
  title,
  description,
  direction = 'forward',
  stepKey,
  className,
  children,
  ...props
}: FunnelStepProps) {
  return (
    <div
      key={stepKey}
      className={cn(
        'max-w-narrow mx-auto w-full px-4 pt-8',
        direction === 'forward' ? 'animate-slide-left' : 'animate-slide-right',
        className,
      )}
      {...props}
    >
      <h1 className="text-title text-fg">{title}</h1>
      {description && (
        <p className="text-fg-muted mt-2 text-[0.9375rem] leading-relaxed">{description}</p>
      )}
      <div className="mt-7">{children}</div>
    </div>
  );
}

/* ── 하단 고정 CTA ──────────────────────────────────────── */

export interface StickyCtaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** CTA 위에 얹는 보조 정보 (예: 선택 요약, 예약금 금액) */
  summary?: React.ReactNode;
}

/**
 * 화면 하단에 고정되는 주 행동 영역.
 *
 * 모바일에서 CTA를 콘텐츠 끝에 두면 사용자가 스크롤해서 찾아야 한다. 고정해 두면
 * 언제든 누를 수 있고, "다음"이 항상 같은 자리에 있어 8단계를 리듬감 있게 넘긴다.
 * 콘텐츠가 가려지지 않게 스크롤 영역에는 `pb-cta` 유틸리티를 함께 써야 한다.
 */
export function StickyCta({ summary, className, children, ...props }: StickyCtaProps) {
  return (
    <div
      className={cn(
        'border-line bg-bg/90 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-md',
        'supports-[backdrop-filter]:bg-bg/75',
        className,
      )}
      {...props}
    >
      <div className="safe-bottom max-w-narrow mx-auto px-4 py-3">
        {summary && <div className="mb-2.5">{summary}</div>}
        {children}
      </div>
    </div>
  );
}
