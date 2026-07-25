import { ReservationStatus, type ReservationStatusCode } from '@tattoo/api-client';
import { Badge, type BadgeProps } from '@tattoo/ui';

import { getDictionary, type Locale } from '@/lib/i18n';

/* ---------------------------------------------------------------------------
 * 예약 상태 → 배지 매핑.
 *
 * 색이 아니라 "채움 강도"로 상태를 구분한다. 배치 근거:
 *   확정        → solid   가장 강함. 끝난 일이고 확실하다.
 *   입금확인대기 → outline 진행 중. 누군가의 행동을 기다린다.
 *   대기        → muted   막 시작. 아직 아무 일도 안 일어났다.
 *   무응답      → dashed  점선 = 미완결. 흐지부지 끝났다는 시각적 은유.
 *   취소        → subtle  취소선 + 가장 옅게. 더 볼 필요 없다.
 *
 * 흑백 인쇄물로 출력해도, 색약 사용자가 봐도 같은 순서로 읽힌다.
 * ------------------------------------------------------------------------- */

const TONE_BY_STATUS: Record<ReservationStatusCode, NonNullable<BadgeProps['tone']>> = {
  [ReservationStatus.CONFIRMED]: 'solid',
  [ReservationStatus.PAYMENT_PENDING]: 'outline',
  [ReservationStatus.WAITING]: 'muted',
  [ReservationStatus.NO_RESPONSE]: 'dashed',
  [ReservationStatus.CANCELLED]: 'subtle',
};

const LABEL_KEY_BY_STATUS = {
  [ReservationStatus.WAITING]: 'waiting',
  [ReservationStatus.PAYMENT_PENDING]: 'paymentPending',
  [ReservationStatus.CONFIRMED]: 'confirmed',
  [ReservationStatus.NO_RESPONSE]: 'noResponse',
  [ReservationStatus.CANCELLED]: 'cancelled',
} as const satisfies Record<
  ReservationStatusCode,
  keyof ReturnType<typeof getDictionary>['status']
>;

export interface ReservationStatusBadgeProps {
  status: ReservationStatusCode;
  locale?: Locale;
  size?: BadgeProps['size'];
}

export function ReservationStatusBadge({
  status,
  locale = 'ko',
  size = 'md',
}: ReservationStatusBadgeProps) {
  const dict = getDictionary(locale);
  const label = dict.status[LABEL_KEY_BY_STATUS[status]];

  return (
    <Badge tone={TONE_BY_STATUS[status]} size={size} dot>
      {label}
    </Badge>
  );
}

/** 관리자 필터 드롭다운 등에서 쓰는 상태 목록. 화면 표시 순서를 여기서 정한다. */
export function statusOptions(locale: Locale = 'ko') {
  const dict = getDictionary(locale);
  return (
    [
      ReservationStatus.WAITING,
      ReservationStatus.PAYMENT_PENDING,
      ReservationStatus.CONFIRMED,
      ReservationStatus.NO_RESPONSE,
      ReservationStatus.CANCELLED,
    ] as const
  ).map((status) => ({
    value: status,
    label: dict.status[LABEL_KEY_BY_STATUS[status]],
  }));
}
