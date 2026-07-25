import { cn } from '@tattoo/ui';

/* ---------------------------------------------------------------------------
 * DesignThumb — 도안 썸네일.
 *
 * imageUrl이 있으면 이미지를, 없으면 id로 결정되는 무채색 기하 패턴을 그린다.
 *
 * 외부 플레이스홀더 서비스(placehold.co 등)를 쓰지 않은 이유: 오프라인이나 CSP가
 * 걸린 환경에서 전부 깨진 이미지가 되고, 회색 박스에 "600x800" 글자가 박혀 있으면
 * 디자인 검토가 불가능하다. 패턴은 항상 렌더되고, 흑백 기반 디자인 안에서 의도된
 * 그래픽처럼 보인다.
 *
 * 같은 도안은 항상 같은 패턴이 나온다(id 기반). 새로고침마다 바뀌면 목록에서
 * 특정 도안을 눈으로 추적할 수 없다.
 * ------------------------------------------------------------------------- */

const PATTERN_COUNT = 6;

function Pattern({ seed }: { seed: number }) {
  const variant = seed % PATTERN_COUNT;
  // 같은 패턴 안에서도 밀도를 조금씩 다르게 한다.
  const density = 4 + (seed % 4);

  return (
    <svg
      viewBox="0 0 100 125"
      className="text-fg size-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {variant === 0 && (
        // 동심원 — 라인워크
        <g fill="none" stroke="currentColor" strokeOpacity={0.28} strokeWidth={0.7}>
          {Array.from({ length: density + 3 }).map((_, i) => (
            <circle key={i} cx={50} cy={62} r={6 + i * 5.5} />
          ))}
        </g>
      )}

      {variant === 1 && (
        // 방사선 — 미니멀
        <g stroke="currentColor" strokeOpacity={0.24} strokeWidth={0.6}>
          {Array.from({ length: density * 4 }).map((_, i) => {
            const angle = (i / (density * 4)) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={50}
                y1={62}
                x2={50 + Math.cos(angle) * 60}
                y2={62 + Math.sin(angle) * 60}
              />
            );
          })}
          <circle cx={50} cy={62} r={14} fill="var(--tt-surface)" stroke="none" />
          <circle cx={50} cy={62} r={14} fill="none" strokeOpacity={0.5} strokeWidth={0.8} />
        </g>
      )}

      {variant === 2 && (
        // 점묘 — 도트워크
        <g fill="currentColor" fillOpacity={0.3}>
          {Array.from({ length: 11 }).map((_, row) =>
            Array.from({ length: 9 }).map((_, col) => {
              // 중앙에서 멀어질수록 점이 작아진다 — 그라데이션 느낌
              const dx = (col - 4) / 4;
              const dy = (row - 5) / 5;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const r = Math.max(0.4, 2.4 - distance * 1.8);
              return <circle key={`${row}-${col}`} cx={10 + col * 10} cy={12 + row * 10} r={r} />;
            }),
          )}
        </g>
      )}

      {variant === 3 && (
        // 중첩 삼각형 — 지오메트릭
        <g fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={0.7}>
          {Array.from({ length: density + 2 }).map((_, i) => {
            const inset = i * 6;
            return (
              <polygon
                key={i}
                points={`50,${18 + inset} ${86 - inset},${104 - inset} ${14 + inset},${104 - inset}`}
              />
            );
          })}
        </g>
      )}

      {variant === 4 && (
        // 물결 — 동양화 번짐
        <g fill="none" stroke="currentColor" strokeOpacity={0.26} strokeWidth={0.8}>
          {Array.from({ length: density + 6 }).map((_, i) => {
            const y = 16 + i * 8;
            return (
              <path
                key={i}
                d={`M-5 ${y} Q 25 ${y - 7}, 50 ${y} T 105 ${y}`}
                strokeOpacity={0.3 - i * 0.012}
              />
            );
          })}
        </g>
      )}

      {variant === 5 && (
        // 교차 해칭 — 블랙워크
        <g stroke="currentColor" strokeOpacity={0.22} strokeWidth={0.55}>
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={`a${i}`} x1={-20 + i * 9} y1={-10} x2={20 + i * 9} y2={135} />
          ))}
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={`b${i}`} x1={120 - i * 9} y1={-10} x2={80 - i * 9} y2={135} />
          ))}
        </g>
      )}
    </svg>
  );
}

export interface DesignThumbProps {
  /** 패턴을 결정하는 씨앗. 도안 id를 넘긴다. */
  seed: number;
  /** 있으면 이미지를 우선 표시한다. */
  imageUrl?: string | null;
  alt: string;
  className?: string;
  /** 종횡비. 목록은 4/5, 상세는 1/1을 쓴다. */
  ratio?: '4/5' | '1/1' | '3/4';
}

export function DesignThumb({ seed, imageUrl, alt, className, ratio = '4/5' }: DesignThumbProps) {
  return (
    <div
      className={cn(
        'bg-surface-strong relative overflow-hidden',
        ratio === '4/5' && 'aspect-4/5',
        ratio === '1/1' && 'aspect-square',
        ratio === '3/4' && 'aspect-3/4',
        className,
      )}
    >
      {imageUrl ? (
        // next/image를 쓰지 않는다: 도안 이미지는 관리자가 올린 임의 도메인일 수 있고,
        // remotePatterns를 미리 알 수 없다. 실제 CDN이 정해지면 next/image로 바꾼다.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={alt} className="size-full object-cover" loading="lazy" />
      ) : (
        <>
          <Pattern seed={seed} />
          <span className="sr-only">{alt}</span>
        </>
      )}
    </div>
  );
}
