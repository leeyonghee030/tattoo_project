import type {
  Artist,
  AvailabilityResponse,
  CalculatorConfig,
  CustomReservation,
  CustomReservationOptions,
  DashboardSummary,
  DateString,
  DepositPolicy,
  FaqEntry,
  FlashDesign,
  FlashReservation,
  Notice,
  Paginated,
  Reservation,
  ReservationStatusCode,
  SiteContent,
  TimeString,
} from '@tattoo/api-client';

/* ---------------------------------------------------------------------------
 * 데이터 소스 인터페이스.
 *
 * 화면은 이 인터페이스만 안다. 구현이 목이든 Spring 호출이든 화면 코드는 그대로다.
 * 백엔드가 엔드포인트를 하나씩 구현할 때마다 http 구현에서 해당 메서드만 실제 호출로
 * 바꾸면 되고, 나머지는 계속 목으로 돌아간다.
 *
 * MSW를 쓰지 않은 이유: App Router의 서버 컴포넌트에서 fetch를 가로채려면
 * instrumentation 기반 노드 통합이 필요하고 초기화 순서가 불안정하다. 인터페이스로
 * 갈라두면 그 복잡도 없이 같은 효과를 얻고, 계약 위반이 런타임이 아니라 타입 검사에서
 * 잡힌다.
 * ------------------------------------------------------------------------- */

export interface FlashDesignFilter {
  artistId?: number;
  genre?: string;
  category?: string;
  page?: number;
  size?: number;
}

export interface ReservationFilter {
  type?: 'FLASH' | 'CUSTOM';
  status?: ReservationStatusCode;
  /** 예약번호·이메일·아티스트명 통합 검색 */
  q?: string;
  artistId?: number;
  page?: number;
  size?: number;
}

export interface CreateFlashReservationInput {
  flashDesignId: number;
  preferredDate: DateString;
  preferredTime: TimeString;
  email: string;
  /** 개인정보처리방침 동의. false면 백엔드가 거부해야 한다. */
  privacyAgreed: boolean;
}

export interface CreateCustomReservationInput {
  /** 아티스트를 정하지 않은 경우 null — '추천해 주세요' */
  artistId: number | null;
  tattooGenre: string;
  bodyPart: string;
  tattooSize: string;
  gender: string;
  age: string;
  preferredDate: DateString | null;
  email: string;
  privacyAgreed: boolean;
  funnel?: string | null;
}

export interface TattooRepository {
  /* 공개 */
  listArtists(): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | null>;
  listFlashDesigns(filter?: FlashDesignFilter): Promise<Paginated<FlashDesign>>;
  getFlashDesign(id: number): Promise<FlashDesign | null>;
  /** date를 주면 그 날짜의 시간대까지 채워서 돌려준다. */
  getAvailability(artistId: number, date?: DateString): Promise<AvailabilityResponse>;
  getDepositPolicy(): Promise<DepositPolicy>;
  getCalculatorConfig(): Promise<CalculatorConfig>;
  /** 커스텀 예약 퍼널의 선택지. 관리자가 편집하는 값이므로 하드코딩하지 않는다. */
  getCustomOptions(): Promise<CustomReservationOptions>;
  getSiteContent(): Promise<SiteContent>;
  listNotices(): Promise<Notice[]>;
  listFaq(): Promise<FaqEntry[]>;

  /* 예약 */
  createFlashReservation(input: CreateFlashReservationInput): Promise<FlashReservation>;
  createCustomReservation(input: CreateCustomReservationInput): Promise<CustomReservation>;
  /** 고객이 '입금완료'를 누른 시점. 대기 → 입금확인대기 */
  markDepositPaid(reservationNumber: string): Promise<Reservation>;
  /** 비로그인 조회. 예약번호 + 이메일 두 개가 맞아야 통과한다. */
  lookupReservation(reservationNumber: string, email: string): Promise<Reservation | null>;

  /* 관리자 · 아티스트 */

  /**
   * 로그인한 아티스트 본인의 레코드.
   *
   * email을 받는 이유는 목 구현이 누구인지 알아야 하기 때문이다. 실제 백엔드는
   * 이 인자를 쓰지 않고 JWT의 subject로 판단한다 — 클라이언트가 보낸 이메일을 믿으면
   * 남의 프로필을 조회할 수 있다.
   */
  getMyArtistProfile(email: string): Promise<Artist | null>;

  getDashboard(
    scope: { role: 'Admin' } | { role: 'Artist'; artistId: number },
  ): Promise<DashboardSummary>;
  listReservations(filter?: ReservationFilter): Promise<Paginated<Reservation>>;
}
