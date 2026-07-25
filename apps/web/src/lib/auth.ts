import type { UserRole } from '@tattoo/api-client';

/* ---------------------------------------------------------------------------
 * 인증 — httpOnly 쿠키 기반 세션.
 *
 * 흐름
 *   브라우저 → POST /api/auth/login (Next Route Handler)
 *            → Route Handler가 Spring /api/{role}/login 호출
 *            → 받은 JWT를 httpOnly 쿠키에 심고 화면에는 사용자 정보만 반환
 *   이후 요청 → Route Handler / 서버 컴포넌트가 쿠키에서 토큰을 읽어
 *              Authorization 헤더로 Spring에 전달
 *
 * localStorage에 토큰을 두지 않는 이유: XSS 한 번이면 토큰이 그대로 유출되고,
 * 백엔드에 리프레시 토큰이 없어서 탈취되면 24시간 내내 유효하다. httpOnly 쿠키는
 * JS로 읽을 수 없으므로 그 경로가 막힌다.
 * ------------------------------------------------------------------------- */

export const TOKEN_COOKIE = 'tt_token';

/** JWT payload 중 우리가 쓰는 필드. util/JwtUtil.java의 generateToken과 짝을 이룬다. */
interface JwtPayload {
  /** subject — 이메일 */
  sub?: string;
  /** role 클레임 — 'Admin' | 'Artist' */
  role?: string;
  /** 만료 시각 (초 단위 epoch) */
  exp?: number;
}

/**
 * JWT payload를 서명 검증 없이 읽는다.
 *
 * ⚠️ 이 함수는 인증 판단에 쓰면 안 된다. 서명을 확인하지 않으므로 사용자가 payload를
 * 위조할 수 있다. 진짜 검증은 Spring의 JwtInterceptor가 SECRET_KEY로 수행한다.
 * 여기서 payload를 읽는 목적은 UX 뿐이다 — 어떤 화면으로 보낼지, 만료가 임박했는지,
 * 헤더에 어떤 이름을 띄울지. 서버가 401을 주면 그게 최종 판단이다.
 */
export function decodeJwtUnsafe(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const payloadSegment = parts[1];
  if (!payloadSegment) return null;

  try {
    // base64url → base64. '=' 패딩을 4의 배수로 맞춰야 atob이 실패하지 않는다.
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json =
      typeof atob === 'function' ? atob(padded) : Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isValidRole(value: unknown): value is UserRole {
  return value === 'Admin' || value === 'Artist';
}

export interface TokenInfo {
  email: string;
  role: UserRole;
  /** 만료 시각 (밀리초 epoch) */
  expiresAtMs: number;
}

/** 토큰에서 화면이 필요한 정보만 뽑는다. 형식이 깨졌거나 이미 만료면 null. */
export function readTokenInfo(token: string | undefined): TokenInfo | null {
  if (!token) return null;

  const payload = decodeJwtUnsafe(token);
  if (!payload?.sub || !isValidRole(payload.role) || !payload.exp) return null;

  const expiresAtMs = payload.exp * 1000;
  if (expiresAtMs <= Date.now()) return null;

  return { email: payload.sub, role: payload.role, expiresAtMs };
}

/** 역할별 로그인 후 기본 진입 경로 */
export function homePathForRole(role: UserRole): string {
  return role === 'Admin' ? '/admin' : '/artist';
}

/** 역할별 로그인 화면 경로 */
export function loginPathForRole(role: UserRole): string {
  return role === 'Admin' ? '/admin/login' : '/artist/login';
}

/**
 * 쿠키 만료를 JWT 만료에 맞춘다.
 *
 * 쿠키를 더 길게 잡으면 사용자는 로그인된 것처럼 보이는데 API는 401을 뱉는
 * 어긋난 상태가 된다. 짧게 잡으면 아직 유효한 토큰을 버리게 된다.
 */
export function cookieMaxAgeSeconds(expiresAtMs: number): number {
  return Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
}
