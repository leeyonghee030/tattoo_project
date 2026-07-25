import { NextResponse, type NextRequest } from 'next/server';

import { TOKEN_COOKIE, readTokenInfo } from './lib/auth';
import { DEFAULT_LOCALE, LOCALES, isLocale } from './lib/i18n';

/* ---------------------------------------------------------------------------
 * proxy — 요청이 페이지에 닿기 전에 두 가지 일을 한다.
 *
 * (Next 16에서 `middleware` 파일 규약이 `proxy`로 대체됐다. 파일명은 proxy.ts,
 *  내보내는 함수 이름도 `proxy`여야 한다. matcher 설정은 `config` 그대로다.)
 *
 *  1) 로케일 정리: '/'로 들어오면 Accept-Language를 보고 '/ko' 또는 '/en'으로 보낸다.
 *  2) 역할 가드: /admin/*, /artist/*는 해당 역할 토큰이 없으면 로그인 화면으로 보낸다.
 *
 * ⚠️ 이 가드는 보안 경계가 아니다. proxy는 서명을 검증하지 않고 payload만 읽는다
 *   (Edge 런타임에서 SECRET_KEY를 다루지 않기 위한 선택이다). 즉 사용자가 payload를
 *   위조하면 화면까지는 도달할 수 있다. 실제 데이터는 전부 Spring의 JwtInterceptor를
 *   통과해야 하므로 위조 토큰으로는 아무것도 조회되지 않는다.
 *   여기서 막는 목적은 "로그인 안 한 사람에게 빈 대시보드를 보여주지 않는 것"이다.
 * ------------------------------------------------------------------------- */

/** Accept-Language에서 지원 로케일 하나를 고른다. */
function pickLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language');
  if (!header) return DEFAULT_LOCALE;

  // 'ko-KR,ko;q=0.9,en-US;q=0.8' → ['ko-KR', 'ko', 'en-US']
  const requested = header
    .split(',')
    .map((part) => part.split(';')[0]?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value));

  for (const tag of requested) {
    const base = tag.split('-')[0];
    if (base && (LOCALES as readonly string[]).includes(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── 역할 가드 ─────────────────────────────────────── */
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');
  const isArtistArea = pathname === '/artist' || pathname.startsWith('/artist/');

  if (isAdminArea || isArtistArea) {
    const requiredRole = isAdminArea ? 'Admin' : 'Artist';
    const loginPath = isAdminArea ? '/admin/login' : '/artist/login';

    // 로그인 화면 자체는 통과시킨다. 아니면 리다이렉션 루프가 생긴다.
    if (pathname === loginPath) {
      const info = readTokenInfo(request.cookies.get(TOKEN_COOKIE)?.value);
      // 이미 로그인한 사용자가 로그인 화면에 오면 대시보드로 보낸다.
      if (info?.role === requiredRole) {
        return NextResponse.redirect(new URL(isAdminArea ? '/admin' : '/artist', request.url));
      }
      return NextResponse.next();
    }

    const info = readTokenInfo(request.cookies.get(TOKEN_COOKIE)?.value);

    if (!info || info.role !== requiredRole) {
      const url = new URL(loginPath, request.url);
      // 로그인 후 원래 가려던 곳으로 되돌려보내기 위해 경로를 남긴다.
      // 오픈 리다이렉트를 막기 위해 경로만(쿼리·호스트 제외) 넘긴다.
      if (pathname !== loginPath) url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  /* ── 로케일 정리 ───────────────────────────────────── */
  const firstSegment = pathname.split('/')[1] ?? '';
  if (isLocale(firstSegment)) return NextResponse.next();

  // 로케일이 없는 공개 경로는 감지한 로케일을 붙여 리다이렉트한다.
  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  /*
   * 제외 대상
   *   api/*        — BFF 라우트 핸들러. 로케일을 붙이면 안 된다.
   *   _next/*      — 프레임워크 정적 자산
   *   확장자 있는 요청 — 이미지·폰트·robots.txt 등
   */
  matcher: ['/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)'],
};
