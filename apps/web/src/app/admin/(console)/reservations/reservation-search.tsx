'use client';

import { Input } from '@tattoo/ui';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

/**
 * 예약 검색 입력.
 *
 * 입력할 때마다 요청하지 않고 400ms 디바운스한다. 관리자가 예약번호를 타이핑하면
 * 글자마다 서버 조회가 나가는데, 목록이 매번 깜빡여서 오히려 읽기 어렵다.
 *
 * 검색어를 URL에 반영하는 이유: 결과를 동료에게 링크로 보낼 수 있고,
 * 뒤로가기가 검색 취소로 동작한다.
 */
export function ReservationSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(initialQuery);

  /*
   * 외부에서 URL이 바뀐 경우(뒤로가기 등) 입력값을 맞춰준다.
   *
   * useEffect로 하지 않는 이유: 렌더가 한 번 더 돌고 React 19의 set-state-in-effect
   * 규칙에 걸린다. "prop이 바뀌면 state를 조정한다"는 이 패턴이 React 공식 권장 방식이다.
   * 렌더 중에 setState하면 React가 DOM을 건드리기 전에 즉시 다시 렌더하므로 깜빡임이 없다.
   *
   * key로 컴포넌트를 리마운트하는 방법은 쓸 수 없다 — 타이핑 중에 우리가 직접 URL을
   * 바꾸기 때문에 입력칸이 리마운트되면서 포커스가 날아간다.
   */
  const [syncedQuery, setSyncedQuery] = React.useState(initialQuery);
  if (syncedQuery !== initialQuery) {
    setSyncedQuery(initialQuery);
    setValue(initialQuery);
  }

  const pushQuery = React.useCallback(
    (nextQuery: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextQuery.trim()) params.set('q', nextQuery.trim());
      else params.delete('q');
      // 검색어가 바뀌면 1페이지로. 5페이지에서 검색하면 빈 결과가 나온다.
      params.delete('page');

      const qs = params.toString();
      router.replace(`/admin/reservations${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, searchParams],
  );

  React.useEffect(() => {
    // 초기값과 같으면 불필요한 라우팅을 하지 않는다.
    if (value === initialQuery) return;

    const timer = setTimeout(() => pushQuery(value), 400);
    return () => clearTimeout(timer);
  }, [value, initialQuery, pushQuery]);

  return (
    <Input
      sizeVariant="md"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="예약번호 · 이메일 · 아티스트명"
      autoCapitalize="none"
      spellCheck={false}
      className="max-w-md"
      prefix={<Search size={15} />}
      suffix={
        value ? (
          <button
            type="button"
            onClick={() => {
              setValue('');
              pushQuery('');
            }}
            aria-label="검색어 지우기"
            className="text-fg-subtle hover:text-fg rounded-sm p-0.5 transition-colors"
          >
            <X size={14} />
          </button>
        ) : undefined
      }
    />
  );
}
