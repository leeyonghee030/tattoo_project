'use client';

import { ReservationStatus, type ReservationStatusCode } from '@tattoo/api-client';
import { Button, useToast } from '@tattoo/ui';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { markDepositPaidAction } from '@/actions/reservations';
import { getDictionary, type Locale } from '@/lib/i18n';

/**
 * '입금을 완료했어요' 버튼.
 *
 * README 시나리오 1의 "고객 입금완료 버튼 클릭" 단계다. 누르면 상태가
 * 대기 → 입금확인대기로 넘어간다.
 *
 * 되돌릴 수 없는 동작이지만 확인 모달을 두지 않았다. 잘못 눌러도 손해가 없고
 * (관리자가 실제 입금을 확인하는 단계가 뒤에 있다), 모달을 끼우면 이미 입금한
 * 사용자에게 불필요한 단계가 하나 늘어난다.
 */
export function DepositActions({
  locale,
  reservationNumber,
  status,
}: {
  locale: Locale;
  reservationNumber: string;
  status: ReservationStatusCode;
}) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);

  if (status !== ReservationStatus.WAITING) {
    if (status === ReservationStatus.PAYMENT_PENDING) {
      return (
        <div className="bg-surface-strong text-fg-muted flex items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-sm font-medium">
          <Check size={16} />
          {dict.reserve.markPaidDone}
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    setPending(true);
    const result = await markDepositPaidAction(reservationNumber);

    if (!result.ok) {
      setPending(false);
      toast(result.message, { tone: 'error' });
      return;
    }

    toast('입금 확인 요청이 전달되었습니다.', { tone: 'success' });
    // 서버 컴포넌트를 다시 렌더해 상태 배지를 갱신한다.
    router.refresh();
    setPending(false);
  };

  return (
    <Button size="xl" block loading={pending} onClick={handleClick}>
      {dict.reserve.markPaid}
    </Button>
  );
}
