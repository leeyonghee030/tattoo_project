import { Badge, Button, Card } from '@tattoo/ui';
import { ArrowRight, Clock, Palette } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DesignThumb } from '@/components/design-thumb';
import { repository } from '@/data';
import { formatCurrency, getDictionary, isLocale } from '@/lib/i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const design = await repository.getFlashDesign(Number(id));
  if (!design) return { title: '도안을 찾을 수 없습니다' };

  return {
    title: `${design.artistName}의 플래시 도안`,
    description: `${design.genre ?? ''} · 예상 ${design.estimatedTime}분 · ${design.price}원`,
  };
}

export default async function FlashDesignPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const designId = Number(id);
  if (!Number.isInteger(designId)) notFound();

  const design = await repository.getFlashDesign(designId);
  if (!design) notFound();

  const [artist, depositPolicy, related] = await Promise.all([
    repository.getArtist(design.artistId),
    repository.getDepositPolicy(),
    repository.listFlashDesigns({ artistId: design.artistId, size: 5 }),
  ]);

  const otherDesigns = related.items.filter((item) => item.id !== design.id).slice(0, 4);

  return (
    <div className="max-w-content mx-auto px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-8 sm:grid-cols-2">
        <DesignThumb
          seed={design.id}
          imageUrl={design.imageUrl}
          alt={`${design.artistName}의 플래시 도안`}
          ratio="4/5"
          className="border-line rounded-xl border"
        />

        <div className="flex flex-col">
          {design.isSoldOut && (
            <Badge tone="subtle" className="mb-3 self-start">
              {dict.flash.soldOut}
            </Badge>
          )}

          <Link
            href={`/${locale}/artists/${design.artistId}`}
            className="text-fg-muted decoration-line-strong hover:text-fg hover:decoration-fg text-sm font-medium underline underline-offset-4 transition-colors"
          >
            {design.artistName}
          </Link>

          <p className="text-display text-fg mt-3" data-numeric>
            {design.price}
            <span className="text-fg-muted ml-1 text-lg font-semibold">{dict.common.won}</span>
          </p>

          <dl className="mt-6 space-y-2.5 text-sm">
            <div className="flex items-center gap-2">
              <dt className="text-fg-muted flex items-center gap-1.5">
                <Clock size={14} />
                {dict.flash.estimatedTime}
              </dt>
              <dd className="text-fg font-medium" data-numeric>
                {design.estimatedTime}
                {dict.common.minutes}
              </dd>
            </div>
            {design.genre && (
              <div className="flex items-center gap-2">
                <dt className="text-fg-muted flex items-center gap-1.5">
                  <Palette size={14} />
                  {dict.flash.filterGenre}
                </dt>
                <dd className="text-fg font-medium">{design.genre}</dd>
              </div>
            )}
          </dl>

          {/* 예약금은 예약 전에 반드시 알아야 하는 정보다. 마지막 단계에서 처음 알리면
              사용자는 속았다고 느끼고 그 자리에서 이탈한다. */}
          <Card variant="filled" padding="sm" className="mt-6">
            <p className="text-fg-muted text-[0.8125rem] leading-relaxed">
              예약 시 예약금{' '}
              <span className="text-fg font-semibold" data-numeric>
                {formatCurrency(depositPolicy.flashAmount, locale)}
              </span>
              이 필요하며, 시술 금액에서 차감됩니다.
            </p>
          </Card>

          <div className="mt-auto pt-7">
            {design.isSoldOut ? (
              <>
                <Button size="xl" block disabled>
                  {dict.flash.soldOut}
                </Button>
                <p className="text-fg-subtle mt-3 text-center text-[0.8125rem]">
                  비슷한 작업을 원하시면 커스텀 상담을 이용해 주세요.
                </p>
              </>
            ) : (
              <Button size="xl" block asChild>
                <Link href={`/${locale}/flash/${design.id}/reserve`}>
                  {dict.flash.reserveThis}
                  <ArrowRight size={17} />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {artist?.introduce && (
        <section className="border-line mt-16 border-t pt-10">
          <h2 className="text-subtitle text-fg">{artist.artistName}</h2>
          <p className="text-fg-muted mt-3 text-[0.9375rem] leading-relaxed">{artist.introduce}</p>
        </section>
      )}

      {otherDesigns.length > 0 && (
        <section className="border-line mt-14 border-t pt-10">
          <h2 className="text-subtitle text-fg mb-5">같은 아티스트의 다른 도안</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {otherDesigns.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/${locale}/flash/${item.id}`}
                  className="border-line hover:border-line-strong block overflow-hidden rounded-lg border transition-colors"
                >
                  <DesignThumb
                    seed={item.id}
                    imageUrl={item.imageUrl}
                    alt={`${item.artistName}의 플래시 도안`}
                  />
                  <p className="text-fg p-2.5 text-xs font-medium" data-numeric>
                    {item.price}
                    {dict.common.won}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
