'use client';

import { BFF, type SessionUser } from '@tattoo/api-client';
import { Button, Sheet, SheetContent, SheetTitle, SheetTrigger, cn } from '@tattoo/ui';
import { LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { ThemeToggle } from './theme-toggle';

/* ---------------------------------------------------------------------------
 * 운영 콘솔 셸 (관리자 · 아티스트 공용).
 *
 * README의 관리자 메뉴는 6개 도메인 15개 화면이다. 평평한 목록으로 늘어놓으면
 * 원하는 메뉴를 눈으로 찾는 데 시간이 걸린다. 도메인별로 묶고 그룹 제목을 두면
 * "예약 관련" → "예약 관리" 두 단계로 좁혀진다.
 *
 * 아직 구현되지 않은 화면도 메뉴에 노출하고 '준비 중' 표시를 한다. 숨기면 무엇이
 * 남았는지 알 수 없고, 링크만 걸면 404가 난다.
 * ------------------------------------------------------------------------- */

export interface NavItem {
  label: string;
  href?: string;
  /** 아직 화면이 없는 메뉴. 흐리게 표시하고 클릭을 막는다. */
  pending?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

interface ConsoleShellProps {
  session: SessionUser;
  groups: NavGroup[];
  /** 셸 좌상단 제목 */
  title: string;
  children: React.ReactNode;
}

export function ConsoleShell({ session, groups, title, children }: ConsoleShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch(BFF.logout, { method: 'POST' });
    } finally {
      // 실패해도 로그인 화면으로 보낸다. BFF가 쿠키를 지우는 건 보장되어 있고,
      // 실패 시 사용자를 콘솔에 남겨두면 더 혼란스럽다.
      router.replace(session.role === 'Admin' ? '/admin/login' : '/artist/login');
    }
  };

  const nav = (
    <nav className="flex flex-col gap-6" aria-label="콘솔 메뉴">
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="text-fg-subtle mb-1.5 px-3 text-[0.6875rem] font-semibold tracking-wide uppercase">
            {group.title}
          </h2>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = item.href
                ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                : false;

              if (!item.href || item.pending) {
                return (
                  <li key={item.label}>
                    <span
                      className="text-fg-subtle flex cursor-not-allowed items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
                      title="아직 준비되지 않은 화면입니다"
                    >
                      {item.label}
                      <span className="bg-surface-strong shrink-0 rounded-sm px-1.5 py-0.5 text-[0.625rem] font-medium">
                        준비 중
                      </span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded-md px-3 py-2 text-sm transition-colors duration-150',
                      active
                        ? 'bg-accent text-fg-onaccent font-semibold'
                        : 'text-fg-muted hover:bg-surface-strong hover:text-fg',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="bg-bg min-h-dvh">
      {/* ── 상단 바 ─────────────────────────────────────── */}
      <header className="border-line bg-bg sticky top-0 z-40 border-b">
        <div className="flex h-14 items-center gap-3 px-4">
          {/* 모바일 메뉴 */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="메뉴 열기">
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent className="max-h-[80dvh]">
              <SheetTitle className="sr-only">콘솔 메뉴</SheetTitle>
              <div className="pt-2">{nav}</div>
            </SheetContent>
          </Sheet>

          <Link href={session.role === 'Admin' ? '/admin' : '/artist'} className="shrink-0">
            <span className="text-fg text-sm font-bold tracking-[-0.02em]">BLANK</span>
            <span className="text-fg-subtle ml-1.5 text-sm font-medium">{title}</span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            {/* 이메일은 좁은 화면에서 숨긴다. 로그아웃 버튼 자리를 잡아먹으면 안 된다. */}
            <span className="text-fg-muted mr-2 hidden max-w-48 truncate text-[0.8125rem] sm:block">
              {session.email}
            </span>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              loading={loggingOut}
              aria-label="로그아웃"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── 사이드바 (데스크톱) ─────────────────────────
            top/height를 헤더 높이만큼 offset해서 사이드바가 독립적으로 스크롤된다.
            메뉴가 15개라 본문과 같이 스크롤되면 아래 메뉴에 닿기 어렵다. */}
        <aside className="border-line sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r px-3 py-6 lg:block">
          {nav}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-7 sm:px-6 lg:px-8">
          <div className="max-w-admin mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
