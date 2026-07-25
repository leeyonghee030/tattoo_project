/* ---------------------------------------------------------------------------
 * @tattoo/contract — 앱이 쓰는 표면.
 *
 * 도메인 타입과 시드 데이터만 내보낸다. 테이블 스펙·플로우 매핑은 '@tattoo/contract/schema'
 * 로 분리했다 — 브라우저 번들에 DDL 메타데이터가 섞여 들어가지 않게 하려는 것이다.
 * ------------------------------------------------------------------------- */

export {
  ALLOWED_STATUS_TRANSITIONS,
  ReservationStatus,
  canTransition,
  type Artist,
  type ArtistSocialLinks,
  type AvailabilityResponse,
  type AvailabilitySlot,
  type CalculatorConfig,
  type CalculatorItem,
  type CalculatorOption,
  type CustomReservation,
  type CustomReservationOptions,
  type CustomSizeOption,
  type DashboardSummary,
  type DateString,
  type DateTimeString,
  type DepositPolicy,
  type FaqEntry,
  type FlashDesign,
  type FlashReservation,
  type LoginRequest,
  type LoginResponse,
  type Notice,
  type Paginated,
  type Reservation,
  type ReservationStatusCode,
  type SessionUser,
  type SiteContent,
  type TimeString,
  type UserRole,
} from './domain.ts';

export {
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
} from './seed.ts';
