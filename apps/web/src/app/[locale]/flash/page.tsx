import { Badge, Button, EmptyState, cn } from '@tattoo/ui';
import { Clock, SearchX } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DesignThumb } from '@/components/design-thumb';
import { repository } from '@/data';
import { getDictionary, isLocale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: '플래시 도안',
  description: '바로 예약할 수 있는 완성 도안입니다.',
};

interface FlashListPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ artistId?: string; genre?: string }>;
}

export default async function FlashListPage({ params, searchParams }: FlashListPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const filters = await searchParams;
  const artistId = filters.artistId ? Number(filters.artistId) : undefined;
  const genre = filters.genre;

  const [artists, designs] = await Promise.all([
    repository.listArtists(),
    repository.listFlashDesigns({
      // NaN이 필터로 들어가면 아무것도 매칭되지 않는 빈 목록이 된다.
      artistId: artistId !== undefined && Number.isInteger(artistId) ? artistId : undefined,
      genre,
      size: 48,
    }),
  ]);

  // 장르 목록은 아티스트가 등록한 것에서 모은다. 하드코딩하면 새 장르가 추가될 때 누락된다.
  const genres = [...new Set(artists.flatMap((artist) => artist.genres))].sort();

  /** 현재 필터를 유지하면서 한 가지만 바꾸는 링크를 만든다. */
  const filterHref = (next: { artistId?: number; genre?: string }) => {
    const query = new URLSearchParams();
    const resolvedArtist = 'artistId' in next ? next.artistId : artistId;
    const resolvedGenre = 'genre' in next ? next.genre : genre;
    if (resolvedArtist !== undefined) query.set('artistId', String(resolvedArtist));
    if (resolvedGenre) query.set('genre', resolvedGenre);
    const qs = query.toString();
    return `/${locale}/flash${qs ? `?${qs}` : ''}`;
  };

  const hasFilter = artistId !== undefined || Boolean(genre);

  return (
    <div className="max-w-wide mx-auto px-4 py-14 sm:px-6">
      <header className="mb-8">
        <h1 className="text-title text-fg">{dict.flash.title}</h1>
        <p className="text-fg-muted mt-2 text-[0.9375rem]">{dict.flash.description}</p>
      </header>

      {/* ── 필터 ─────────────────────────────────────────
          Select 드롭다운이 아니라 펼친 칩으로 둔 이유: 선택지가 10개 안쪽이고,
          지금 어떤 필터가 걸려 있는지가 한눈에 보여야 한다. 드롭다운은 닫히면
          현재 상태가 숨는다. 또 링크라서 뒤로가기가 필터 해제로 동작한다. */}
      <div className="mb-9 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-fg-subtle mr-1 text-xs font-semibold">
            {dict.flash.filterArtist}
          </span>
          <FilterChip href={filterHref({ artistId: undefined })} active={artistId === undefined}>
            {dict.flash.filterAll}
          </FilterChip>
          {artists.map((artist) => (
            <FilterChip
              key={artist.id}
              href={filterHref({ artistId: artist.id })}
              active={artistId === artist.id}
            >
              {artist.artistName}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-fg-subtle mr-1 text-xs font-semibold">
            {dict.flash.filterGenre}
          </span>
          <FilterChip href={filterHref({ genre: undefined })} active={!genre}>
            {dict.flash.filterAll}
          </FilterChip>
          {genres.map((item) => (
            <FilterChip key={item} href={filterHref({ genre: item })} active={genre === item}>
              {item}
            </FilterChip>
          ))}
        </div>
      </div>

      {designs.items.length === 0 ? (
        <EmptyState
          icon={<SearchX size={20} />}
          title={dict.flash.empty}
          description={dict.flash.emptyDesc}
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              {hasFilter && (
                <Button variant="outline" asChild>
                  <Link href={`/${locale}/flash`}>필터 초기화</Link>
                </Button>
              )}
              <Button asChild>
                <Link href={`/${locale}/custom`}>{dict.nav.custom}</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <p className="text-fg-subtle mb-4 text-[0.8125rem]">
            총 <span data-numeric>{designs.totalItems}</span>개
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {designs.items.map((design) => (
              <li key={design.id}>
                <Link
                  href={`/${locale}/flash/${design.id}`}
                  className={cn(
                    'group border-line hover:border-line-strong block overflow-hidden rounded-lg border transition-colors duration-150',
                    // 판매 종료는 흐리게. 숨기지 않는 이유는 mock.ts 주석에 적어 뒀다.
                    design.isSoldOut && 'opacity-55',
                  )}
                >
                  <div className="relative">
                    <DesignThumb
                      seed={design.id}
                      imageUrl={design.imageUrl}
                      alt={`${design.artistName}의 플래시 도안`}
                    />
                    {design.isSoldOut && (
                      <Badge tone="solid" size="sm" className="absolute top-2 left-2">
                        {dict.flash.soldOut}
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-fg truncate text-[0.8125rem] font-semibold">
                      {design.artistName}
                    </p>
                    <p className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-fg text-sm font-medium" data-numeric>
                        {design.price}
                        {dict.common.won}
                      </span>
                      <span className="text-fg-muted flex shrink-0 items-center gap-1 text-[0.6875rem]">
                        <Clock size={10} />
                        <span data-numeric>{design.estimatedTime}</span>
                        {dict.common.minutes}
                      </span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function FilterChip({
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
      aria-current={active ? 'true' : undefined}
      // scroll={false}: 필터를 바꿀 때 페이지 맨 위로 튀지 않게 한다.
      scroll={false}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors duration-150',
        active
          ? 'border-fg bg-accent text-fg-onaccent'
          : 'border-line bg-bg text-fg-muted hover:border-line-strong hover:text-fg',
      )}
    >
      {children}
    </Link>
  );
}
