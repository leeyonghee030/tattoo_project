import { notFound } from 'next/navigation';

import { SetHtmlLang } from '@/components/set-html-lang';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { repository } from '@/data';
import { LOCALES, isLocale } from '@/lib/i18n';

/** 두 로케일 모두 빌드 시점에 정적 생성한다. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // 미들웨어가 걸러주지만, 직접 /xx/ 로 들어오는 경우를 방어한다.
  if (!isLocale(locale)) notFound();

  const content = await repository.getSiteContent();

  return (
    <>
      <SetHtmlLang locale={locale} />
      <div className="flex min-h-dvh flex-col">
        <SiteHeader locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} content={content} />
      </div>
    </>
  );
}
