import type { EndpointBinding, FlowSpec } from './spec.ts';

/* ---------------------------------------------------------------------------
 * ★ 화면 흐름 ↔ DB 컬럼 연결 ★
 *
 * 여기가 "디자인이 바뀌면 DB도 따라 바뀌게" 만드는 지점이다.
 *
 * 퍼널에 단계를 추가하면 이 파일에도 단계를 추가해야 하고, 그 단계가 모으는 컬럼이
 * tables.ts에 없으면 `pnpm db:check`가 실패한다. 반대로 NOT NULL 컬럼을 추가했는데
 * 아무 단계도 채우지 않고 serverSet도 아니면 그것도 실패한다.
 *
 * 즉 세 곳(퍼널 코드 · 이 파일 · tables.ts)이 어긋나면 CI가 막는다.
 *
 * collects에 적지 않는 것
 *   · 서버가 채우는 값 (id, 예약번호, 접수시각, 상태 초기값) → serverSet: true로 표시
 *   · 동의 체크박스 → 값 자체는 서버 시계에서 나오므로 privacy_agreed_at은 serverSet
 * ------------------------------------------------------------------------- */

export const FLOWS: FlowSpec[] = [
  {
    id: 'flashReservation',
    label: '플래시 도안 예약',
    writesTo: 'flash_reservation_tb',
    sourceFile: 'apps/web/src/app/[locale]/flash/[id]/reserve/flash-reserve-funnel.tsx',
    steps: [
      {
        id: 'date',
        question: '언제 방문하시겠어요?',
        collects: ['flash_reservation_tb.preferred_date'],
      },
      {
        id: 'time',
        question: '몇 시가 좋으세요?',
        collects: ['flash_reservation_tb.preferred_time'],
      },
      {
        id: 'email',
        question: '예약 안내를 받을 이메일을 알려주세요',
        collects: ['user_tb.email'],
      },
      {
        id: 'confirm',
        // 동의 시각(privacy_agreed_at)은 서버 시계에서 나오므로 collects에 없다.
        question: '마지막으로 확인해 주세요 (요약 + 개인정보처리방침 동의)',
        collects: [],
      },
    ],
  },

  {
    id: 'customReservation',
    label: '커스텀 예약 (README 시나리오 2)',
    writesTo: 'custom_reservation_tb',
    sourceFile: 'apps/web/src/app/[locale]/custom/custom-funnel.tsx',
    steps: [
      {
        id: 'artist',
        question: '어떤 아티스트에게 받고 싶으세요?',
        collects: ['custom_reservation_tb.artist_id'],
        // '추천해 주세요'를 고를 수 있어서 건너뛰기 가능 → artist_id가 nullable이어야 한다
        skippable: true,
      },
      {
        id: 'genre',
        question: '어떤 스타일을 원하세요?',
        collects: ['custom_reservation_tb.tattoo_genre'],
      },
      {
        id: 'bodyPart',
        question: '어디에 받으실 예정인가요?',
        collects: ['custom_reservation_tb.body_part'],
      },
      {
        id: 'size',
        question: '크기는 어느 정도가 좋을까요?',
        collects: ['custom_reservation_tb.tattoo_size'],
      },
      {
        id: 'gender',
        question: '성별을 알려주세요',
        collects: ['custom_reservation_tb.gender'],
      },
      {
        id: 'age',
        question: '연령대를 알려주세요',
        collects: ['custom_reservation_tb.age'],
      },
      {
        id: 'date',
        question: '희망하는 날짜가 있으세요?',
        collects: ['custom_reservation_tb.preferred_date'],
        // 상담에서 정할 수 있어 건너뛰기 가능 → preferred_date가 nullable이어야 한다
        skippable: true,
      },
      {
        id: 'contact',
        question: '이메일 입력 + 개인정보처리방침 동의',
        collects: ['user_tb.email'],
      },
    ],
  },
];

/* ---------------------------------------------------------------------------
 * 저장소 메서드 ↔ API 엔드포인트 연결.
 *
 * check.ts가 확인하는 것
 *   · repository.ts의 모든 메서드가 여기 선언되어 있는가
 *   · 여기 적힌 엔드포인트 키가 endpoints.ts의 API에 실제로 있는가
 *
 * 화면을 추가하다 저장소 메서드만 만들고 엔드포인트 상수를 잊는 실수를 잡는다.
 * ------------------------------------------------------------------------- */

export const ENDPOINT_BINDINGS: EndpointBinding[] = [
  { method: 'listArtists', endpoints: ['artists'], implemented: false },
  { method: 'getArtist', endpoints: ['artist'], implemented: false },
  { method: 'listFlashDesigns', endpoints: ['flashDesigns'], implemented: false },
  { method: 'getFlashDesign', endpoints: ['flashDesign'], implemented: false },
  { method: 'getAvailability', endpoints: ['availability'], implemented: false },
  { method: 'getDepositPolicy', endpoints: ['depositPolicy'], implemented: false },
  { method: 'getCalculatorConfig', endpoints: ['calculator'], implemented: false },
  { method: 'getCustomOptions', endpoints: ['customOptions'], implemented: false },
  { method: 'getSiteContent', endpoints: ['siteContent'], implemented: false },
  { method: 'listNotices', endpoints: ['notices'], implemented: false },
  { method: 'listFaq', endpoints: ['faq'], implemented: false },
  { method: 'createFlashReservation', endpoints: ['createFlashReservation'], implemented: false },
  { method: 'createCustomReservation', endpoints: ['createCustomReservation'], implemented: false },
  { method: 'markDepositPaid', endpoints: ['markDepositPaid'], implemented: false },
  { method: 'lookupReservation', endpoints: ['lookupReservation'], implemented: false },
  { method: 'getMyArtistProfile', endpoints: ['artistProfile'], implemented: false },
  // 역할에 따라 경로가 갈린다
  { method: 'getDashboard', endpoints: ['adminDashboard', 'artistDashboard'], implemented: false },
  { method: 'listReservations', endpoints: ['adminReservations'], implemented: false },
];
