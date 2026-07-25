import type { SessionUser } from '@tattoo/api-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { TOKEN_COOKIE, readTokenInfo } from '@/lib/auth';

/* ---------------------------------------------------------------------------
 * GET /api/auth/session
 *
 * 클라이언트 컴포넌트가 현재 로그인 상태를 알아야 할 때 쓴다(헤더 사용자명 등).
 * 토큰 자체는 절대 내려주지 않는다 — 이메일과 역할, 만료 시각만.
 * ------------------------------------------------------------------------- */

export async function GET() {
  const store = await cookies();
  const info = readTokenInfo(store.get(TOKEN_COOKIE)?.value);

  if (!info) {
    return NextResponse.json(
      { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
      { status: 401 },
    );
  }

  const session: SessionUser = {
    email: info.email,
    role: info.role,
    expiresAt: new Date(info.expiresAtMs).toISOString(),
  };

  // 세션 정보는 절대 캐시하면 안 된다. 캐시되면 로그아웃 후에도 이전 사용자가 보인다.
  return NextResponse.json(session, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
