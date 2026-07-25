import { cn } from '@tattoo/ui';

/* ---------------------------------------------------------------------------
 * 월별 예약 추이 — 순수 CSS 막대 그래프.
 *
 * 차트 라이브러리를 넣지 않은 이유: 필요한 건 "여섯 개 막대"뿐이다. Recharts는
 * 클라이언트 컴포넌트를 강제하고 번들에 100KB 이상 들어온다. 이건 서버에서
 * 렌더되고 JS가 0바이트다.
 *
 * 무채색 규칙: 막대는 단색 검정, 가장 높은 달만 진하게. 색으로 구분할 수 없으니
 * 각 막대 위에 숫자를 항상 표시한다 — 툴팁에 숨기면 마우스 없는 환경에서 못 읽는다.
 * ------------------------------------------------------------------------- */

export interface MonthlyTrendChartProps {
  data: Array<{ month: string; count: number }>;
  className?: string;
}

export function MonthlyTrendChart({ data, className }: MonthlyTrendChartProps) {
  if (data.length === 0) {
    return <p className="text-fg-subtle py-8 text-center text-sm">표시할 데이터가 없습니다.</p>;
  }

  const max = Math.max(...data.map((point) => point.count));
  // max가 0이면 나눗셈이 NaN이 된다. 모든 달이 0건인 경우가 실제로 있다(오픈 첫 달).
  const safeMax = max > 0 ? max : 1;

  return (
    <div className={cn('flex items-end gap-2', className)}>
      {data.map((point) => {
        const ratio = point.count / safeMax;
        const isPeak = point.count === max && max > 0;

        return (
          <div key={point.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-fg text-[0.6875rem] font-semibold" data-numeric>
              {point.count}
            </span>

            {/* 높이를 % 대신 명시적 min-height와 함께 준다. 0건인 달도 막대 흔적이
                보여야 "데이터가 없다"와 "0건이다"가 구분된다. */}
            <div
              className="flex w-full items-end"
              style={{ height: '7rem' }}
              role="img"
              aria-label={`${point.month} ${point.count}건`}
            >
              <div
                className={cn(
                  'ease-out-quint w-full rounded-t-sm transition-[height] duration-500',
                  isPeak ? 'bg-accent' : 'bg-line-strong',
                )}
                style={{ height: `max(3px, ${ratio * 100}%)` }}
              />
            </div>

            <span className="text-fg-subtle truncate text-[0.6875rem]" data-numeric>
              {/* '2026-07' → '7월' */}
              {Number(point.month.split('-')[1])}월
            </span>
          </div>
        );
      })}
    </div>
  );
}
