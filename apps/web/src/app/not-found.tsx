import { Button } from '@tattoo/ui';
import Link from 'next/link';

/**
 * 404 화면.
 *
 * 루트에 두면 모든 세그먼트의 notFound()가 여기로 온다. 로케일을 알 수 없어
 * 한국어로 표시하되, 홈 링크는 로케일 없는 '/'로 보낸다 — 미들웨어가 로케일을 붙여준다.
 */
export default function NotFound() {
  return (
    <div className="max-w-narrow mx-auto flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="text-display text-fg-subtle" data-numeric>
        404
      </p>
      <h1 className="text-title text-fg mt-4">페이지를 찾을 수 없습니다</h1>
      <p className="text-fg-muted mt-3 text-[0.9375rem] leading-relaxed">
        주소가 바뀌었거나 삭제된 페이지일 수 있습니다.
        <br />
        예약을 확인하려면 예약 조회를 이용해 주세요.
      </p>
      <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/">처음으로</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/ko/reservations/lookup">예약 조회</Link>
        </Button>
      </div>
    </div>
  );
}
