'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

/* ---------------------------------------------------------------------------
 * DatePicker — 예약 가능 날짜 달력.
 *
 * date-fns 등 외부 라이브러리를 쓰지 않고 직접 구현한 이유:
 *   필요한 건 "한 달 격자 + 선택 가능 여부"뿐이고, 타임존 처리를 우리가 통제해야 한다.
 *   백엔드의 preferredDate가 문자열(String)이므로 로컬 날짜를 그대로 'YYYY-MM-DD'로
 *   주고받는다. Date 객체를 ISO로 직렬화하면 UTC로 밀려서 하루 어긋나는 사고가 난다.
 *   여기서는 Date를 파싱/직렬화할 때 항상 로컬 기준 y/m/d만 쓴다.
 * ------------------------------------------------------------------------- */

/** 'YYYY-MM-DD' — 타임존 영향을 받지 않는 로컬 날짜 키 */
export type DateKey = string;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** Date → 'YYYY-MM-DD' (로컬 기준). toISOString을 쓰면 UTC로 밀린다. */
export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 'YYYY-MM-DD' → Date (로컬 자정). new Date(str)은 UTC로 해석되므로 쓰지 않는다. */
export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export interface DatePickerProps {
  /** 선택된 날짜 */
  value?: DateKey;
  onChange?: (value: DateKey) => void;
  /** 예약 가능한 날짜 목록. 지정하면 목록에 없는 날은 모두 비활성. */
  availableDates?: DateKey[];
  /** 개별 비활성 날짜(휴무일·임시휴업). availableDates보다 우선한다. */
  disabledDates?: DateKey[];
  /** 이 날짜 이전은 선택 불가. 기본은 오늘. */
  minDate?: DateKey;
  /** 이 날짜 이후는 선택 불가(예약 가능 기간 상한). */
  maxDate?: DateKey;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  availableDates,
  disabledDates,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const availableSet = React.useMemo(
    () => (availableDates ? new Set(availableDates) : null),
    [availableDates],
  );
  const disabledSet = React.useMemo(() => new Set(disabledDates ?? []), [disabledDates]);

  // 오늘 날짜는 렌더 중 계산하면 SSR/CSR 값이 갈릴 수 있어 마운트 후 확정한다.
  const [todayKey, setTodayKey] = React.useState<DateKey | null>(null);
  React.useEffect(() => setTodayKey(toDateKey(new Date())), []);

  // 보여줄 달. 선택값이 있으면 그 달부터, 없으면 첫 예약가능일 또는 이번 달.
  const initialMonth = React.useMemo(() => {
    const seed = value ?? availableDates?.[0] ?? minDate;
    const base = seed ? fromDateKey(seed) : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  }, [value, availableDates, minDate]);

  const [view, setView] = React.useState(initialMonth);

  const effectiveMin = minDate ?? todayKey;

  const cells = React.useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const leadingBlanks = first.getDay();

    const result: Array<{ key: DateKey; day: number } | null> = [];
    for (let i = 0; i < leadingBlanks; i++) result.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({ key: toDateKey(new Date(view.year, view.month, day)), day });
    }
    return result;
  }, [view]);

  const isDisabled = (key: DateKey): boolean => {
    if (disabledSet.has(key)) return true;
    if (effectiveMin && key < effectiveMin) return true;
    if (maxDate && key > maxDate) return true;
    // availableDates를 넘긴 경우 화이트리스트로 동작한다.
    if (availableSet && !availableSet.has(key)) return true;
    return false;
  };

  const shiftMonth = (delta: number) => {
    setView((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  // 이전 달 버튼: 최소 날짜가 속한 달보다 앞으로는 못 간다.
  const canGoPrev = (() => {
    if (!effectiveMin) return true;
    const min = fromDateKey(effectiveMin);
    return (
      view.year > min.getFullYear() ||
      (view.year === min.getFullYear() && view.month > min.getMonth())
    );
  })();

  const canGoNext = (() => {
    if (!maxDate) return true;
    const max = fromDateKey(maxDate);
    return (
      view.year < max.getFullYear() ||
      (view.year === max.getFullYear() && view.month < max.getMonth())
    );
  })();

  return (
    <div className={cn('select-none', className)}>
      {/* 월 이동 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoPrev}
          aria-label="이전 달"
          className={cn(
            'text-fg-muted grid size-9 place-items-center rounded-md transition-colors',
            'hover:bg-surface hover:text-fg',
            'disabled:pointer-events-none disabled:opacity-30',
          )}
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-fg text-[0.9375rem] font-semibold" aria-live="polite">
          {view.year}년 {view.month + 1}월
        </span>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canGoNext}
          aria-label="다음 달"
          className={cn(
            'text-fg-muted grid size-9 place-items-center rounded-md transition-colors',
            'hover:bg-surface hover:text-fg',
            'disabled:pointer-events-none disabled:opacity-30',
          )}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 요일 머리 */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((label) => (
          <span key={label} className="text-fg-subtle py-1.5 text-center text-xs font-medium">
            {label}
          </span>
        ))}
      </div>

      {/* 날짜 격자 */}
      <div className="grid grid-cols-7 gap-1" role="grid">
        {cells.map((cell, i) => {
          if (!cell) return <span key={`blank-${i}`} aria-hidden />;

          const disabled = isDisabled(cell.key);
          const selected = value === cell.key;
          const isToday = todayKey === cell.key;

          return (
            <button
              key={cell.key}
              type="button"
              role="gridcell"
              disabled={disabled}
              aria-selected={selected}
              aria-label={`${view.year}년 ${view.month + 1}월 ${cell.day}일${disabled ? ' 예약 불가' : ''}`}
              onClick={() => onChange?.(cell.key)}
              className={cn(
                'relative grid aspect-square place-items-center rounded-md text-sm font-medium',
                'ease-out-quint transition-[background-color,color,transform] duration-150',
                'active:scale-95',
                !disabled && !selected && 'text-fg hover:bg-surface-strong',
                // 선택: 검정 채움
                selected && 'bg-accent text-fg-onaccent',
                // 비활성: 취소선으로 "닫힌 날"임을 색 없이 표현한다
                disabled && 'text-fg-subtle/50 cursor-not-allowed line-through decoration-1',
              )}
              data-numeric
            >
              {cell.day}
              {/* 오늘 표시: 아래 점. 선택 상태와 겹쳐도 구분된다. */}
              {isToday && !selected && (
                <span aria-hidden className="bg-fg-subtle absolute bottom-1 size-1 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * TimeSlotPicker — 선택한 날짜의 시간대 목록.
 * ------------------------------------------------------------------------- */

export interface TimeSlot {
  /** 'HH:mm' */
  time: string;
  /** 이미 예약되어 선택 불가 */
  taken?: boolean;
}

export interface TimeSlotPickerProps {
  slots: TimeSlot[];
  value?: string;
  onChange?: (time: string) => void;
  className?: string;
}

export function TimeSlotPicker({ slots, value, onChange, className }: TimeSlotPickerProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4', className)}>
      {slots.map((slot) => {
        const selected = value === slot.time;
        return (
          <button
            key={slot.time}
            type="button"
            disabled={slot.taken}
            aria-pressed={selected}
            onClick={() => onChange?.(slot.time)}
            className={cn(
              'h-11 rounded-md border text-sm font-medium',
              'ease-out-quint transition-[background-color,border-color,transform] duration-150',
              'active:scale-[0.97]',
              !slot.taken &&
                !selected &&
                'border-line bg-bg text-fg hover:border-line-strong hover:bg-surface',
              selected && 'border-fg bg-accent text-fg-onaccent',
              slot.taken &&
                'border-line bg-surface text-fg-subtle/60 cursor-not-allowed line-through',
            )}
            data-numeric
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
