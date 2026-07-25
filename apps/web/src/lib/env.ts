/* ---------------------------------------------------------------------------
 * 환경 변수 접근을 한 곳으로 모은다.
 *
 * process.env를 화면 곳곳에서 직접 읽으면 오타가 런타임까지 살아남고, 어떤 변수가
 * 필요한지 파악할 수 없다.
 * ------------------------------------------------------------------------- */

/** Spring 백엔드 주소. 서버 사이드에서만 쓴다(브라우저에 노출되지 않는다). */
export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

/**
 * 데이터 소스 선택.
 *
 * 'mock'  — 목 저장소. 백엔드가 없어도 모든 화면이 동작한다. 기본값.
 * 'http'  — Spring 호출. 해당 엔드포인트가 구현된 뒤에 켠다.
 *
 * 지금은 로그인 4개만 백엔드에 있으므로 기본이 mock이다. 로그인만은 mock 모드에서도
 * 실제 Spring을 호출한다(auth는 항상 http) — 이미 구현되어 있고, 목으로 대체하면
 * 진짜 붙일 때 동작 차이를 발견하지 못한다.
 */
export const DATA_SOURCE: 'mock' | 'http' = process.env.DATA_SOURCE === 'http' ? 'http' : 'mock';

/** 로그인만 목으로 처리하고 싶을 때 (백엔드 없이 화면만 볼 때). */
export const MOCK_AUTH = process.env.MOCK_AUTH === '1';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
