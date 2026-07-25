import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge에 우리 커스텀 테마 값을 알려준다.
 *
 * 등록하지 않으면 tailwind-merge가 `text-title`(폰트 크기)과 `text-fg-muted`(색)를
 * 같은 그룹으로 오인해 뒤에 온 클래스가 앞을 지워버린다. radius/shadow/ease도 마찬가지로
 * 기본값 목록에 없는 이름이라 충돌 해석이 틀어진다.
 *
 * 여기 목록은 packages/ui/src/styles/index.css의 `@theme inline` 선언과 짝을 이룬다.
 * 토큰을 추가하면 이 목록도 같이 갱신해야 한다.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'bg',
        'surface',
        'surface-strong',
        'surface-inset',
        'fg',
        'fg-muted',
        'fg-subtle',
        'fg-onaccent',
        'line',
        'line-strong',
        'accent',
        'accent-hover',
        'accent-active',
        'danger',
        'danger-bg',
        'danger-border',
      ],
      text: ['display', 'title', 'subtitle'],
      radius: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      shadow: ['xs', 'sm', 'md', 'lg', 'overlay'],
      ease: ['out-quint', 'smooth', 'spring'],
      container: ['narrow', 'content', 'wide', 'admin'],
      animate: [
        'slide-up',
        'slide-left',
        'slide-right',
        'fade-in',
        'scale-in',
        'sheet-in',
        'shimmer',
      ],
    },
  },
});

/** 조건부 클래스 결합 + Tailwind 충돌 해결 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
