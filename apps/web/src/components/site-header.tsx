'use client';

import { Button, Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger, cn } from '@tattoo/ui';
import { Languages, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { getDictionary, type Locale } from '@/lib/i18n';

import { ThemeToggle } from './theme-toggle';

/* ---------------------------------------------------------------------------
 * 공개 사이트 상단 헤더.
 *
 * 데스크톱은 링크를 펼치고, 모바일은 바텀시트로 접는다. 모바일에서 예약 CTA는
 * 접지 않고 헤더에 남겨 둔다 — 메뉴를 열어야 예약할 수 있으면 한 단계가 늘어난다.
 * ------------------------------------------------------------------------- */

interface SiteHeaderProps {
  locale: Locale;
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navItems = [
    { href: `/${locale}/artists`, label: dict.nav.artists },
    { href: `/${locale}/flash`, label: dict.nav.flash },
    { href: `/${locale}/custom`, label: dict.nav.custom },
    { href: `/${locale}/calculator`, label: dict.nav.calculator },
    { href: `/${locale}/guide`, label: dict.nav.guide },
    { href: `/${locale}/reservations/lookup`, label: dict.nav.lookup },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // 로케일 전환: 현재 경로의 첫 세그먼트만 교체해 같은 화면에 머문다.
  // 홈으로 보내버리면 사용자가 보고 있던 도안을 다시 찾아야 한다.
  const otherLocale: Locale = locale === 'ko' ? 'en' : 'ko';
  const localeSwitchHref = (() => {
    const segments = pathname.split('/');
    segments[1] = otherLocale;
    return segments.join('/') || `/${otherLocale}`;
  })();

  return (
    <header className="border-line bg-bg/85 supports-[backdrop-filter]:bg-bg/70 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="max-w-wide mx-auto flex h-14 items-center gap-4 px-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="text-fg shrink-0 text-[0.9375rem] font-bold tracking-[-0.02em]"
        >
          BLANK<span className="text-fg-subtle"> TATTOO</span>
        </Link>

        {/* 데스크톱 내비게이션 */}
        <nav className="hidden flex-1 items-center gap-0.5 lg:flex" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive(item.href)
                  ? 'bg-surface-strong text-fg'
                  : 'text-fg-muted hover:bg-surface hover:text-fg',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={localeSwitchHref} aria-label={`언어 변경: ${otherLocale.toUpperCase()}`}>
              <Languages size={16} />
            </Link>
          </Button>

          <ThemeToggle />

          <Button size="sm" className="ml-1 hidden sm:inline-flex" asChild>
            <Link href={`/${locale}/flash`}>{dict.nav.reserve}</Link>
          </Button>

          {/* 모바일 메뉴 */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="메뉴 열기">
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">주요 메뉴</SheetTitle>
              <nav className="flex flex-col gap-1 pt-1" aria-label="주요 메뉴">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'rounded-lg px-4 py-3.5 text-[0.9375rem] font-medium transition-colors',
                        isActive(item.href)
                          ? 'bg-surface-strong text-fg'
                          : 'text-fg-muted active:bg-surface',
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <SheetClose asChild>
                <Button size="lg" block className="mt-4" asChild>
                  <Link href={`/${locale}/flash`}>{dict.nav.reserve}</Link>
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
