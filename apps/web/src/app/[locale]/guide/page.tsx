import { Card } from '@tattoo/ui';
import { MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { repository } from '@/data';
import { getDictionary, isLocale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: '이용 안내',
  description: '샵 위치, 시술 후 관리법, 자주 묻는 질문을 모았습니다.',
};

export default async function GuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const [content, faq, notices] = await Promise.all([
    repository.getSiteContent(),
    repository.listFaq(),
    repository.listNotices(),
  ]);

  return (
    <div className="max-w-content mx-auto px-4 py-14 sm:px-6">
      <h1 className="text-title text-fg">{dict.nav.guide}</h1>

      {/* ── 위치 ───────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-subtitle text-fg">위치</h2>
        <Card variant="filled" padding="md" className="mt-4">
          <p className="text-fg flex items-start gap-2 text-[0.9375rem]">
            <MapPin size={17} className="text-fg-muted mt-0.5 shrink-0" />
            {content.shopAddress}
          </p>
          {content.shopMapUrl && (
            <a
              href={content.shopMapUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-fg decoration-line-strong hover:decoration-fg mt-3 inline-block text-sm underline underline-offset-4 transition-colors"
            >
              지도에서 보기
            </a>
          )}
        </Card>
      </section>

      {/* ── 관리법 ─────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="text-subtitle text-fg">시술 후 관리법</h2>
        <p className="text-fg-muted mt-4 text-[0.9375rem] leading-relaxed whitespace-pre-line">
          {content.aftercareGuide}
        </p>
      </section>

      {/* ── FAQ ────────────────────────────────────────
          <details>를 쓴 이유: JS 없이 동작하고, 스크린리더와 키보드 조작이 기본 지원되고,
          Ctrl+F 브라우저 검색에 접힌 내용도 잡힌다. 커스텀 아코디언은 그 셋을 다 잃는다. */}
      <section className="mt-12">
        <h2 className="text-subtitle text-fg">자주 묻는 질문</h2>
        <div className="divide-line border-line mt-4 divide-y border-y">
          {faq.map((entry) => (
            <details key={entry.id} className="group">
              <summary className="text-fg flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[0.9375rem] font-medium [&::-webkit-details-marker]:hidden">
                {entry.question}
                <span
                  aria-hidden
                  className="text-fg-subtle shrink-0 transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="text-fg-muted pb-5 text-[0.875rem] leading-relaxed">{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── 공지 ───────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="text-subtitle text-fg">{dict.home.sectionNotice}</h2>
        <ul className="mt-4 space-y-4">
          {notices.map((notice) => (
            <li key={notice.id} className="border-line border-b pb-4 last:border-0">
              <div className="flex items-baseline gap-2">
                {notice.isPinned && (
                  <span className="bg-accent text-fg-onaccent shrink-0 rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-bold">
                    공지
                  </span>
                )}
                <h3 className="text-fg text-[0.9375rem] font-semibold">{notice.title}</h3>
              </div>
              <p className="text-fg-muted mt-1.5 text-sm leading-relaxed">{notice.body}</p>
              <time
                className="text-fg-subtle mt-2 block text-xs"
                dateTime={notice.createdAt}
                data-numeric
              >
                {notice.createdAt.slice(0, 10)}
              </time>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
