import { Card } from '@tattoo/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DesignThumb } from '@/components/design-thumb';
import { repository } from '@/data';
import { getDictionary, isLocale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: '아티스트',
  description: '작업 성향과 주력 장르를 보고 아티스트를 고르세요.',
};

export default async function ArtistsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const artists = await repository.listArtists();

  return (
    <div className="max-w-wide mx-auto px-4 py-14 sm:px-6">
      <header className="mb-10">
        <h1 className="text-title text-fg">{dict.nav.artists}</h1>
        <p className="text-fg-muted mt-2 text-[0.9375rem]">{dict.home.sectionArtistsDesc}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <li key={artist.id}>
            <Link href={`/${locale}/artists/${artist.id}`} className="block h-full">
              <Card variant="interactive" padding="none" className="flex h-full flex-col">
                <DesignThumb
                  seed={artist.id * 7}
                  imageUrl={artist.artistImageUrl}
                  alt={`${artist.artistName} 프로필`}
                  ratio="4/5"
                />
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-subtitle text-fg">{artist.artistName}</h2>

                  <ul className="mt-2 flex flex-wrap gap-1">
                    {artist.genres.map((genre) => (
                      <li
                        key={genre}
                        className="bg-surface-strong text-fg-muted rounded-sm px-1.5 py-0.5 text-[0.6875rem]"
                      >
                        {genre}
                      </li>
                    ))}
                  </ul>

                  {artist.introduce ? (
                    <p className="text-fg-muted mt-3 line-clamp-3 text-[0.8125rem] leading-relaxed">
                      {artist.introduce}
                    </p>
                  ) : (
                    <p className="text-fg-subtle mt-3 text-[0.8125rem]">소개글이 준비 중입니다.</p>
                  )}
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
