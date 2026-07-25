'use server';

import { asApiError, type Reservation } from '@tattoo/api-client';

import { repository } from '@/data';

/* ---------------------------------------------------------------------------
 * 예약 관련 Server Action.
 *
 * 클라이언트 컴포넌트(퍼널)에서 직접 호출한다. 별도 API 라우트를 만들지 않은 이유:
 * 라우트를 만들면 같은 검증 로직을 두 번 쓰게 되고, 타입도 경계에서 끊긴다.
 * Server Action은 함수 호출처럼 쓰면서 타입이 이어진다.
 *
 * 모든 액션은 예외를 던지지 않고 { ok, ... } 형태로 돌려준다. 던지면 클라이언트에서
 * Next의 일반 에러 화면이 뜨는데, 예약 흐름 도중에 그 화면이 나오면 사용자는
 * 자기 입력이 날아갔다고 판단하고 이탈한다. 폼 안에서 문구로 보여줘야 한다.
 * ------------------------------------------------------------------------- */

export type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };

function isValidEmail(value: string): boolean {
  // 완벽한 검증은 불가능하고 불필요하다. 오타 수준만 걸러내고, 최종 확인은
  // 실제 메일 발송으로 이뤄진다.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export interface FlashReservationFormData {
  flashDesignId: number;
  preferredDate: string;
  preferredTime: string;
  email: string;
  privacyAgreed: boolean;
}

export async function createFlashReservationAction(
  input: FlashReservationFormData,
): Promise<ActionResult<Reservation>> {
  if (!input.preferredDate || !input.preferredTime) {
    return { ok: false, message: '날짜와 시간을 선택해 주세요.' };
  }
  if (!isValidEmail(input.email)) {
    return { ok: false, message: '이메일 주소를 다시 확인해 주세요.' };
  }
  if (!input.privacyAgreed) {
    return { ok: false, message: '개인정보처리방침에 동의해 주세요.' };
  }

  try {
    const created = await repository.createFlashReservation(input);
    return { ok: true, data: created };
  } catch (error) {
    // 저장소가 Error를 던지는 경우(목)와 ApiError를 던지는 경우(http)를 모두 처리한다.
    if (error instanceof Error && !('code' in error)) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: asApiError(error).message };
  }
}

export interface CustomReservationFormData {
  artistId: number | null;
  tattooGenre: string;
  bodyPart: string;
  tattooSize: string;
  gender: string;
  age: string;
  preferredDate: string | null;
  email: string;
  privacyAgreed: boolean;
}

export async function createCustomReservationAction(
  input: CustomReservationFormData,
): Promise<ActionResult<Reservation>> {
  // 아티스트와 날짜는 건너뛸 수 있다(상담에서 정해도 되는 항목).
  // 나머지는 도안 작업 견적에 필요하므로 필수다.
  const missing = [
    !input.tattooGenre && '스타일',
    !input.bodyPart && '부위',
    !input.tattooSize && '크기',
    !input.gender && '성별',
    !input.age && '연령대',
  ].filter((value): value is string => Boolean(value));

  if (missing.length > 0) {
    return { ok: false, message: `${missing.join(', ')}를 선택해 주세요.` };
  }
  if (!isValidEmail(input.email)) {
    return { ok: false, message: '이메일 주소를 다시 확인해 주세요.' };
  }
  if (!input.privacyAgreed) {
    return { ok: false, message: '개인정보처리방침에 동의해 주세요.' };
  }

  try {
    const created = await repository.createCustomReservation(input);
    return { ok: true, data: created };
  } catch (error) {
    if (error instanceof Error && !('code' in error)) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: asApiError(error).message };
  }
}

export async function markDepositPaidAction(
  reservationNumber: string,
): Promise<ActionResult<Reservation>> {
  try {
    const updated = await repository.markDepositPaid(reservationNumber);
    return { ok: true, data: updated };
  } catch (error) {
    if (error instanceof Error && !('code' in error)) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: asApiError(error).message };
  }
}

export async function lookupReservationAction(
  reservationNumber: string,
  email: string,
): Promise<ActionResult<Reservation>> {
  if (!reservationNumber.trim() || !email.trim()) {
    return { ok: false, message: '예약번호와 이메일을 모두 입력해 주세요.' };
  }

  try {
    const found = await repository.lookupReservation(reservationNumber, email);
    if (!found) {
      return {
        ok: false,
        message: '예약을 찾을 수 없습니다. 예약번호와 이메일을 다시 확인해 주세요.',
      };
    }
    return { ok: true, data: found };
  } catch (error) {
    return { ok: false, message: asApiError(error).message };
  }
}

/** 특정 아티스트·날짜의 예약 가능 시간. 퍼널에서 날짜를 고를 때마다 호출한다. */
export async function fetchAvailabilityAction(artistId: number, date: string) {
  try {
    const availability = await repository.getAvailability(artistId, date);
    return { ok: true as const, data: availability };
  } catch (error) {
    return { ok: false as const, message: asApiError(error).message };
  }
}
