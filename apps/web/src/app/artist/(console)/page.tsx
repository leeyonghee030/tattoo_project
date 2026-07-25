import { Card, CardHeader, CardTitle, EmptyState, StatTile } from '@tattoo/ui';
import { CalendarCheck, Clock3, CreditCard, TriangleAlert, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { MonthlyTrendChart } from '@/components/monthly-trend-chart';
import { ReservationTable } from '@/components/reservation-table';
import { repository } from '@/data';
import { requireSession } from '@/lib/session.server';

export const metadata: Metadata = {
  title: '대시보드',
  robots: { index: false, follow: false },
};

export default async function ArtistDashboardPage() {
  const session = await requireSession('Artist');
  const profile = await repository.getMyArtistProfile(session.email);

  // 프로필을 못 찾으면 예약을 범위 제한할 수 없다. 이 경우 전체를 보여주면
  // 다른 아티스트의 고객 정보가 노출되므로, 아무것도 보여주지 않고 안내만 한다.
  if (!profile) {
    return (
      <EmptyState
        icon={<TriangleAlert size={20} />}
        title="아티스트 정보를 찾을 수 없습니다"
        description={`${session.email} 계정에 연결된 아티스트 프로필이 없습니다. 관리자에게 계정 연결을 요청해 주세요.`}
      />
    );
  }

  const summary = await repository.getDashboard({ role: 'Artist', artistId: profile.id });

  return (
    <>
      <header className="mb-7">
        <h1 className="text-title text-fg">{profile.artistName}</h1>
        <p className="text-fg-muted mt-1.5 text-sm">본인에게 배정된 예약만 표시됩니다.</p>
      </header>

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
          icon={<Clock3 size={15} />}
        />
        <StatTile
          label="캘린더 등록 필요"
          value={summary.paymentPendingCount}
          unit="건"
          hint="입금 확인된 예약"
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
        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className="text-subtitle text-fg">최근 예약</h2>
            <Link
              href="/artist/reservations"
              className="text-fg-muted decoration-line-strong hover:text-fg text-[0.8125rem] font-medium underline underline-offset-4 transition-colors"
            >
              전체 보기
            </Link>
          </div>
          {/* hideArtist: 아티스트 화면에서는 모든 행이 자기 이름이라 열이 낭비다. */}
          <ReservationTable
            reservations={summary.recentReservations}
            hideArtist
            emptyTitle="배정된 예약이 없습니다"
            emptyDescription="고객이 회원님의 도안으로 예약하면 이곳에 표시됩니다."
          />
        </section>

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
