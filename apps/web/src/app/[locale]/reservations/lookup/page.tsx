import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getDictionary, isLocale } from '@/lib/i18n';

import { LookupForm } from './lookup-form';

export const metadata: Metadata = {
  title: '예약 조회',
  description: '예약번호와 이메일로 예약 진행 상황을 확인할 수 있습니다.',
};

export default async function LookupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="max-w-narrow mx-auto px-4 py-14 sm:py-20">
      <header className="mb-9">
        <h1 className="text-title text-fg">{dict.lookup.title}</h1>
        <p className="text-fg-muted mt-2.5 text-[0.9375rem] leading-relaxed">
          {dict.lookup.description}
        </p>
      </header>

      <LookupForm locale={locale} />
    </div>
  );
}
