import { ReservationStatus, type ReservationStatusCode } from '@tattoo/api-client';
import { EmptyState, cn } from '@tattoo/ui';
import { TriangleAlert } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { ReservationTable } from '@/components/reservation-table';
import { statusOptions } from '@/components/reservation-status-badge';
import { repository } from '@/data';
import { requireSession } from '@/lib/session.server';

export const metadata: Metadata = {
  title: '예약 관리',
  robots: { index: false, follow: false },
};

function parseStatus(value: string | undefined): ReservationStatusCode | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  const valid = Object.values(ReservationStatus) as number[];
  return valid.includes(parsed) ? (parsed as ReservationStatusCode) : undefined;
}

export default async function ArtistReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireSession('Artist');
  const profile = await repository.getMyArtistProfile(session.email);

  if (!profile) {
    return (
      <EmptyState
        icon={<TriangleAlert size={20} />}
        title="아티스트 정보를 찾을 수 없습니다"
        description="관리자에게 계정 연결을 요청해 주세요."
      />
    );
  }

  const { status: rawStatus } = await searchParams;
  const status = parseStatus(rawStatus);

  // artistId를 반드시 넘긴다. 빠뜨리면 다른 아티스트의 예약까지 조회된다.
  const result = await repository.listReservations({
    artistId: profile.id,
    status,
    size: 50,
  });

  const buildHref = (nextStatus: ReservationStatusCode | null) => {
    const query = new URLSearchParams();
    if (nextStatus !== null) query.set('status', String(nextStatus));
    const qs = query.toString();
    return `/artist/reservations${qs ? `?${qs}` : ''}`;
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-title text-fg">예약 관리</h1>
        <p className="text-fg-muted mt-1.5 text-sm">
          총 <span data-numeric>{result.totalItems}</span>건
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        <span className="text-fg-subtle mr-1 text-xs font-semibold">상태</span>
        <Chip href={buildHref(null)} active={status === undefined}>
          전체
        </Chip>
        {statusOptions().map((option) => (
          <Chip key={option.value} href={buildHref(option.value)} active={status === option.value}>
            {option.label}
          </Chip>
        ))}
      </div>

      <ReservationTable
        reservations={result.items}
        hideArtist
        emptyTitle="조건에 맞는 예약이 없습니다"
        emptyDescription="상태 필터를 바꿔 다시 확인해 보세요."
      />
    </>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150',
        active
          ? 'border-fg bg-accent text-fg-onaccent'
          : 'border-line bg-bg text-fg-muted hover:border-line-strong hover:text-fg',
      )}
    >
      {children}
    </Link>
  );
}
