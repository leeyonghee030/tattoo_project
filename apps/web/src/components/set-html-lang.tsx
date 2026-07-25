'use client';

import * as React from 'react';

import type { Locale } from '@/lib/i18n';

/**
 * <html lang>을 현재 로케일로 맞춘다.
 *
 * 루트 레이아웃은 [locale] 세그먼트 위에 있어서 params를 받을 수 없고, html 태그는
 * 루트 레이아웃만 렌더할 수 있다. 그래서 로케일을 아는 하위 레이아웃에서 속성만 갱신한다.
 *
 * lang이 틀리면 스크린리더가 한국어를 영어 발음으로 읽고, 브라우저 번역과 하이픈
 * 처리도 어긋난다. 눈에 안 보이지만 실제로 영향이 있다.
 */
export function SetHtmlLang({ locale }: { locale: Locale }) {
  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
