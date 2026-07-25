import { Button, Card } from '@tattoo/ui';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { DesignThumb } from '@/components/design-thumb';
import { repository } from '@/data';
import { getDictionary, isLocale, type Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  // 한 번에 병렬로 가져온다. 순차 await하면 지연이 그대로 더해진다.
  const [content, artists, designs, notices] = await Promise.all([
    repository.getSiteContent(),
    repository.listArtists(),
    repository.listFlashDesigns({ size: 6 }),
    repository.listNotices(),
  ]);

  const pinnedNotice = notices.find((notice) => notice.isPinned);

  return (
    <>
      {/* ── 히어로 ─────────────────────────────────────────
          큰 타이포 + 넓은 여백. 흑백에서 시선을 잡는 건 색이 아니라 크기 대비다. */}
      <section className="max-w-wide mx-auto px-4 pt-16 pb-14 sm:px-6 sm:pt-24 sm:pb-20">
        <div className="max-w-2xl">
          <p className="border-line bg-surface text-fg-muted mb-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium">
            <Sparkles size={12} />
            서울 마포 · 예약제 운영
          </p>

          {/* whitespace-pre-line: 콘텐츠의 줄바꿈(\n)을 그대로 살린다.
              관리자가 문구를 편집할 때 줄바꿈 위치를 직접 정할 수 있어야 한다. */}
          <h1 className="text-fg text-[2.25rem] leading-[1.14] font-bold tracking-[-0.035em] whitespace-pre-line sm:text-[3.25rem]">
            {locale === 'ko' ? content.heroTitle : dict.home.heroTitle}
          </h1>

          <p className="text-fg-muted mt-6 max-w-lg text-[1.0625rem] leading-relaxed">
            {locale === 'ko' ? content.heroSubtitle : dict.home.heroSubtitle}
          </p>

          <div className="mt-9 flex flex-col gap-2.5 sm:flex-row">
            <Button size="xl" asChild>
              <Link href={`/${locale}/flash`}>
                {dict.home.ctaFlash}
                <ArrowRight size={17} />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href={`/${locale}/custom`}>{dict.home.ctaCustom}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 공지 ─────────────────────────────────────────── */}
      {pinnedNotice && (
        <section className="max-w-wide mx-auto px-4 sm:px-6">
          <Card variant="filled" padding="sm" className="flex items-start gap-3">
            <span className="bg-accent text-fg-onaccent mt-0.5 shrink-0 rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-bold">
              공지
            </span>
            <div className="min-w-0">
              <p className="text-fg text-sm font-semibold">{pinnedNotice.title}</p>
              <p className="text-fg-muted mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed">
                {pinnedNotice.body}
              </p>
            </div>
          </Card>
        </section>
      )}

      {/* ── 플래시 도안 ───────────────────────────────────── */}
      <section className="max-w-wide mx-auto px-4 pt-20 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-title text-fg">{dict.home.sectionFlash}</h2>
            <p className="text-fg-muted mt-1.5 text-sm">{dict.home.sectionFlashDesc}</p>
          </div>
          <Link
            href={`/${locale}/flash`}
            className="text-fg-muted decoration-line-strong hover:text-fg hover:decoration-fg shrink-0 text-sm font-medium underline underline-offset-4 transition-colors"
          >
            {dict.home.viewAll}
          </Link>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {designs.items.map((design) => (
            <li key={design.id}>
              <Link
                href={`/${locale}/flash/${design.id}`}
                className="group border-line hover:border-line-strong block overflow-hidden rounded-lg border transition-colors duration-150"
              >
                <DesignThumb
                  seed={design.id}
                  imageUrl={design.imageUrl}
                  alt={`${design.artistName}의 플래시 도안`}
                />
                <div className="p-2.5">
                  <p className="text-fg truncate text-xs font-semibold">{design.artistName}</p>
                  <p className="text-fg-muted mt-0.5 flex items-center gap-1 text-[0.6875rem]">
                    <Clock size={10} />
                    <span data-numeric>{design.estimatedTime}</span>
                    {dict.common.minutes}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 아티스트 ─────────────────────────────────────── */}
      <section className="max-w-wide mx-auto px-4 pt-20 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-title text-fg">{dict.home.sectionArtists}</h2>
            <p className="text-fg-muted mt-1.5 text-sm">{dict.home.sectionArtistsDesc}</p>
          </div>
          <Link
            href={`/${locale}/artists`}
            className="text-fg-muted decoration-line-strong hover:text-fg hover:decoration-fg shrink-0 text-sm font-medium underline underline-offset-4 transition-colors"
          >
            {dict.home.viewAll}
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {artists.slice(0, 3).map((artist) => (
            <li key={artist.id}>
              <Link href={`/${locale}/artists/${artist.id}`} className="block h-full">
                <Card variant="interactive" padding="none" className="flex h-full gap-4 p-4">
                  <DesignThumb
                    seed={artist.id * 7}
                    imageUrl={artist.artistImageUrl}
                    alt={`${artist.artistName} 프로필`}
                    ratio="1/1"
                    className="size-20 shrink-0 rounded-md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-fg truncate text-[0.9375rem] font-semibold">
                      {artist.artistName}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-1">
                      {artist.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="bg-surface-strong text-fg-muted rounded-sm px-1.5 py-0.5 text-[0.6875rem]"
                        >
                          {genre}
                        </span>
                      ))}
                    </p>
                    {/* 소개가 비어 있을 수 있다(정하 아티스트). 그 경우 문구 영역을 비워 둔다. */}
                    {artist.introduce && (
                      <p className="text-fg-muted mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed">
                        {artist.introduce}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 커스텀 유도 ───────────────────────────────────── */}
      <section className="max-w-wide mx-auto px-4 pt-20 sm:px-6">
        <Card variant="filled" padding="lg" className="text-center">
          <h2 className="text-title text-fg">원하는 도안이 없으신가요?</h2>
          <p className="text-fg-muted mx-auto mt-2.5 max-w-md text-sm leading-relaxed">
            장르와 부위, 크기를 알려주시면 아티스트가 도안부터 함께 만들어 갑니다. 여덟 개 질문에
            답하는 데 2분이면 됩니다.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link href={`/${locale}/custom`}>
              {dict.nav.custom}
              <ArrowRight size={16} />
            </Link>
          </Button>
        </Card>
      </section>
    </>
  );
}
