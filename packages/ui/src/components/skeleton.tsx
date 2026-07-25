import { cn } from '../lib/cn';

/**
 * 로딩 자리표시자.
 *
 * 무채색이라 회전/펄스가 과하면 눈에 거슬린다. 투명도만 부드럽게 오가게 했다.
 * aria-hidden으로 스크린리더에서는 감춘다 — 로딩 상태는 부모의 aria-busy가 알린다.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('animate-shimmer bg-surface-strong rounded-md', className)}
      {...props}
    />
  );
}

/** 텍스트 여러 줄 자리표시자. 마지막 줄은 짧게 해서 실제 문단처럼 보이게 한다. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 && 'w-2/3')} />
      ))}
    </div>
  );
}
