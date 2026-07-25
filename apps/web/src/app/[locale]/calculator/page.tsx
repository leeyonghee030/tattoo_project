import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { repository } from '@/data';
import { getDictionary, isLocale } from '@/lib/i18n';

import { CalculatorForm } from './calculator-form';

export const metadata: Metadata = {
  title: '미니타투 계산기',
  description: '크기·색상·부위를 고르면 예상 금액을 계산해 드립니다.',
};

export default async function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const config = await repository.getCalculatorConfig();

  return (
    <div className="max-w-narrow mx-auto px-4 py-14">
      <header className="mb-9">
        <h1 className="text-title text-fg">{dict.calculator.title}</h1>
        <p className="text-fg-muted mt-2.5 text-[0.9375rem] leading-relaxed">
          {dict.calculator.description}
        </p>
      </header>

      <CalculatorForm locale={locale} config={config} />
    </div>
  );
}
