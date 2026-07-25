/* ---------------------------------------------------------------------------
 * 도메인 타입 — 이 프로젝트의 단일 진실(source of truth).
 *
 * 이 파일이 무엇을 결정하는가:
 *   · 프론트가 다루는 데이터 모양      (api-client가 그대로 re-export)
 *   · DB 테이블 컬럼                   (tables.ts가 이 타입에 맞춰 선언, generate.ts가 DDL 생성)
 *   · 백엔드가 내려줘야 할 JSON 모양   (docs/API-CONTRACT.md)
 *
 * 그래서 여기를 고치면 DDL·ERD·목 시드가 함께 따라와야 하고, 따라오지 않으면
 * `pnpm db:check`가 실패한다. 자세한 흐름은 README '스키마를 바꿀 때' 참고.
 *
 * apps/api 엔티티와의 대응 관계
 *   Artist            ← entity/Artist.java
 *   FlashDesign       ← entity/FlashDesign.java
 *   FlashReservation  ← entity/FlashReservation.java
 *   CustomReservation ← entity/CustomReservation.java
 *
 * 백엔드 엔티티를 그대로 베끼지 않은 부분은 주석으로 이유를 남겼다. 특히 예약 응답은
 * 엔티티가 id 참조만 갖고 있어서(artistId, flashDesignId) 화면에서 쓰려면 매번 추가
 * 조회가 필요하다. 목록 API는 조인해서 이름·이미지를 함께 내려주는 걸 계약으로 잡았다.
 * ------------------------------------------------------------------------- */

/** 'YYYY-MM-DD' 로컬 날짜. 백엔드 preferredDate가 String이므로 문자열로 주고받는다. */
export type DateString = string;
/** 'HH:mm' */
export type TimeString = string;
/** ISO 8601 일시. 백엔드 LocalDateTime 직렬화 결과. */
export type DateTimeString = string;

/* ── 예약 상태 ──────────────────────────────────────────────
 * 백엔드는 `int status`로 저장한다. 숫자 의미가 코드 어디에도 없으면
 * 프론트·백엔드가 각자 다르게 해석하는 사고가 난다. 여기서 못 박고
 * docs/API-CONTRACT.md에 같은 표를 남긴다.
 */
export const ReservationStatus = {
  /** 예약 생성됨. 고객이 입금 전. */
  WAITING: 0,
  /** 고객이 '입금완료'를 눌렀고 관리자·아티스트 확인 대기. */
  PAYMENT_PENDING: 1,
  /** 아티스트가 캘린더에 등록해 확정됨. */
  CONFIRMED: 2,
  /** 만료 기간 내 채널 연락이 없어 자동 만료. */
  NO_RESPONSE: 3,
  /** 관리자가 취소 처리. */
  CANCELLED: 4,
} as const;

export type ReservationStatusCode = (typeof ReservationStatus)[keyof typeof ReservationStatus];

/** 상태 전이 규칙. README의 상태 다이어그램을 코드로 옮긴 것. */
export const ALLOWED_STATUS_TRANSITIONS: Record<ReservationStatusCode, ReservationStatusCode[]> = {
  [ReservationStatus.WAITING]: [
    ReservationStatus.PAYMENT_PENDING,
    ReservationStatus.NO_RESPONSE,
    ReservationStatus.CANCELLED,
  ],
  [ReservationStatus.PAYMENT_PENDING]: [
    ReservationStatus.CONFIRMED,
    ReservationStatus.NO_RESPONSE,
    ReservationStatus.CANCELLED,
  ],
  // 종료 상태에서는 더 이상 전이하지 않는다.
  [ReservationStatus.CONFIRMED]: [],
  [ReservationStatus.NO_RESPONSE]: [],
  [ReservationStatus.CANCELLED]: [],
};

export function canTransition(from: ReservationStatusCode, to: ReservationStatusCode): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}

/* ── 아티스트 ───────────────────────────────────────────── */

export interface ArtistSocialLinks {
  instagram?: string | null;
  kakao?: string | null;
  line?: string | null;
  whatsapp?: string | null;
}

export interface Artist {
  id: number;
  artistName: string;
  introduce: string | null;
  artistImageUrl: string | null;
  /**
   * 엔티티에는 없지만 목록 화면에 필요하다. 아티스트별 주력 장르 태그.
   * 도안(FlashDesign)에서 유도하거나 별도 컬럼으로 두면 된다.
   */
  genres: string[];
  socialLinks: ArtistSocialLinks;
  /** 관리자가 지정하는 노출 순서. 작을수록 먼저. */
  displayOrder: number;
  /** 비활성 아티스트는 공개 목록에서 제외된다. */
  isActive: boolean;
}

/* ── 플래시 도안 ────────────────────────────────────────── */

export interface FlashDesign {
  id: number;
  artistId: number;
  /** 목록·상세에서 매번 아티스트를 다시 조회하지 않도록 조인해서 내려준다. */
  artistName: string;
  imageUrl: string;
  /** 예상 시술 시간(분) */
  estimatedTime: number;
  /**
   * 백엔드 엔티티가 String이다. '150000' 같은 숫자 문자열일 수도, '15만원~'처럼
   * 표시용 문구일 수도 있어서 프론트에서 계산에 쓰지 않고 그대로 표시만 한다.
   * 계산이 필요하면 백엔드에 숫자 컬럼을 따로 두는 게 맞다.
   */
  price: string;
  category: string | null;
  genre: string | null;
  /** 판매 종료된 도안. 목록에 남지만 예약할 수 없다. */
  isSoldOut: boolean;
  displayOrder: number;
}

