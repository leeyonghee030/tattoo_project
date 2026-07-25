import { cn } from '../lib/cn';

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  /** 지름. 기본 16px */
  size?: number;
}

/** 무채색 원형 스피너. currentColor를 따르므로 버튼 안에서도 색이 맞는다. */
export function Spinner({ size = 16, className, ...props }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="불러오는 중"
      className={cn('animate-spin', className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity={0.25} strokeWidth={3} />
      <path
        d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}
