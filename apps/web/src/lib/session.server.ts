import 'server-only';

import type { SessionUser } from '@tattoo/api-client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE, loginPathForRole, readTokenInfo } from './auth';

/**
 * 서버 컴포넌트에서 현재 세션을 읽는다. 없으면 null.
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const info = readTokenInfo(store.get(TOKEN_COOKIE)?.value);
  if (!info) return null;

  return {
    email: info.email,
    role: info.role,
    expiresAt: new Date(info.expiresAtMs).toISOString(),
  };
}

/**
 * 특정 역할의 세션을 요구한다. 없거나 역할이 다르면 로그인 화면으로 보낸다.
 *
 * 미들웨어가 이미 걸러주지만 여기서 한 번 더 확인한다. 미들웨어 matcher가 바뀌거나
 * 새 경로가 패턴에서 빠지면 가드가 조용히 사라지는데, 레이아웃에서 직접 확인하면
 * 그런 실수가 화면까지 도달하지 않는다.
 */
export async function requireSession(role: SessionUser['role']): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== role) {
    redirect(loginPathForRole(role));
  }
  return session;
}
