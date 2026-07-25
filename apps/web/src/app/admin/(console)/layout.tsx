import { ConsoleShell, type NavGroup } from '@/components/console-shell';
import { requireSession } from '@/lib/session.server';

/* ---------------------------------------------------------------------------
 * 관리자 콘솔 레이아웃.
 *
 * (console) 라우트 그룹으로 감싼 이유: /admin/login이 이 레이아웃에 포함되면
 * requireSession이 로그인 화면에서도 실행되어 무한 리다이렉트가 된다.
 * 라우트 그룹은 URL에 나타나지 않으므로 /admin 경로는 그대로 유지된다.
 *
 * 메뉴는 README '1.1 페이지 구조'의 6개 도메인을 그대로 따랐다.
 * href가 없는 항목은 아직 화면이 없어 '준비 중'으로 표시된다.
 * ------------------------------------------------------------------------- */

const NAV_GROUPS: NavGroup[] = [
  {
    title: '현황·분석',
    items: [
      { label: '대시보드', href: '/admin' },
      { label: '통계', pending: true },
    ],
  },
  {
    title: '예약 운영',
    items: [
      { label: '예약 관리', href: '/admin/reservations' },
      { label: '고객 관리', pending: true },
      { label: '캘린더 관리', pending: true },
    ],
  },
  {
    title: '아티스트',
    items: [{ label: '아티스트 관리', pending: true }],
  },
  {
    title: '콘텐츠·상품',
    items: [
      { label: '플래시도안 관리', pending: true },
      { label: '상품 관리', pending: true },
      { label: '팝업·공지·FAQ', pending: true },
      { label: '콘텐츠 관리', pending: true },
    ],
  },
  {
    title: '예약 설정',
    items: [
      { label: '미니타투 계산기', pending: true },
      { label: '커스텀 진행단계', pending: true },
      { label: '이메일·슬랙 관리', pending: true },
    ],
  },
  {
    title: '시스템·보안',
    items: [
      { label: '연동 테스트', pending: true },
      { label: '보안', pending: true },
      { label: '시스템 관리', pending: true },
    ],
  },
];

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('Admin');

  return (
    <ConsoleShell session={session} groups={NAV_GROUPS} title="관리자">
      {children}
    </ConsoleShell>
  );
}
