import { ToastProvider } from '@tattoo/ui';
import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'BLANK TATTOO',
    template: '%s · BLANK TATTOO',
  },
  description: '도안을 고르고 날짜를 정하면, 나머지는 아티스트가 맞춰 드립니다.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // 확대를 막지 않는다. maximumScale=1은 저시력 사용자의 확대를 봉쇄한다.
  maximumScale: 5,
  // 라이트/다크에서 브라우저 UI(주소창) 색을 맞춘다.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

/**
 * 첫 페인트 전에 테마를 확정하는 스크립트.
 *
 * React가 마운트된 뒤에 테마를 적용하면 다크 모드 사용자에게 흰 화면이 한 번
 * 번쩍인다(FOUC). 무채색 디자인에서는 이 번쩍임이 특히 눈에 아프다. 그래서 동기
 * 인라인 스크립트로 <html>에 data-theme를 먼저 박는다.
 *
 * 저장된 값이 없으면 아무것도 하지 않는다 — 그 경우 CSS의
 * prefers-color-scheme 미디어 쿼리가 알아서 처리한다.
 */
const themeInitScript = `
try {
  var stored = localStorage.getItem('tt-theme');
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.setAttribute('data-theme', stored);
  }
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang은 공개 라우트에서 [locale]/layout이 클라이언트에서 갱신한다.
    // 루트 레이아웃은 [locale] 세그먼트 위에 있어 params를 받을 수 없다.
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
