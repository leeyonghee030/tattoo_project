import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { repository } from '@/data';
import { isLocale } from '@/lib/i18n';

import { FlashReserveFunnel } from './flash-reserve-funnel';

export const metadata: Metadata = {
  title: '예약하기',
  // 예약 폼은 검색 결과에 노출될 이유가 없다.
  robots: { index: false, follow: false },
};

export default async function FlashReservePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const designId = Number(id);
  if (!Number.isInteger(designId)) notFound();

  const design = await repository.getFlashDesign(designId);
  if (!design) notFound();

  // 판매 종료 도안으로 예약 페이지에 직접 접근하는 경로를 막는다.
  // 목록에서는 막혀 있지만 URL을 직접 치거나 오래된 링크로 들어올 수 있다.
  if (design.isSoldOut) notFound();

  const [availability, depositPolicy] = await Promise.all([
    repository.getAvailability(design.artistId),
    repository.getDepositPolicy(),
  ]);

  return (
    <FlashReserveFunnel
      locale={locale}
      design={design}
      initialAvailability={availability}
      depositPolicy={depositPolicy}
    />
  );
}
