import { ReservationStatus, type ReservationStatusCode } from '@tattoo/api-client';
import { Button, cn } from '@tattoo/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { ReservationTable } from '@/components/reservation-table';
import { statusOptions } from '@/components/reservation-status-badge';
import { repository } from '@/data';

import { ReservationSearch } from './reservation-search';

export const metadata: Metadata = {
  title: '예약 관리',
  robots: { index: false, follow: false },
};

interface AdminReservationsPageProps {
  searchParams: Promise<{ type?: string; status?: string; q?: string; page?: string }>;
}

/** 쿼리 문자열을 유효한 상태 코드로 좁힌다. 아무 숫자나 통과시키면 빈 목록이 나온다. */
function parseStatus(value: string | undefined): ReservationStatusCode | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  const valid = Object.values(ReservationStatus) as number[];
  return valid.includes(parsed) ? (parsed as ReservationStatusCode) : undefined;
}

export default async function AdminReservationsPage({ searchParams }: AdminReservationsPageProps) {
  const filters = await searchParams;

  const type = filters.type === 'FLASH' || filters.type === 'CUSTOM' ? filters.type : undefined;
  const status = parseStatus(filters.status);
  const q = filters.q?.trim() || undefined;
  const page = Number(filters.page) > 0 ? Number(filters.page) : 1;

  const result = await repository.listReservations({ type, status, q, page, size: 20 });

  /** 현재 필터를 유지하면서 일부만 바꾸는 URL을 만든다. */
  const buildHref = (next: {
    type?: 'FLASH' | 'CUSTOM' | null;
    status?: ReservationStatusCode | null;
    page?: number;
  }) => {
    const query = new URLSearchParams();
    const nextType = 'type' in next ? next.type : type;
    const nextStatus = 'status' in next ? next.status : status;

    if (nextType) query.set('type', nextType);
    if (nextStatus !== null && nextStatus !== undefined) query.set('status', String(nextStatus));
    if (q) query.set('q', q);
    // 필터를 바꾸면 1페이지로 돌아간다. 3페이지에서 필터를 바꿨을 때
    // 결과가 2페이지뿐이면 빈 화면이 나온다.
    if (next.page && next.page > 1) query.set('page', String(next.page));

    const qs = query.toString();
    return `/admin/reservations${qs ? `?${qs}` : ''}`;
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-title text-fg">예약 관리</h1>
        <p className="text-fg-muted mt-1.5 text-sm">
          총 <span data-numeric>{result.totalItems}</span>건
        </p>
      </header>

      <div className="mb-5 space-y-3">
        <ReservationSearch initialQuery={q ?? ''} />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-fg-subtle mr-1 text-xs font-semibold">종류</span>
          <Chip href={buildHref({ type: null })} active={!type}>
            전체
          </Chip>
          <Chip href={buildHref({ type: 'FLASH' })} active={type === 'FLASH'}>
            플래시
          </Chip>
          <Chip href={buildHref({ type: 'CUSTOM' })} active={type === 'CUSTOM'}>
            커스텀
          </Chip>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-fg-subtle mr-1 text-xs font-semibold">상태</span>
          <Chip href={buildHref({ status: null })} active={status === undefined}>
            전체
          </Chip>
          {statusOptions().map((option) => (
            <Chip
              key={option.value}
              href={buildHref({ status: option.value })}
              active={status === option.value}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <ReservationTable
        reservations={result.items}
        emptyTitle={q ? `'${q}' 검색 결과가 없습니다` : '조건에 맞는 예약이 없습니다'}
        emptyDescription="검색어나 필터를 바꿔 다시 시도해 보세요."
      />

      {/* 페이지네이션 — 전체 페이지가 1개면 렌더하지 않는다. */}
      {result.totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2" aria-label="페이지 이동">
          <Button variant="outline" size="sm" disabled={result.page <= 1} asChild={result.page > 1}>
            {result.page > 1 ? (
              <Link href={buildHref({ page: result.page - 1 })}>이전</Link>
            ) : (
              <span>이전</span>
            )}
          </Button>

          <span className="text-fg-muted px-2 text-sm" data-numeric>
            {result.page} / {result.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={result.page >= result.totalPages}
            asChild={result.page < result.totalPages}
          >
            {result.page < result.totalPages ? (
              <Link href={buildHref({ page: result.page + 1 })}>다음</Link>
            ) : (
              <span>다음</span>
            )}
          </Button>
        </nav>
      )}
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
