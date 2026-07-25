/* ---------------------------------------------------------------------------
 * 엔드포인트 경로 한 곳 모음.
 *
 * 문자열을 화면마다 직접 쓰면 백엔드가 경로를 바꿀 때 어디를 고쳐야 하는지 찾을 수 없다.
 * 여기 상수만 고치면 전부 따라온다. MSW 목 핸들러도 이 상수를 그대로 쓴다.
 *
 * ✅ = 백엔드에 이미 구현됨 (apps/api)
 * ⬜ = 계약만 정의됨 — MSW 목으로 동작, 백엔드 구현 필요
 * ------------------------------------------------------------------------- */

export const API = {
  /* ── 인증 ─────────────────────────────────────────── */
  /** ✅ POST — AdminController.login */
  adminLogin: '/api/admin/login',
  /** ✅ POST — AdminController.logout */
  adminLogout: '/api/admin/logout',
  /** ✅ POST — ArtistController.login */
  artistLogin: '/api/artist/login',
  /** ✅ POST — ArtistController.logout */
  artistLogout: '/api/artist/logout',

  /* ── 공개 (비로그인) ──────────────────────────────── */
  /** ⬜ GET — 활성 아티스트 목록 */
  artists: '/api/public/artists',
  /** ⬜ GET */
  artist: (id: number) => `/api/public/artists/${id}`,
  /** ⬜ GET — 플래시 도안 목록. ?artistId= &genre= &category= &page= */
  flashDesigns: '/api/public/flash-designs',
  /** ⬜ GET */
  flashDesign: (id: number) => `/api/public/flash-designs/${id}`,
  /** ⬜ GET — 예약 가능 날짜·시간. ?artistId= &date= */
  availability: '/api/public/availability',
  /** ⬜ POST — 플래시 예약 생성 */
  createFlashReservation: '/api/public/reservations/flash',
  /** ⬜ POST — 커스텀 예약 생성 */
  createCustomReservation: '/api/public/reservations/custom',
  /** ⬜ POST — 고객이 '입금완료' 클릭. 상태 대기 → 입금확인대기 */
  markDepositPaid: (reservationNumber: string) =>
    `/api/public/reservations/${reservationNumber}/deposit-paid`,
  /** ⬜ GET — 예약번호 + 이메일로 조회 (비로그인 인증 대체) */
  lookupReservation: '/api/public/reservations/lookup',
  /** ⬜ GET — 예약금 정책 (금액·계좌·만료일수) */
  depositPolicy: '/api/public/deposit-policy',
  /** ⬜ GET — 미니타투 계산기 설정 */
  calculator: '/api/public/calculator',
  /** ⬜ GET — 커스텀 예약 선택지 (장르·부위·크기·성별·연령대) */
  customOptions: '/api/public/custom-options',
  /** ⬜ GET — 배너·소개·위치·약관 등 편집 가능한 문구 */
  siteContent: '/api/public/content',
  /** ⬜ GET */
  notices: '/api/public/notices',
  /** ⬜ GET */
  faq: '/api/public/faq',

  /* ── 관리자 ───────────────────────────────────────── */
  /** ⬜ GET — 대시보드 지표 + 최근 예약 */
  adminDashboard: '/api/admin/dashboard',
  /** ⬜ GET — 예약 목록. ?type= &status= &q= &page= */
  adminReservations: '/api/admin/reservations',
  /** ⬜ PATCH — 상태 변경 / 메모 저장 */
  adminReservation: (id: number) => `/api/admin/reservations/${id}`,
  /** ⬜ GET — 고객 목록 (예약 이력·재방문 표시) */
  adminCustomers: '/api/admin/customers',
  /** ⬜ GET, POST — 아티스트 계정 관리 */
  adminArtists: '/api/admin/artists',
  /** ⬜ PATCH, DELETE */
  adminArtist: (id: number) => `/api/admin/artists/${id}`,
  /** ⬜ GET, POST — 플래시 도안 관리 */
  adminFlashDesigns: '/api/admin/flash-designs',
  /** ⬜ GET — 기간별 통계 */
  adminStatistics: '/api/admin/statistics',
  /** ⬜ GET — 블랙리스트 */
  adminBlacklist: '/api/admin/blacklist',

  /* ── 아티스트 ─────────────────────────────────────── */
  /** ⬜ GET — 본인 대시보드 */
  artistDashboard: '/api/artist/dashboard',
  /** ⬜ GET — 본인 예약만 */
  artistReservations: '/api/artist/reservations',
  /** ⬜ GET, PATCH — 본인 프로필 */
  artistProfile: '/api/artist/profile',
  /** ⬜ GET, POST — 본인 도안 */
  artistFlashDesigns: '/api/artist/flash-designs',
  /** ⬜ GET — 구글 캘린더·슬랙 연동 상태 */
  artistIntegrations: '/api/artist/integrations',
} as const;

/* ---------------------------------------------------------------------------
 * BFF(Next.js Route Handler) 경로.
 *
 * 브라우저는 Spring을 직접 호출하지 않고 이쪽을 부른다. 이유:
 *   1) JWT를 httpOnly 쿠키에 보관할 수 있다 → XSS로 토큰을 훔칠 수 없다
 *   2) 서버 간 호출이라 CORS 설정이 필요 없다
 *   3) Spring 주소가 브라우저에 노출되지 않는다
 * ------------------------------------------------------------------------- */

export const BFF = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  session: '/api/auth/session',
} as const;
