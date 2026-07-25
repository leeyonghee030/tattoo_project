import type { Metadata } from 'next';
import Link from 'next/link';

import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: '아티스트 로그인',
  robots: { index: false, follow: false },
};

export default async function ArtistLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  // 오픈 리다이렉트 방지: 같은 사이트의 /artist 하위 경로만 허용한다.
  const redirectTo =
    from && from.startsWith('/artist') && !from.startsWith('//') ? from : '/artist';

  return (
    <div className="flex min-h-dvh flex-col justify-center px-4 py-12">
      <div className="max-w-narrow mx-auto w-full">
        <header className="mb-9">
          <p className="text-fg text-sm font-bold tracking-[-0.02em]">
            BLANK<span className="text-fg-subtle"> TATTOO</span>
          </p>
          <h1 className="text-title text-fg mt-4">아티스트 로그인</h1>
          <p className="text-fg-muted mt-2 text-sm">
            계정이 잠겼다면 관리자에게 해제를 요청해 주세요.
          </p>
        </header>

        <LoginForm role="Artist" redirectTo={redirectTo} />

        <div className="mt-8 flex items-center justify-between text-[0.8125rem]">
          <Link
            href="/admin/login"
            className="text-fg-muted decoration-line-strong hover:text-fg underline underline-offset-4 transition-colors"
          >
            관리자 로그인
          </Link>
          <Link
            href="/"
            className="text-fg-muted decoration-line-strong hover:text-fg underline underline-offset-4 transition-colors"
          >
            사이트로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
