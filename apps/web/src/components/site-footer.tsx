import type { SiteContent } from '@tattoo/api-client';
import Link from 'next/link';

import { getDictionary, type Locale } from '@/lib/i18n';

interface SiteFooterProps {
  locale: Locale;
  content: SiteContent;
}

export function SiteFooter({ locale, content }: SiteFooterProps) {
  const dict = getDictionary(locale);

  const socials = [
    { label: 'Instagram', href: content.socialLinks.instagram },
    { label: 'KakaoTalk', href: content.socialLinks.kakao },
    { label: 'LINE', href: content.socialLinks.line },
    { label: 'WhatsApp', href: content.socialLinks.whatsapp },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <footer className="border-line bg-surface mt-24 border-t">
      <div className="max-w-wide mx-auto grid gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-fg text-[0.9375rem] font-bold tracking-[-0.02em]">
            BLANK<span className="text-fg-subtle"> TATTOO</span>
          </p>
          <p className="text-fg-muted mt-3 text-sm leading-relaxed">{content.shopAddress}</p>
          {content.shopMapUrl && (
            <a
              href={content.shopMapUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-fg decoration-line-strong hover:decoration-fg mt-2 inline-block text-sm underline underline-offset-4 transition-colors"
            >
              지도에서 보기
            </a>
          )}
        </div>

        <div>
          <h2 className="text-fg-subtle text-xs font-semibold">{dict.footer.hours}</h2>
          <dl className="text-fg-muted mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt>화 – 일</dt>
              <dd data-numeric>11:00 – 20:00</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>월</dt>
              <dd>정기 휴무</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-fg-subtle text-xs font-semibold">{dict.footer.contact}</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fg-muted hover:text-fg transition-colors"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-line border-t">
        <div className="max-w-wide text-fg-subtle mx-auto flex flex-col gap-3 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 BLANK TATTOO. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href={`/${locale}/guide`} className="hover:text-fg-muted transition-colors">
              {dict.footer.terms}
            </Link>
            <Link href={`/${locale}/guide`} className="hover:text-fg-muted transition-colors">
              {dict.footer.privacy}
            </Link>
            {/* 운영자 진입점. 고객에게는 필요 없지만 링크가 아예 없으면 URL을 외워야 한다. */}
            <Link href="/admin/login" className="hover:text-fg-muted transition-colors">
              관리자
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
