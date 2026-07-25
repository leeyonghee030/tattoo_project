'use client';

import { Button } from '@tattoo/ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import * as React from 'react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'tt-theme';
/** 같은 페이지에 토글이 두 개 있어도 서로 동기화되도록 커스텀 이벤트로 알린다. */
const THEME_EVENT = 'tt-theme-change';

/* ---------------------------------------------------------------------------
 * 현재 테마는 React state가 아니라 <html data-theme> 속성에 있다.
 *
 * 그 속성은 layout.tsx의 인라인 스크립트가 첫 페인트 전에 심는다(다크 모드 사용자에게
 * 흰 화면이 번쩍이지 않게 하려고). 즉 React가 마운트되는 시점에 이미 값이 존재한다.
 *
 * useEffect로 localStorage를 읽어 setState하면 렌더가 한 번 더 돌고, React 19의
 * set-state-in-effect 규칙에도 걸린다. DOM은 "외부 시스템"이므로 그걸 구독하는
 * 정식 API인 useSyncExternalStore를 쓴다. 서버 스냅샷은 'system'이고, 하이드레이션
 * 직후 React가 실제 값을 다시 읽어 필요하면 한 번 리렌더한다.
 * ------------------------------------------------------------------------- */

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(THEME_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_EVENT, onStoreChange);
}

function getSnapshot(): Theme {
  const attribute = document.documentElement.getAttribute('data-theme');
  return attribute === 'light' || attribute === 'dark' ? attribute : 'system';
}

/** 서버에는 DOM이 없다. 속성 없음 = 시스템 설정 따르기와 같은 의미다. */
function getServerSnapshot(): Theme {
  return 'system';
}

/**
 * 라이트 / 다크 / 시스템 순환 토글.
 *
 * '시스템'을 선택지에 넣는 이유: 작업실 조명처럼 하루 중 밝기가 바뀌는 환경에서
 * 사용자가 매번 수동으로 바꾸지 않아도 되게 한다. 시스템을 고르면 data-theme 속성을
 * 제거해 CSS의 prefers-color-scheme 미디어 쿼리가 다시 주도권을 갖는다.
 */
export function ThemeToggle() {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const apply = (next: Theme) => {
    if (next === 'system') {
      localStorage.removeItem(STORAGE_KEY);
      document.documentElement.removeAttribute('data-theme');
    } else {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute('data-theme', next);
    }
    // 속성만 바꾸면 useSyncExternalStore가 변경을 알 수 없다. 직접 알린다.
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const cycle = () => {
    apply(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system');
  };

  const label =
    theme === 'system' ? '시스템 설정 사용 중' : theme === 'light' ? '라이트 모드' : '다크 모드';

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={cycle}
      aria-label={`화면 테마 변경 (현재: ${label})`}
      title={label}
    >
      {theme === 'system' ? (
        <Monitor size={16} />
      ) : theme === 'light' ? (
        <Sun size={16} />
      ) : (
        <Moon size={16} />
      )}
    </Button>
  );
}
