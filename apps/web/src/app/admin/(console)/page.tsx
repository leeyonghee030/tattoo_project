import { Card, CardHeader, CardTitle, StatTile } from '@tattoo/ui';
import { CalendarCheck, Clock3, CreditCard, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { MonthlyTrendChart } from '@/components/monthly-trend-chart';
import { ReservationTable } from '@/components/reservation-table';
import { repository } from '@/data';

export const metadata: Metadata = {
  title: '대시보드',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const summary = await repository.getDashboard({ role: 'Admin' });

  return (
    <>
      <header className="mb-7">
        <h1 className="text-title text-fg">대시보드</h1>
        <p className="text-fg-muted mt-1.5 text-sm">오늘 처리해야 할 예약을 먼저 확인하세요.</p>
      </header>

      {/* 지표 4개. 순서는 긴급도 순 — 오늘 일정이 가장 먼저, 이번 달 실적이 마지막. */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="오늘 예약"
          value={summary.todayReservationCount}
          unit="건"
          icon={<CalendarCheck size={15} />}
        />
        <StatTile
          label="입금 대기"
          value={summary.waitingCount}
          unit="건"
          hint="고객 입금 전"
          icon={<Clock3 size={15} />}
        />
        <StatTile
          label="입금 확인 필요"
          value={summary.paymentPendingCount}
          unit="건"
          hint="확인 후 캘린더 등록"
          icon={<CreditCard size={15} />}
        />
        <StatTile
          label="이번 달 확정"
          value={summary.confirmedThisMonthCount}
          unit="건"
          icon={<TrendingUp size={15} />}
        />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_20rem]">
        {/* 최근 예약 */}
        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className="text-subtitle text-fg">최근 예약</h2>
            <Link
              href="/admin/reservations"
              className="text-fg-muted decoration-line-strong hover:text-fg text-[0.8125rem] font-medium underline underline-offset-4 transition-colors"
            >
              전체 보기
            </Link>
          </div>
          <ReservationTable
            reservations={summary.recentReservations}
            emptyTitle="아직 접수된 예약이 없습니다"
            emptyDescription="고객이 예약을 접수하면 이곳에 표시됩니다."
          />
        </section>

        {/* 월별 추이 */}
        <section>
          <Card variant="elevated" padding="md">
            <CardHeader>
              <CardTitle className="text-subtitle">월별 예약</CardTitle>
            </CardHeader>
            <MonthlyTrendChart data={summary.monthlyTrend} />
          </Card>
        </section>
      </div>
    </>
  );
}
