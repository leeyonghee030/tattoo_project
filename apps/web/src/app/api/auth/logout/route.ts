import { API, ApiClient } from '@tattoo/api-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { TOKEN_COOKIE, readTokenInfo } from '@/lib/auth';
import { API_BASE_URL, MOCK_AUTH } from '@/lib/env';

/* ---------------------------------------------------------------------------
 * POST /api/auth/logout
 *
 * Spring의 로그아웃은 토큰을 블랙리스트 테이블에 넣는다(LogoutService).
 * 쿠키만 지우면 토큰 자체는 만료까지 24시간 동안 유효하게 남아, 어딘가 복사돼 있다면
 * 계속 쓸 수 있다. 그래서 백엔드 호출을 먼저 시도한다.
 *
 * 단, 백엔드 호출이 실패해도 쿠키는 반드시 지운다. 안 지우면 사용자는 로그아웃 버튼을
 * 눌렀는데도 로그인 상태로 남아 더 나쁜 상황이 된다.
 * ------------------------------------------------------------------------- */

export async function POST() {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  const info = readTokenInfo(token);

  if (token && info && !MOCK_AUTH) {
    const client = new ApiClient({
      baseUrl: API_BASE_URL,
      getToken: () => token,
      timeoutMs: 5_000,
    });
    const path = info.role === 'Admin' ? API.adminLogout : API.artistLogout;

    try {
      await client.post(path);
    } catch {
      // 블랙리스트 등록 실패는 로그아웃을 막을 이유가 되지 않는다.
      // 아래에서 쿠키를 지워 클라이언트 세션은 확실히 끊는다.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(TOKEN_COOKIE);
  return response;
}
