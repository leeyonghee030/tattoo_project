import { ConsoleShell, type NavGroup } from '@/components/console-shell';
import { requireSession } from '@/lib/session.server';

/* ---------------------------------------------------------------------------
 * 아티스트 콘솔 레이아웃.
 *
 * 메뉴는 README '2.1 페이지 구조'를 따랐다. 관리자와 달리 도메인이 얕아서
 * 그룹을 두 개로만 나눴다 — 여섯 개 항목을 여섯 그룹으로 쪼개면 제목이 항목보다 많아진다.
 * ------------------------------------------------------------------------- */

const NAV_GROUPS: NavGroup[] = [
  {
    title: '내 작업',
    items: [
      { label: '대시보드', href: '/artist' },
      { label: '예약 관리', href: '/artist/reservations' },
      { label: '플래시도안 관리', pending: true },
    ],
  },
  {
    title: '내 정보',
    items: [
      { label: '프로필 관리', pending: true },
      { label: '통계', pending: true },
      { label: '연동 상태', pending: true },
    ],
  },
];

export default async function ArtistConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('Artist');

  return (
    <ConsoleShell session={session} groups={NAV_GROUPS} title="아티스트">
      {children}
    </ConsoleShell>
  );
}
