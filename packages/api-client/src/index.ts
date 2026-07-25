/* ---------------------------------------------------------------------------
 * @tattoo/api-client — 전송 계층.
 *
 * 도메인 타입은 @tattoo/contract가 소유하고 여기서 re-export만 한다. 의존 방향은
 * 한쪽이다 — contract는 api-client를 모른다. 그래야 DDL 생성기가 fetch 코드를
 * 끌어들이지 않고 contract만 읽을 수 있다.
 *
 *   contract (도메인 · 스키마 · 시드)
 *      ↑
 *   api-client (엔드포인트 · 에러 · fetch)
 *      ↑
 *   apps/web
 *
 * 앱 코드는 계속 '@tattoo/api-client'에서 타입을 가져오면 된다. contract로 옮긴 뒤에도
 * import 경로가 바뀌지 않도록 여기서 그대로 흘려보낸다.
 * ------------------------------------------------------------------------- */

export { ApiClient, type ApiClientConfig, type RequestOptions } from './client';
export { API, BFF } from './endpoints';
export {
  ApiError,
  asApiError,
  messageForCode,
  toApiError,
  type ApiErrorBody,
  type ApiErrorCode,
} from './errors';

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
} from '@tattoo/contract';
