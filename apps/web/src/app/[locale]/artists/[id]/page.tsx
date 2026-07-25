import { Button, EmptyState } from '@tattoo/ui';
import { ArrowRight, Clock, ImageOff } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DesignThumb } from '@/components/design-thumb';
import { repository } from '@/data';
import { getDictionary, isLocale } from '@/lib/i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const artist = await repository.getArtist(Number(id));
  if (!artist) return { title: '아티스트를 찾을 수 없습니다' };

  return {
    title: artist.artistName,
    description: artist.introduce ?? `${artist.genres.join(' · ')} 작업을 합니다.`,
  };
}

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const artistId = Number(id);
  if (!Number.isInteger(artistId)) notFound();

  const artist = await repository.getArtist(artistId);
  if (!artist) notFound();

  const designs = await repository.listFlashDesigns({ artistId: artist.id, size: 24 });

  const socials = [
    { label: 'Instagram', href: artist.socialLinks.instagram },
    { label: 'KakaoTalk', href: artist.socialLinks.kakao },
    { label: 'LINE', href: artist.socialLinks.line },
    { label: 'WhatsApp', href: artist.socialLinks.whatsapp },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <div className="max-w-wide mx-auto px-4 py-12 sm:px-6 sm:py-16">
      {/* ── 프로필 ─────────────────────────────────────── */}
      <div className="grid gap-8 sm:grid-cols-[16rem_1fr] sm:gap-10">
        <DesignThumb
          seed={artist.id * 7}
          imageUrl={artist.artistImageUrl}
          alt={`${artist.artistName} 프로필`}
          ratio="4/5"
          className="border-line rounded-xl border"
        />

        <div>
          <h1 className="text-display text-fg">{artist.artistName}</h1>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {artist.genres.map((genre) => (
              <li key={genre}>
                <Link
                  href={`/${locale}/flash?genre=${encodeURIComponent(genre)}`}
                  className="border-line text-fg-muted hover:border-line-strong hover:text-fg inline-block rounded-full border px-2.5 py-1 text-xs transition-colors"
                >
                  {genre}
                </Link>
              </li>
            ))}
          </ul>

          {artist.introduce ? (
            <p className="text-fg-muted mt-6 max-w-prose text-[0.9375rem] leading-relaxed whitespace-pre-line">
              {artist.introduce}
            </p>
          ) : (
            <p className="text-fg-subtle mt-6 text-[0.9375rem]">소개글이 준비 중입니다.</p>
          )}

          {socials.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <Button variant="outline" size="sm" asChild>
                    <a href={social.href} target="_blank" rel="noreferrer noopener">
                      {social.label}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Button size="lg" className="mt-8" asChild>
            <Link href={`/${locale}/custom`}>
              이 아티스트에게 커스텀 상담
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 도안 ───────────────────────────────────────── */}
      <section className="border-line mt-16 border-t pt-12">
        <h2 className="text-title text-fg mb-6">{dict.flash.title}</h2>

        {designs.items.length === 0 ? (
          <EmptyState
            icon={<ImageOff size={20} />}
            title="등록된 플래시 도안이 없습니다"
            description="커스텀 상담으로 도안부터 함께 만들어 갈 수 있습니다."
            action={
              <Button asChild>
                <Link href={`/${locale}/custom`}>{dict.nav.custom}</Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {designs.items.map((design) => (
              <li key={design.id}>
                <Link
                  href={`/${locale}/flash/${design.id}`}
                  className={
                    design.isSoldOut
                      ? 'border-line block overflow-hidden rounded-lg border opacity-55'
                      : 'border-line hover:border-line-strong block overflow-hidden rounded-lg border transition-colors'
                  }
                >
                  <DesignThumb
                    seed={design.id}
                    imageUrl={design.imageUrl}
                    alt={`${design.artistName}의 플래시 도안`}
                  />
                  <div className="p-3">
                    <p className="text-fg text-sm font-medium" data-numeric>
                      {design.price}
                      {dict.common.won}
                    </p>
                    <p className="text-fg-muted mt-0.5 flex items-center gap-1 text-[0.6875rem]">
                      <Clock size={10} />
                      <span data-numeric>{design.estimatedTime}</span>
                      {dict.common.minutes}
                      {design.isSoldOut && <span className="ml-1">· {dict.flash.soldOut}</span>}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
