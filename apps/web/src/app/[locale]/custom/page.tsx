import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { repository } from '@/data';
import { isLocale } from '@/lib/i18n';

import { CustomFunnel } from './custom-funnel';

export const metadata: Metadata = {
  title: '커스텀 예약',
  description: '장르와 부위, 크기를 알려주시면 아티스트가 도안부터 함께 만들어 갑니다.',
};

export default async function CustomPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [artists, options, depositPolicy, availability] = await Promise.all([
    repository.listArtists(),
    repository.getCustomOptions(),
    repository.getDepositPolicy(),
    // 커스텀은 아티스트를 나중에 정할 수 있어서, 달력은 특정 아티스트가 아닌
    // 샵 전체의 영업일을 보여준다. 아티스트별 마감은 상담에서 조정한다.
    // artistId 0은 "특정 아티스트 없음"을 뜻하는 관례값이다.
    repository.getAvailability(0),
  ]);

  return (
    <CustomFunnel
      locale={locale}
      artists={artists}
      options={options}
      availability={availability}
      depositPolicy={depositPolicy}
    />
  );
}
