import {
  ReservationStatus,
  type Artist,
  type AvailabilityResponse,
  type AvailabilitySlot,
  type CalculatorConfig,
  type CustomReservation,
  type CustomReservationOptions,
  type DashboardSummary,
  type DateString,
  type DepositPolicy,
  type FaqEntry,
  type FlashDesign,
  type FlashReservation,
  type Notice,
  type Paginated,
  type Reservation,
  type SiteContent,
} from '@tattoo/api-client';

import type {
  CreateCustomReservationInput,
  CreateFlashReservationInput,
  FlashDesignFilter,
  ReservationFilter,
  TattooRepository,
} from './repository';
import {
  ARTISTS,
  ARTIST_ACCOUNTS,
  CALCULATOR_CONFIG,
  CUSTOM_OPTIONS,
  DEPOSIT_POLICY,
  FAQ,
  FLASH_DESIGNS,
  NOTICES,
  RESERVATIONS,
  SITE_CONTENT,
} from './seed';

/* ---------------------------------------------------------------------------
 * 목 저장소.
 *
 * 상태를 모듈 변수에 담는다. 개발 서버가 재시작되면 초기화되고, 프로세스가 여러 개면
 * 서로 공유되지 않는다. 목이니까 그래도 된다 — 실제 영속성은 백엔드의 몫이다.
 *
 * 서버 전용이다. 클라이언트 컴포넌트에서 직접 import하면 시드 데이터가 번들에 실려
 * 브라우저로 내려간다. 화면은 서버 컴포넌트나 Server Action을 통해서만 접근한다.
 * ------------------------------------------------------------------------- */

/** 시드를 복사해서 시작한다. 원본을 직접 수정하면 재시작 없이도 오염이 누적된다. */
let reservations: Reservation[] = RESERVATIONS.map((r) => ({ ...r }));
let nextId = 9100;
let nextNumber = 155;

function issueReservationNumber(): string {
  return `TT-2026-${String(nextNumber++).padStart(4, '0')}`;
}

/** 네트워크 지연을 흉내 낸다. 로딩 상태·스켈레톤이 실제로 보이는지 확인하려면 필요하다. */
function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDateKey(date: Date): DateString {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 문자열에서 안정적인 정수를 만든다.
 *
 * Math.random을 쓰면 같은 날짜를 두 번 조회할 때 예약 가능 시간이 달라져서, 사용자가
 * 뒤로 갔다 오면 방금 고른 시간이 사라지는 버그처럼 보인다. 날짜+아티스트로 해시를
 * 만들면 항상 같은 결과가 나온다.
 */
function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const OPEN_HOURS = ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function paginate<T>(items: T[], page = 1, size = 20): Paginated<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;

  return {
    items: items.slice(start, start + size),
    page: safePage,
    size,
    totalItems,
    totalPages,
  };
}

