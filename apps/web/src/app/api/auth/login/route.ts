import { API, ApiClient, type LoginResponse, type SessionUser } from '@tattoo/api-client';
import { asApiError } from '@tattoo/api-client';
import { NextResponse } from 'next/server';

import { TOKEN_COOKIE, cookieMaxAgeSeconds, isValidRole, readTokenInfo } from '@/lib/auth';
import { API_BASE_URL, IS_PRODUCTION, MOCK_AUTH } from '@/lib/env';

/* ---------------------------------------------------------------------------
 * POST /api/auth/login
 *
 * 브라우저 → 이 핸들러 → Spring /api/{admin|artist}/login
 *
 * 이 한 겹을 두는 이유:
 *   1) JWT를 httpOnly 쿠키에 심는다. 브라우저 JS가 토큰을 읽을 수 없다.
 *   2) 서버 간 호출이라 CORS 설정이 필요 없다. Spring의 WebConfig를 건드리지 않아도 된다.
 *   3) Spring 주소가 브라우저에 노출되지 않는다.
 *
 * 응답에는 토큰을 넣지 않는다. 넣으면 1번의 의미가 사라진다.
 * ------------------------------------------------------------------------- */

interface LoginBody {
  role?: unknown;
  email?: unknown;
  password?: unknown;
}

/** 백엔드 없이 화면만 확인할 때 쓰는 가짜 토큰 발급 (MOCK_AUTH=1). */
function createMockToken(email: string, role: 'Admin' | 'Artist'): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  // 서명 자리는 채우지만 유효하지 않다. Spring은 이 토큰을 거부한다 —
  // MOCK_AUTH는 화면 확인 전용이고 실제 API 호출과 함께 쓸 수 없다.
  return `${encode(header)}.${encode(payload)}.mock-signature-not-valid`;
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { code: 'VALIDATION_FAILED', message: '요청 형식이 잘못되었습니다.' },
      { status: 400 },
    );
  }

  const { role, email, password } = body;

  if (!isValidRole(role) || typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json(
      { code: 'VALIDATION_FAILED', message: '이메일과 비밀번호를 입력해 주세요.' },
      { status: 400 },
    );
  }
  if (!email.trim() || !password) {
    return NextResponse.json(
      { code: 'VALIDATION_FAILED', message: '이메일과 비밀번호를 입력해 주세요.' },
      { status: 400 },
    );
  }

  let token: string;

  if (MOCK_AUTH) {
    token = createMockToken(email.trim(), role);
  } else {
    const client = new ApiClient({ baseUrl: API_BASE_URL });
    const path = role === 'Admin' ? API.adminLogin : API.artistLogin;

    try {
      // loginAttempt를 켜서 500을 자격증명 오류로 해석한다.
      // 지금 백엔드가 로그인 실패를 RuntimeException으로 던져 500이 나오기 때문이다.
      // 자세한 배경은 packages/api-client/src/errors.ts 참고.
      const result = await client.post<LoginResponse>(
        path,
        { email: email.trim(), password },
        { loginAttempt: true },
      );
      token = result.token;
    } catch (error) {
      const apiError = asApiError(error);
      // 자격증명 오류는 401로 정규화해서 화면에 내려준다.
      // 백엔드가 500을 주더라도 프론트 계약은 401을 유지한다.
      const status = apiError.code === 'INVALID_CREDENTIALS' ? 401 : apiError.status || 502;
      return NextResponse.json({ code: apiError.code, message: apiError.message }, { status });
    }
  }

  const info = readTokenInfo(token);
  if (!info) {
    // 토큰을 받았지만 형식이 깨졌거나 이미 만료된 경우.
    return NextResponse.json(
      { code: 'UNKNOWN', message: '로그인 처리에 실패했습니다. 다시 시도해 주세요.' },
      { status: 502 },
    );
  }

  // 토큰의 role이 사용자가 로그인 시도한 role과 다르면 거부한다.
  // 아티스트 계정으로 관리자 로그인 화면을 통과하는 경로를 막는다.
  if (info.role !== role) {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: '이 화면으로는 로그인할 수 없는 계정입니다.' },
      { status: 403 },
    );
  }

  const session: SessionUser = {
    email: info.email,
    role: info.role,
    expiresAt: new Date(info.expiresAtMs).toISOString(),
  };

  const response = NextResponse.json(session);
  response.cookies.set({
    name: TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    // 개발은 http://localhost라 secure를 켜면 쿠키가 저장되지 않는다.
    secure: IS_PRODUCTION,
    // 'strict'로 두면 외부 링크(이메일 안내 등)를 타고 들어올 때 쿠키가 빠져
    // 로그인이 풀린 것처럼 보인다. 'lax'가 이 용도에 맞다.
    sameSite: 'lax',
    path: '/',
    maxAge: cookieMaxAgeSeconds(info.expiresAtMs),
  });

  return response;
}
