'use client';

import type { SessionUser, UserRole } from '@tattoo/api-client';
import { Button, Field, Input } from '@tattoo/ui';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { BFF } from '@tattoo/api-client';

/* ---------------------------------------------------------------------------
 * 관리자 · 아티스트 공용 로그인 폼.
 *
 * BFF(/api/auth/login)를 호출한다. Spring을 직접 부르지 않는 이유는 lib/auth.ts에
 * 적어 뒀다 — 토큰을 httpOnly 쿠키에 두기 위해서다.
 *
 * README의 "로그인 실패 5회 시 계정 잠금"은 백엔드가 세는 값이다. 지금 백엔드에는
 * 시도 횟수 컬럼과 잠금 로직이 없다(AdminService/ArtistService는 실패 시 예외만 던진다).
 * 프론트는 서버가 ACCOUNT_LOCKED를 주면 그에 맞는 안내를 띄울 준비만 해 둔다.
 * ------------------------------------------------------------------------- */

interface LoginFormProps {
  role: UserRole;
  /** 로그인 성공 후 이동할 경로. 미들웨어가 넘긴 ?from= 값. */
  redirectTo: string;
}

export function LoginForm({ role, redirectTo }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [locked, setLocked] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch(BFF.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email: email.trim(), password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          code?: string;
          message?: string;
        };

        if (body.code === 'ACCOUNT_LOCKED') setLocked(true);
        setError(body.message ?? '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        // 비밀번호는 비운다. 실패 후 같은 값으로 재시도해도 결과가 같고,
        // 화면에 남겨두면 자리를 비웠을 때 노출된다.
        setPassword('');
        setPending(false);
        return;
      }

      // 응답에 토큰은 없다. 사용자 정보만 온다.
      (await response.json()) as SessionUser;

      // replace를 쓴다. push하면 뒤로가기로 로그인 화면에 돌아오는데,
      // 이미 로그인된 상태라 미들웨어가 다시 대시보드로 보내 깜빡임이 생긴다.
      router.replace(redirectTo);
    } catch {
      setError('네트워크 연결을 확인해 주세요.');
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="이메일" required>
        <Input
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          disabled={locked}
        />
      </Field>

      <Field label="비밀번호" error={error} required>
        <Input
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={locked}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              className="text-fg-subtle hover:text-fg rounded-sm p-0.5 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
      </Field>

      {locked && (
        <p className="border-danger-border bg-danger-bg text-danger rounded-md border px-3.5 py-3 text-[0.8125rem] leading-relaxed">
          계정이 잠겼습니다. 관리자에게 잠금 해제를 요청해 주세요.
        </p>
      )}

      <Button
        type="submit"
        size="xl"
        block
        loading={pending}
        disabled={locked || !email.trim() || !password}
      >
        로그인
      </Button>
    </form>
  );
}