/* ── 예약 ───────────────────────────────────────────────── */

interface ReservationBase {
  id: number;
  /** 고객에게 발급되는 조회용 번호. 이메일·채널 안내에 쓰인다. */
  reservationNumber: string;
  status: ReservationStatusCode;
  /** 고객이 예약 시 입력한 이메일 */
  email: string;
  preferredDate: DateString;
  requestedAt: DateTimeString;
  /** 관리자 내부 메모. 고객에게 보이지 않는다. */
  adminMemo?: string | null;
}

export interface FlashReservation extends ReservationBase {
  type: 'FLASH';
  flashDesignId: number;
  flashDesignImageUrl: string;
  artistId: number;
  artistName: string;
  preferredTime: TimeString;
  /** 고객이 안내받은 연락 채널 URL */
  contactChannelUrl: string | null;
}

export interface CustomReservation extends ReservationBase {
  type: 'CUSTOM';
  artistId: number | null;
  artistName: string | null;
  tattooGenre: string;
  bodyPart: string;
  tattooSize: string;
  gender: string;
  age: string;
  /** 유입 경로 (funnel) */
  funnel: string | null;
  contactChannelUrl: string | null;
  /** 관리자가 설정한 커스텀 진행단계 중 현재 단계 */
  progressStep?: string | null;
}

export type Reservation = FlashReservation | CustomReservation;

/* ── 예약 가능 시간 ─────────────────────────────────────── */

export interface AvailabilitySlot {
  time: TimeString;
  /** 이미 확정 예약이 있어 선택 불가 */
  taken: boolean;
}

export interface AvailabilityResponse {
  artistId: number;
  /** 예약 가능한 날짜 목록. 휴무일·정원 마감은 제외된 상태로 내려온다. */
  availableDates: DateString[];
  /** 조회한 날짜의 시간대. date 파라미터를 준 경우에만 채워진다. */
  slots?: AvailabilitySlot[];
  /** 예약 가능 기간 상한 */
  maxDate: DateString;
}

/* ── 커스텀 예약 선택지 ─────────────────────────────────
 * 관리자가 편집하는 값이다(README '커스텀 진행단계' 및 콘텐츠 관리).
 * 프론트에 하드코딩하면 장르를 하나 추가할 때마다 배포가 필요해진다.
 */
export interface CustomSizeOption {
  value: string;
  /** 감을 잡게 해주는 비유 (예: '동전 크기 정도') */
  description: string;
}

export interface CustomReservationOptions {
  genres: string[];
  bodyParts: string[];
  sizes: CustomSizeOption[];
  genders: string[];
  ages: string[];
}

/* ── 미니타투 계산기 ────────────────────────────────────── */

export interface CalculatorOption {
  id: number;
  label: string;
  /** 이 옵션이 더하는 금액 */
  amount: number;
}

export interface CalculatorItem {
  id: number;
  /** 항목명 (예: '크기', '색상 수', '부위') */
  name: string;
  options: CalculatorOption[];
}

export interface CalculatorConfig {
  items: CalculatorItem[];
  /** 기본 금액. 모든 옵션 합계에 더해진다. */
  baseAmount: number;
  /** 계산 결과 아래 붙는 안내 문구 (예: '실제 금액은 상담 후 확정됩니다') */
  disclaimer: string;
}

/* ── 예약금 정책 ────────────────────────────────────────── */

export interface DepositPolicy {
  flashAmount: number;
  customAmount: number;
  /** 계좌 이체 안내 */
  bankAccount: { bankName: string; accountNumber: string; holderName: string } | null;
  paypalUrl: string | null;
  /** 대기 상태가 자동 만료되기까지의 일수 */
  expireAfterDays: number;
}

/* ── 콘텐츠 (관리자가 편집하는 문구·링크) ───────────────── */

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  shopAddress: string;
  shopMapUrl: string | null;
  aftercareGuide: string;
  socialLinks: ArtistSocialLinks;
}

export interface Notice {
  id: number;
  title: string;
  body: string;
  createdAt: DateTimeString;
  isPinned: boolean;
}

export interface FaqEntry {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
}

/* ── 인증 ───────────────────────────────────────────────── */

/** JWT의 role 클레임. util/JwtUtil.java에서 'Admin' / 'Artist' 문자열로 발급된다. */
export type UserRole = 'Admin' | 'Artist';

export interface LoginRequest {
  email: string;
  password: string;
}

/** 백엔드 dto/LoginResponseDto.java — 현재는 token 하나만 내려준다. */
export interface LoginResponse {
  token: string;
}

/** BFF(Next Route Handler)가 쿠키를 세팅한 뒤 화면에 돌려주는 형태. */
export interface SessionUser {
  email: string;
  role: UserRole;
  /** 토큰 만료 시각. 만료 임박 시 재로그인 안내에 쓴다. */
  expiresAt: DateTimeString;
}

/* ── 목록 응답 공통 ─────────────────────────────────────── */

export interface Paginated<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

/* ── 관리자 대시보드 ────────────────────────────────────── */

export interface DashboardSummary {
  todayReservationCount: number;
  waitingCount: number;
  paymentPendingCount: number;
  confirmedThisMonthCount: number;
  recentReservations: Reservation[];
  /** 월별 예약 건수. 그래프용. */
  monthlyTrend: Array<{ month: string; count: number }>;
}
