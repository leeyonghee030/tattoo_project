import type { Metadata } from 'next';
import Link from 'next/link';

import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: '관리자 로그인',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  // 오픈 리다이렉트 방지: 같은 사이트의 /admin 하위 경로만 허용한다.
  // '//evil.com'은 브라우저가 프로토콜 상대 URL로 해석하므로 반드시 걸러야 한다.
  const redirectTo = from && from.startsWith('/admin') && !from.startsWith('//') ? from : '/admin';

  return (
    <div className="flex min-h-dvh flex-col justify-center px-4 py-12">
      <div className="max-w-narrow mx-auto w-full">
        <header className="mb-9">
          <p className="text-fg text-sm font-bold tracking-[-0.02em]">
            BLANK<span className="text-fg-subtle"> TATTOO</span>
          </p>
          <h1 className="text-title text-fg mt-4">관리자 로그인</h1>
          <p className="text-fg-muted mt-2 text-sm">5회 이상 실패하면 계정이 잠깁니다.</p>
        </header>

        <LoginForm role="Admin" redirectTo={redirectTo} />

        <div className="mt-8 flex items-center justify-between text-[0.8125rem]">
          <Link
            href="/artist/login"
            className="text-fg-muted decoration-line-strong hover:text-fg underline underline-offset-4 transition-colors"
          >
            아티스트 로그인
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