export const mockRepository: TattooRepository = {
  async listArtists(): Promise<Artist[]> {
    await delay();
    return ARTISTS.filter((a) => a.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async getArtist(id) {
    await delay();
    return ARTISTS.find((a) => a.id === id && a.isActive) ?? null;
  },

  async listFlashDesigns(filter: FlashDesignFilter = {}) {
    await delay();
    let items = [...FLASH_DESIGNS];

    if (filter.artistId !== undefined) {
      items = items.filter((d) => d.artistId === filter.artistId);
    }
    if (filter.genre) {
      items = items.filter((d) => d.genre === filter.genre);
    }
    if (filter.category) {
      items = items.filter((d) => d.category === filter.category);
    }

    // 판매 종료 도안은 목록에 남기지만 뒤로 밀어낸다. 아예 숨기면
    // "어제 봤던 도안이 사라졌다"는 문의가 생긴다.
    items.sort((a, b) => {
      if (a.isSoldOut !== b.isSoldOut) return a.isSoldOut ? 1 : -1;
      return a.displayOrder - b.displayOrder;
    });

    return paginate(items, filter.page, filter.size ?? 12);
  },

  async getFlashDesign(id): Promise<FlashDesign | null> {
    await delay();
    return FLASH_DESIGNS.find((d) => d.id === id) ?? null;
  },

  async getAvailability(artistId, date): Promise<AvailabilityResponse> {
    await delay();

    const today = new Date();
    // 예약 가능 기간: 오늘부터 60일. 관리자의 '예약 가능 기간' 설정에 대응한다.
    const horizonDays = 60;
    const maxDateObj = new Date(today);
    maxDateObj.setDate(maxDateObj.getDate() + horizonDays);

    const availableDates: DateString[] = [];
    for (let offset = 2; offset <= horizonDays; offset++) {
      const candidate = new Date(today);
      candidate.setDate(candidate.getDate() + offset);

      // 월요일 정기 휴무
      if (candidate.getDay() === 1) continue;

      const key = toDateKey(candidate);
      // 아티스트별로 약 1/4은 마감된 날로 만든다 (휴가·정원 마감)
      if (stableHash(`${artistId}:${key}`) % 4 === 0) continue;

      availableDates.push(key);
    }

    const response: AvailabilityResponse = {
      artistId,
      availableDates,
      maxDate: toDateKey(maxDateObj),
    };

    if (date) {
      // 이미 확정된 예약이 있는 시간은 taken으로 표시한다.
      const confirmedTimes = new Set(
        reservations
          .filter(
            (r): r is FlashReservation =>
              r.type === 'FLASH' &&
              r.artistId === artistId &&
              r.preferredDate === date &&
              (r.status === ReservationStatus.CONFIRMED ||
                r.status === ReservationStatus.PAYMENT_PENDING),
          )
          .map((r) => r.preferredTime),
      );

      const slots: AvailabilitySlot[] = OPEN_HOURS.map((time) => ({
        time,
        taken: confirmedTimes.has(time) || stableHash(`${artistId}:${date}:${time}`) % 5 === 0,
      }));

      response.slots = slots;
    }

    return response;
  },

  async getDepositPolicy(): Promise<DepositPolicy> {
    await delay(60);
    return DEPOSIT_POLICY;
  },

  async getCalculatorConfig(): Promise<CalculatorConfig> {
    await delay(60);
    return CALCULATOR_CONFIG;
  },

  async getCustomOptions(): Promise<CustomReservationOptions> {
    await delay(60);
    // readonly 시드를 가변 배열로 복사한다. 계약상 이 값은 관리자가 편집하는
    // 목록이므로 readonly가 아니다.
    return {
      genres: [...CUSTOM_OPTIONS.genres],
      bodyParts: [...CUSTOM_OPTIONS.bodyParts],
      sizes: CUSTOM_OPTIONS.sizes.map((size) => ({ ...size })),
      genders: [...CUSTOM_OPTIONS.genders],
      ages: [...CUSTOM_OPTIONS.ages],
    };
  },

  async getSiteContent(): Promise<SiteContent> {
    await delay(60);
    return SITE_CONTENT;
  },

  async listNotices(): Promise<Notice[]> {
    await delay(60);
    return [...NOTICES].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  },

  async listFaq(): Promise<FaqEntry[]> {
    await delay(60);
    return [...FAQ].sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async createFlashReservation(input: CreateFlashReservationInput): Promise<FlashReservation> {
    await delay(400);

    const design = FLASH_DESIGNS.find((d) => d.id === input.flashDesignId);
    if (!design) throw new Error('존재하지 않는 도안입니다.');
    if (design.isSoldOut) throw new Error('판매가 종료된 도안입니다.');

    // 같은 아티스트·날짜·시간에 살아 있는 예약이 있으면 거부한다.
    // 이 검사가 없으면 두 고객이 같은 시간을 잡고 나중에 사람이 수동으로 정리해야 한다.
    const conflict = reservations.some(
      (r) =>
        r.type === 'FLASH' &&
        r.artistId === design.artistId &&
        r.preferredDate === input.preferredDate &&
        r.preferredTime === input.preferredTime &&
        (r.status === ReservationStatus.WAITING ||
          r.status === ReservationStatus.PAYMENT_PENDING ||
          r.status === ReservationStatus.CONFIRMED),
    );
    if (conflict) throw new Error('선택한 시간이 방금 예약되었습니다.');

    const created: FlashReservation = {
      id: nextId++,
      type: 'FLASH',
      reservationNumber: issueReservationNumber(),
      status: ReservationStatus.WAITING,
      email: input.email,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      requestedAt: new Date().toISOString(),
      flashDesignId: design.id,
      flashDesignImageUrl: design.imageUrl,
      artistId: design.artistId,
      artistName: design.artistName,
      contactChannelUrl: SITE_CONTENT.socialLinks.kakao ?? null,
      adminMemo: null,
    };

    reservations = [created, ...reservations];
    return created;
  },

  async createCustomReservation(input: CreateCustomReservationInput): Promise<CustomReservation> {
    await delay(400);

    const artist = input.artistId ? ARTISTS.find((a) => a.id === input.artistId) : undefined;

    const created: CustomReservation = {
      id: nextId++,
      type: 'CUSTOM',
      reservationNumber: issueReservationNumber(),
      status: ReservationStatus.WAITING,
      email: input.email,
      // 날짜를 안 고른 경우도 허용한다 — 커스텀은 상담에서 정해도 된다.
      preferredDate: input.preferredDate ?? '',
      requestedAt: new Date().toISOString(),
      artistId: artist?.id ?? null,
      artistName: artist?.artistName ?? null,
      tattooGenre: input.tattooGenre,
      bodyPart: input.bodyPart,
      tattooSize: input.tattooSize,
      gender: input.gender,
      age: input.age,
      funnel: input.funnel ?? null,
      contactChannelUrl: SITE_CONTENT.socialLinks.kakao ?? null,
      progressStep: '상담 대기',
      adminMemo: null,
    };

    reservations = [created, ...reservations];
    return created;
  },

  async markDepositPaid(reservationNumber): Promise<Reservation> {
    await delay(300);

    const index = reservations.findIndex((r) => r.reservationNumber === reservationNumber);
    if (index === -1) throw new Error('예약을 찾을 수 없습니다.');

    const target = reservations[index]!;
    if (target.status !== ReservationStatus.WAITING) {
      // 이미 눌렀거나 상태가 넘어간 경우. 에러 대신 현재 상태를 돌려준다 —
      // 중복 클릭을 실패로 처리하면 사용자는 뭔가 잘못됐다고 느낀다.
      return target;
    }

    const updated = { ...target, status: ReservationStatus.PAYMENT_PENDING } as Reservation;
    reservations = reservations.map((r, i) => (i === index ? updated : r));
    return updated;
  },

  async lookupReservation(reservationNumber, email): Promise<Reservation | null> {
    await delay(300);

    const normalizedNumber = reservationNumber.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    return (
      reservations.find(
        (r) =>
          r.reservationNumber.toUpperCase() === normalizedNumber &&
          r.email.toLowerCase() === normalizedEmail,
      ) ?? null
    );
  },

  async getMyArtistProfile(email): Promise<Artist | null> {
    await delay(80);
    const mappedId = ARTIST_ACCOUNTS[email.trim().toLowerCase()];
    // 매핑에 없으면 첫 아티스트로 대체한다. 이유는 seed.ts의 ARTIST_ACCOUNTS 주석 참고.
    return ARTISTS.find((artist) => artist.id === mappedId) ?? ARTISTS[0] ?? null;
  },

  async getDashboard(scope): Promise<DashboardSummary> {
    await delay(200);

    // 아티스트는 본인 예약만 본다. 이 필터가 빠지면 다른 아티스트의 고객 정보가 노출된다.
    const scoped =
      scope.role === 'Artist'
        ? reservations.filter((r) => r.artistId === scope.artistId)
        : reservations;

    const todayKey = toDateKey(new Date());

    return {
      todayReservationCount: scoped.filter((r) => r.preferredDate === todayKey).length,
      waitingCount: scoped.filter((r) => r.status === ReservationStatus.WAITING).length,
      paymentPendingCount: scoped.filter((r) => r.status === ReservationStatus.PAYMENT_PENDING)
        .length,
      confirmedThisMonthCount: scoped.filter(
        (r) => r.status === ReservationStatus.CONFIRMED && r.preferredDate.startsWith('2026-08'),
      ).length,
      recentReservations: [...scoped]
        .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
        .slice(0, 6),
      monthlyTrend: [
        { month: '2026-02', count: 18 },
        { month: '2026-03', count: 24 },
        { month: '2026-04', count: 21 },
        { month: '2026-05', count: 31 },
        { month: '2026-06', count: 27 },
        { month: '2026-07', count: 34 },
      ],
    };
  },

  async listReservations(filter: ReservationFilter = {}) {
    await delay(200);
    let items = [...reservations];

    if (filter.type) items = items.filter((r) => r.type === filter.type);
    if (filter.status !== undefined) items = items.filter((r) => r.status === filter.status);
    if (filter.artistId !== undefined) items = items.filter((r) => r.artistId === filter.artistId);

    if (filter.q) {
      const q = filter.q.trim().toLowerCase();
      items = items.filter(
        (r) =>
          r.reservationNumber.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.artistName?.toLowerCase().includes(q) ?? false),
      );
    }

    items.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
    return paginate(items, filter.page, filter.size ?? 20);
  },
};
