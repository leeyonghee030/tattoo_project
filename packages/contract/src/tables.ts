import { ReservationStatus } from './domain.ts';
import type { TableSpec } from './spec.ts';

/* ---------------------------------------------------------------------------
 * ★ DB 스키마 단일 진실 ★
 *
 * 이 파일만 고친다. db/*.sql과 docs/ERD.md는 여기서 생성되는 산출물이므로
 * 직접 편집하면 `pnpm db:check`가 실패한다.
 *
 * 컬럼을 추가·삭제할 때 확인할 것
 *   1) domain.ts의 타입에도 필드가 있는가 (field로 연결했다면)
 *   2) 화면이 그 값을 입력받는가 → flows.ts의 collects에 추가
 *      입력받지 않고 서버가 채운다면 → serverSet: true
 *   3) pnpm db:generate 후 pnpm db:check
 *
 * 기존 테이블 가정
 *   admin_tb / artist_tb / token_blacklist_tb 는 이미 운영 중이라고 보았다.
 *   매퍼 XML이 SELECT하고 있기 때문이다. 컬럼 구성은 apps/api의 엔티티 필드와
 *   1:1이라고 가정했다 — 실제 DB와 다르면 existing 플래그를 고쳐야 한다.
 *   나머지 테이블은 저장소에 DDL이 전혀 없어 전부 신설로 잡았다.
 * ------------------------------------------------------------------------- */

/** 예약 상태 CHECK 제약. 상태 코드 상수에서 자동 생성되므로 손으로 적지 않는다. */
const STATUS_VALUES = Object.values(ReservationStatus);
const STATUS_CHECK = `status IN (${STATUS_VALUES.join(', ')})`;
const STATUS_COMMENT = `예약 상태 — ${Object.entries(ReservationStatus)
  .map(([name, value]) => `${value}=${name}`)
  .join(' ')}`;

/** 모든 테이블이 공통으로 갖는 생성/수정 시각. */
const timestamps = (): TableSpec['columns'] => [
  {
    name: 'created_at',
    type: { kind: 'datetime' },
    default: 'CURRENT_TIMESTAMP',
    serverSet: true,
    comment: '생성 시각',
  },
  {
    name: 'updated_at',
    type: { kind: 'datetime' },
    default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    serverSet: true,
    comment: '수정 시각',
  },
];

const id = (comment = 'PK'): TableSpec['columns'][number] => ({
  name: 'id',
  type: { kind: 'bigint', autoIncrement: true },
  field: 'id',
  serverSet: true,
  existing: true,
  comment,
});

export const TABLES: TableSpec[] = [
  /* ── 관리자 ─────────────────────────────────────────── */
  {
    name: 'admin_tb',
    label: '관리자',
    comment: '관리자 계정. AdminMapper.findByEmail이 조회한다.',
    status: 'existing',
    primaryKey: ['id'],
    columns: [
      id(),
      {
        name: 'email',
        type: { kind: 'varchar', length: 255 },
        field: 'email',
        unique: true,
        existing: true,
        comment: '로그인 이메일',
      },
      {
        name: 'password_hash',
        type: { kind: 'varchar', length: 255 },
        field: 'passwordHash',
        existing: true,
        serverSet: true,
        comment:
          'BCrypt 해시. 현재 백엔드는 평문 비교 중이므로 반드시 고쳐야 한다 (API-CONTRACT 0.3)',
      },
      {
        name: 'login_fail_count',
        type: { kind: 'int' },
        default: '0',
        serverSet: true,
        comment: '연속 로그인 실패 횟수. 5회에서 잠금 (API-CONTRACT 0.4)',
      },
      {
        name: 'locked_at',
        type: { kind: 'datetime' },
        nullable: true,
        serverSet: true,
        comment: '계정 잠금 시각. NULL이면 정상. 관리자만 해제 가능',
      },
      ...timestamps(),
    ],
  },

  /* ── 아티스트 ───────────────────────────────────────── */
  {
    name: 'artist_tb',
    label: '아티스트',
    comment: '아티스트 계정 + 공개 프로필. 로그인 계정과 프로필이 같은 행에 있다.',
    status: 'existing',
    primaryKey: ['id'],
    columns: [
      id(),
      {
        name: 'email',
        type: { kind: 'varchar', length: 255 },
        field: 'email',
        unique: true,
        existing: true,
        comment: '로그인 이메일. JWT subject로 본인 식별에 쓴다',
      },
      {
        name: 'password_hash',
        type: { kind: 'varchar', length: 255 },
        field: 'passwordHash',
        existing: true,
        serverSet: true,
        comment: 'BCrypt 해시',
      },
      {
        name: 'is_verified',
        type: { kind: 'boolean' },
        default: '0',
        field: 'isVerified',
        existing: true,
        serverSet: true,
        comment: '이메일 인증 완료 여부',
      },
      {
        name: 'artist_name',
        type: { kind: 'varchar', length: 100 },
        field: 'artistName',
        existing: true,
        comment: '활동명. 공개 목록에 노출된다',
      },
      {
        name: 'introduce',
        type: { kind: 'text' },
        nullable: true,
        field: 'introduce',
        existing: true,
        comment: '소개글. 비어 있을 수 있다',
      },
      {
        name: 'artist_image_url',
        type: { kind: 'varchar', length: 512 },
        nullable: true,
        field: 'artistImageUrl',
        existing: true,
        comment: '프로필 이미지. NULL이면 프론트가 무채색 패턴을 생성한다',
      },
      {
        name: 'instagram_form_url',
        type: { kind: 'varchar', length: 512 },
        nullable: true,
        existing: true,
        comment: '인스타그램 링크. 응답에서는 socialLinks.instagram으로 묶인다',
      },
      {
        name: 'kakao_form_url',
        type: { kind: 'varchar', length: 512 },
        nullable: true,
        existing: true,
        comment: '카카오 채널 링크 → socialLinks.kakao',
      },
      {
        name: 'line_form_url',
        type: { kind: 'varchar', length: 512 },
        nullable: true,
        existing: true,
        comment: 'LINE 링크 → socialLinks.line',
      },
      {
        name: 'watts_form_url',
        type: { kind: 'varchar', length: 512 },
        nullable: true,
        existing: true,
        comment: 'WhatsApp 링크 → socialLinks.whatsapp (엔티티 필드명이 watts인 점 유지)',
      },
      {
        name: 'slack_member_id',
        type: { kind: 'varchar', length: 64 },
        nullable: true,
        serverSet: true,
        comment:
          '슬랙 회원 ID. 알림 카드의 캘린더 등록 버튼으로 아티스트를 식별한다 (README 시나리오 1)',
      },
      {
        name: 'google_calendar_id',
        type: { kind: 'varchar', length: 255 },
        nullable: true,
        serverSet: true,
        comment: '구글 캘린더 ID. 확정 시 여기에 일정을 등록한다',
      },
      {
        name: 'display_order',
        type: { kind: 'int' },
        default: '0',
        field: 'displayOrder',
        index: true,
        serverSet: true,
        comment: '공개 목록 노출 순서. 작을수록 먼저',
      },
      {
        name: 'is_active',
        type: { kind: 'boolean' },
        default: '1',
        field: 'isActive',
        serverSet: true,
        comment: 'false면 공개 목록에서 제외. 계정은 유지된다',
      },
      {
        name: 'login_fail_count',
        type: { kind: 'int' },
        default: '0',
        serverSet: true,
        comment: '연속 로그인 실패 횟수',
      },
      {
        name: 'locked_at',
        type: { kind: 'datetime' },
        nullable: true,
        serverSet: true,
        comment: '계정 잠금 시각',
      },
      ...timestamps(),
    ],
  },

  /* ── 아티스트 장르 (N:M) ────────────────────────────── */
  {
    name: 'artist_genre_tb',
    label: '아티스트 장르',
    comment:
      '아티스트의 주력 장르. 한 아티스트가 여러 장르를 갖고, 응답에서는 genres 배열로 묶인다. 별도 테이블로 뺀 이유는 장르로 도안을 필터링하고 통계를 내야 하기 때문 — 콤마 문자열로 두면 둘 다 못 한다.',
    status: 'new',
    primaryKey: ['artist_id', 'genre'],
    columns: [
      {
        name: 'artist_id',
        type: { kind: 'bigint' },
        serverSet: true,
        comment: 'artist_tb.id',
      },
      {
        name: 'genre',
        type: { kind: 'varchar', length: 50 },
        serverSet: true,
        comment: "장르명 (예: '라인워크', '블랙워크')",
      },
      {
        name: 'display_order',
        type: { kind: 'int' },
        default: '0',
        serverSet: true,
        comment: '표시 순서',
      },
    ],
    foreignKeys: [
      {
        column: 'artist_id',
        references: { table: 'artist_tb', column: 'id' },
        onDelete: 'CASCADE',
      },
    ],
    indexes: [{ name: 'idx_artist_genre_genre', columns: ['genre'] }],
  },

  /* ── 고객 ───────────────────────────────────────────── */
  {
    name: 'user_tb',
    label: '고객',
    comment:
      '비로그인 고객. 이메일만으로 식별한다. 같은 이메일로 재예약하면 같은 행을 재사용해 재방문 고객을 판별한다 (README 고객 관리).',
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id(), existing: false },
      {
        name: 'email',
        type: { kind: 'varchar', length: 255 },
        field: 'email',
        unique: true,
        comment: '예약 시 입력한 이메일. 로그인은 하지 않는다',
      },
      {
        name: 'is_verified',
        type: { kind: 'boolean' },
        default: '0',
        field: 'isVerified',
        serverSet: true,
        comment: '구글 이메일 인증 완료 여부 (README 시나리오 1)',
      },
      {
        name: 'is_blacklisted',
        type: { kind: 'boolean' },
        default: '0',
        index: true,
        serverSet: true,
        comment: 'true면 예약 시도가 차단되고 관리자에게 슬랙 알림이 간다 (README 시나리오 3)',
      },
      {
        name: 'blacklist_reason',
        type: { kind: 'varchar', length: 500 },
        nullable: true,
        serverSet: true,
        comment: '블랙리스트 지정 사유. 관리자 전용',
      },
      ...timestamps(),
    ],
  },

  /* ── 플래시 도안 ────────────────────────────────────── */
  {
    name: 'flash_design_tb',
    label: '플래시 도안',
    comment: '바로 예약 가능한 완성 도안.',
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id(), existing: false },
      {
        name: 'artist_id',
        type: { kind: 'bigint' },
        field: 'artistId',
        index: true,
        serverSet: true,
        comment: 'artist_tb.id',
      },
      {
        name: 'image_url',
        type: { kind: 'varchar', length: 512 },
        field: 'imageUrl',
        serverSet: true,
        comment: '도안 이미지',
      },
      {
        name: 'estimated_time',
        type: { kind: 'int' },
        field: 'estimatedTime',
        serverSet: true,
        comment: '예상 시술 시간(분). 시간대 마감 계산에 쓴다',
      },
      {
        name: 'price',
        type: { kind: 'varchar', length: 50 },
        field: 'price',
        serverSet: true,
        comment:
          "표시용 금액 문자열 (예: '90,000'). 엔티티가 String이라 유지했다 — 계산에는 쓰지 않는다",
      },
      {
        name: 'price_amount',
        type: { kind: 'int' },
        nullable: true,
        serverSet: true,
        comment:
          '집계용 숫자 금액. price가 문자열이라 매출 통계를 낼 수 없어 별도로 둔다 (API-CONTRACT 4.3)',
      },
      {
        name: 'category',
        type: { kind: 'varchar', length: 50 },
        nullable: true,
        field: 'category',
        index: true,
        serverSet: true,
        comment: "크기 분류 (예: '미니', '스탠다드', '라지')",
      },
      {
        name: 'genre',
        type: { kind: 'varchar', length: 50 },
        nullable: true,
        field: 'genre',
        index: true,
        serverSet: true,
        comment: '장르. 공개 목록 필터에 쓴다',
      },
      {
        name: 'is_sold_out',
        type: { kind: 'boolean' },
        default: '0',
        field: 'isSoldOut',
        serverSet: true,
        comment: 'true면 목록에는 남지만 예약할 수 없다',
      },
      {
        name: 'display_order',
        type: { kind: 'int' },
        default: '0',
        field: 'displayOrder',
        serverSet: true,
        comment: '노출 순서',
      },
      ...timestamps(),
    ],
    foreignKeys: [
      {
        column: 'artist_id',
        references: { table: 'artist_tb', column: 'id' },
        onDelete: 'RESTRICT',
      },
    ],
  },

  /* ── 플래시 예약 ────────────────────────────────────── */
  {
    name: 'flash_reservation_tb',
    label: '플래시 예약',
    comment: '도안을 골라 날짜·시간을 지정하는 예약. 프론트 퍼널 4단계로 수집된다.',
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id(), existing: false },
      {
        name: 'reservation_number',
        type: { kind: 'varchar', length: 20 },
        field: 'reservationNumber',
        unique: true,
        serverSet: true,
        comment:
          "고객 조회용 번호 (예: 'TT-2026-0148'). id를 노출하면 순차 대입으로 남의 예약을 볼 수 있어 별도 컬럼이 필요하다 (API-CONTRACT 0.7)",
      },
      {
        name: 'user_id',
        type: { kind: 'bigint' },
        field: 'userId',
        index: true,
        serverSet: true,
        comment: 'user_tb.id. 이메일로 찾거나 새로 만든다',
      },
      {
        name: 'flash_design_id',
        type: { kind: 'bigint' },
        field: 'flashDesignId',
        index: true,
        serverSet: true,
        comment: 'flash_design_tb.id',
      },
      {
        name: 'artist_id',
        type: { kind: 'bigint' },
        field: 'artistId',
        index: true,
        serverSet: true,
        comment:
          '도안의 아티스트를 예약 시점에 복사해 둔다. 도안이 다른 아티스트에게 넘어가도 과거 예약의 담당자는 바뀌지 않아야 한다',
      },
      {
        name: 'preferred_date',
        type: { kind: 'date' },
        field: 'preferredDate',
        index: true,
        comment: '희망 시술 날짜',
      },
      {
        name: 'preferred_time',
        type: { kind: 'time' },
        field: 'preferredTime',
        comment: '희망 시술 시각',
      },
      {
        name: 'status',
        type: { kind: 'tinyint' },
        default: String(ReservationStatus.WAITING),
        field: 'status',
        index: true,
        check: STATUS_CHECK,
        serverSet: true,
        comment: STATUS_COMMENT,
      },
      {
        name: 'contact_channel_url',
        type: { kind: 'varchar', length: 512 },
        nullable: true,
        field: 'contactChannelUrl',
        serverSet: true,
        comment: '고객에게 안내한 연락 채널',
      },
      {
        name: 'privacy_agreed_at',
        type: { kind: 'datetime' },
        serverSet: true,
        comment:
          '개인정보처리방침 동의 시각. 동의 여부를 boolean으로만 두면 언제 동의했는지 증명할 수 없다',
      },
      {
        name: 'admin_memo',
        type: { kind: 'text' },
        nullable: true,
        field: 'adminMemo',
        serverSet: true,
        comment: '관리자 내부 메모. 고객에게 보이지 않는다',
      },
      {
        name: 'requested_at',
        type: { kind: 'datetime' },
        default: 'CURRENT_TIMESTAMP',
        field: 'requestedAt',
        serverSet: true,
        comment: '예약 접수 시각. 만료 기간 계산의 기준',
      },
      ...timestamps(),
    ],
    foreignKeys: [
      { column: 'user_id', references: { table: 'user_tb', column: 'id' }, onDelete: 'RESTRICT' },
      {
        column: 'flash_design_id',
        references: { table: 'flash_design_tb', column: 'id' },
        onDelete: 'RESTRICT',
      },
      {
        column: 'artist_id',
        references: { table: 'artist_tb', column: 'id' },
        onDelete: 'RESTRICT',
      },
    ],
    indexes: [
      {
        name: 'uq_flash_slot',
        columns: ['artist_id', 'preferred_date', 'preferred_time'],
        // UNIQUE가 아니다 — 취소·무응답 예약이 같은 슬롯에 남아 있어야 하므로
        // DB 제약으로 막을 수 없다. 살아 있는 예약만 대상으로 하는 중복 검사는
        // 백엔드 로직이 담당한다 (API-CONTRACT 4.6). 인덱스는 그 조회를 빠르게 한다.
      },
    ],
  },

  /* ── 커스텀 예약 ────────────────────────────────────── */
  {
    name: 'custom_reservation_tb',
    label: '커스텀 예약',
    comment: '도안부터 상담하는 예약. 프론트 퍼널 8단계로 수집된다.',
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id(), existing: false },
      {
        name: 'reservation_number',
        type: { kind: 'varchar', length: 20 },
        field: 'reservationNumber',
        unique: true,
        serverSet: true,
        comment: '고객 조회용 번호',
      },
      {
        name: 'user_id',
        type: { kind: 'bigint' },
        field: 'userId',
        index: true,
        serverSet: true,
        comment: 'user_tb.id',
      },
      {
        name: 'artist_id',
        type: { kind: 'bigint' },
        nullable: true,
        field: 'artistId',
        index: true,
        comment: "NULL 허용 — 고객이 '추천해 주세요'를 고르면 상담 후 배정한다",
      },
      {
        name: 'tattoo_genre',
        type: { kind: 'varchar', length: 50 },
        field: 'tattooGenre',
        comment: '희망 스타일',
      },
      {
        name: 'body_part',
        type: { kind: 'varchar', length: 50 },
        field: 'bodyPart',
        comment: '시술 부위',
      },
      {
        name: 'tattoo_size',
        type: { kind: 'varchar', length: 50 },
        field: 'tattooSize',
        comment: '희망 크기',
      },
      {
        name: 'gender',
        type: { kind: 'varchar', length: 20 },
        field: 'gender',
        comment: "성별. '선택하지 않음'도 값으로 저장한다",
      },
      {
        name: 'age',
        type: { kind: 'varchar', length: 20 },
        field: 'age',
        comment: "연령대 (예: '20대'). 미성년자는 보호자 동의가 필요하다",
      },
      {
        name: 'preferred_date',
        type: { kind: 'date' },
        nullable: true,
        field: 'preferredDate',
        index: true,
        comment: 'NULL 허용 — 커스텀은 상담에서 날짜를 정할 수 있다',
      },
      {
        name: 'funnel',
        type: { kind: 'varchar', length: 100 },
        nullable: true,
        field: 'funnel',
        comment: "유입 경로 (예: '인스타그램'). 마케팅 분석용",
      },
      {
        name: 'status',
        type: { kind: 'tinyint' },
        default: String(ReservationStatus.WAITING),
        field: 'status',
        index: true,
        check: STATUS_CHECK,
        serverSet: true,
        comment: STATUS_COMMENT,
      },
      {
        name: 'progress_step',
        type: { kind: 'varchar', length: 100 },
        nullable: true,
        field: 'progressStep',
        serverSet: true,
        comment: '커스텀 진행단계. 관리자가 목록을 편집한다 (README 예약 설정)',
      },
      {
        name: 'contact_channel_url',
        type: { kind: 'varchar', length: 512 },
        nullable: true,
        field: 'contactChannelUrl',
        serverSet: true,
        comment: '안내한 연락 채널',
      },
      {
        name: 'privacy_agreed_at',
        type: { kind: 'datetime' },
        serverSet: true,
        comment: '개인정보처리방침 동의 시각',
      },
      {
        name: 'admin_memo',
        type: { kind: 'text' },
        nullable: true,
        field: 'adminMemo',
        serverSet: true,
        comment: '관리자 내부 메모',
      },
      {
        name: 'requested_at',
        type: { kind: 'datetime' },
        default: 'CURRENT_TIMESTAMP',
        field: 'requestedAt',
        serverSet: true,
        comment: '접수 시각',
      },
      ...timestamps(),
    ],
    foreignKeys: [
      { column: 'user_id', references: { table: 'user_tb', column: 'id' }, onDelete: 'RESTRICT' },
      {
        column: 'artist_id',
        references: { table: 'artist_tb', column: 'id' },
        onDelete: 'SET NULL',
      },
    ],
  },

  /* ── 토큰 블랙리스트 ────────────────────────────────── */
  {
    name: 'token_blacklist_tb',
    label: '토큰 블랙리스트',
    comment:
      '로그아웃된 JWT. TokenCleanupScheduler가 매일 03시에 만료분을 삭제한다. 리프레시 토큰이 없어 발급 토큰이 24시간 유효하므로 이 테이블이 유일한 무효화 수단이다.',
    status: 'existing',
    primaryKey: ['id'],
    columns: [
      id(),
      {
        name: 'token',
        type: { kind: 'varchar', length: 512 },
        field: 'token',
        unique: true,
        existing: true,
        serverSet: true,
        comment: 'Bearer 접두어를 제거한 순수 JWT',
      },
      {
        name: 'expires_at',
        type: { kind: 'datetime' },
        field: 'expiresAt',
        index: true,
        existing: true,
        serverSet: true,
        comment: '토큰 만료 시각. 이 시각이 지나면 삭제 대상',
      },
      {
        name: 'created_at',
        type: { kind: 'datetime' },
        default: 'CURRENT_TIMESTAMP',
        field: 'createdAt',
        existing: true,
        serverSet: true,
        comment: '등록 시각',
      },
    ],
  },

  /* ── 콘텐츠·설정 ────────────────────────────────────── */
  {
    name: 'notice_tb',
    label: '공지사항',
    comment: '관리자가 등록하는 공지. 고정 공지가 메인 화면에 노출된다.',
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id(), existing: false },
      {
        name: 'title',
        type: { kind: 'varchar', length: 200 },
        field: 'title',
        serverSet: true,
        comment: '제목',
      },
      { name: 'body', type: { kind: 'text' }, field: 'body', serverSet: true, comment: '본문' },
      {
        name: 'is_pinned',
        type: { kind: 'boolean' },
        default: '0',
        field: 'isPinned',
        index: true,
        serverSet: true,
        comment: 'true면 목록 최상단 + 메인 화면 노출',
      },
      {
        name: 'created_at',
        type: { kind: 'datetime' },
        default: 'CURRENT_TIMESTAMP',
        field: 'createdAt',
        serverSet: true,
        comment: '작성 시각',
      },
      {
        name: 'updated_at',
        type: { kind: 'datetime' },
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        serverSet: true,
        comment: '수정 시각',
      },
    ],
  },

  {
    name: 'faq_tb',
    label: 'FAQ',
    comment: '자주 묻는 질문. 이용 안내 화면에 표시된다.',
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id(), existing: false },
      {
        name: 'question',
        type: { kind: 'varchar', length: 300 },
        field: 'question',
        serverSet: true,
        comment: '질문',
      },
      { name: 'answer', type: { kind: 'text' }, field: 'answer', serverSet: true, comment: '답변' },
      {
        name: 'display_order',
        type: { kind: 'int' },
        default: '0',
        field: 'displayOrder',
        serverSet: true,
        comment: '표시 순서',
      },
      ...timestamps(),
    ],
  },

  {
    name: 'site_content_tb',
    label: '사이트 문구',
    comment:
      '배너·위치·관리법 등 관리자가 편집하는 문구. locale 열로 한/영을 분리해 다국어를 지원한다 — 컬럼을 title_ko/title_en으로 늘리면 언어 추가마다 스키마가 바뀐다.',
    status: 'new',
    primaryKey: ['locale', 'content_key'],
    columns: [
      {
        name: 'locale',
        type: { kind: 'varchar', length: 5 },
        serverSet: true,
        comment: "언어 코드 ('ko' | 'en')",
      },
      {
        name: 'content_key',
        type: { kind: 'varchar', length: 100 },
        serverSet: true,
        comment: "문구 키 (예: 'heroTitle', 'aftercareGuide')",
      },
      {
        name: 'content_value',
        type: { kind: 'text' },
        serverSet: true,
        comment: '문구 본문. 줄바꿈을 그대로 보존한다',
      },
      ...timestamps(),
    ],
  },

  {
    name: 'deposit_policy_tb',
    label: '예약금 정책',
    comment:
      '예약금 금액과 입금 계좌, 대기 만료 일수. 행이 하나만 존재한다(id=1). 설정값이라 테이블 하나에 몰아넣었다.',
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id('PK. 항상 1'), existing: false },
      {
        name: 'flash_amount',
        type: { kind: 'int' },
        field: 'flashAmount',
        serverSet: true,
        comment: '플래시 예약금(원)',
      },
      {
        name: 'custom_amount',
        type: { kind: 'int' },
        field: 'customAmount',
        serverSet: true,
        comment: '커스텀 상담 예약금(원)',
      },
      {
        name: 'bank_name',
        type: { kind: 'varchar', length: 50 },
        nullable: true,
        serverSet: true,
        comment: '입금 은행',
      },
      {
        name: 'account_number',
        type: { kind: 'varchar', length: 50 },
        nullable: true,
        serverSet: true,
        comment: '계좌번호',
      },
      {
        name: 'holder_name',
        type: { kind: 'varchar', length: 50 },
        nullable: true,
        serverSet: true,
        comment: '예금주',
      },
      {
        name: 'paypal_url',
        type: { kind: 'varchar', length: 512 },
        nullable: true,
        field: 'paypalUrl',
        serverSet: true,
        comment: '해외 고객용 페이팔 링크',
      },
      {
        name: 'expire_after_days',
        type: { kind: 'int' },
        default: '3',
        field: 'expireAfterDays',
        serverSet: true,
        comment: '대기 상태가 자동 만료되기까지의 일수 (README 시나리오 4)',
      },
      ...timestamps(),
    ],
  },

  {
    name: 'calculator_item_tb',
    label: '계산기 항목',
    comment: "미니타투 계산기의 질문 항목 (예: '크기', '색상', '부위').",
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id(), existing: false },
      {
        name: 'name',
        type: { kind: 'varchar', length: 50 },
        field: 'name',
        serverSet: true,
        comment: '항목명',
      },
      {
        name: 'display_order',
        type: { kind: 'int' },
        default: '0',
        serverSet: true,
        comment: '표시 순서',
      },
      ...timestamps(),
    ],
  },

  {
    name: 'calculator_option_tb',
    label: '계산기 선택지',
    comment: '항목별 선택지와 가산 금액.',
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id(), existing: false },
      {
        name: 'item_id',
        type: { kind: 'bigint' },
        index: true,
        serverSet: true,
        comment: 'calculator_item_tb.id',
      },
      {
        name: 'label',
        type: { kind: 'varchar', length: 100 },
        field: 'label',
        serverSet: true,
        comment: "선택지 문구 (예: '3~5cm')",
      },
      {
        name: 'amount',
        type: { kind: 'int' },
        default: '0',
        field: 'amount',
        serverSet: true,
        comment: '가산 금액(원). 0이면 프론트가 표시하지 않는다',
      },
      {
        name: 'display_order',
        type: { kind: 'int' },
        default: '0',
        serverSet: true,
        comment: '표시 순서',
      },
      ...timestamps(),
    ],
    foreignKeys: [
      {
        column: 'item_id',
        references: { table: 'calculator_item_tb', column: 'id' },
        onDelete: 'CASCADE',
      },
    ],
  },

  {
    name: 'custom_option_tb',
    label: '커스텀 선택지',
    comment:
      '커스텀 예약 퍼널의 선택지 (장르·부위·크기·성별·연령대). 프론트에 하드코딩하면 장르 하나 추가에도 배포가 필요해진다.',
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id(), existing: false },
      {
        name: 'option_group',
        type: { kind: 'varchar', length: 30 },
        index: true,
        serverSet: true,
        comment: "선택지 묶음 ('genre' | 'bodyPart' | 'size' | 'gender' | 'age')",
      },
      {
        name: 'value',
        type: { kind: 'varchar', length: 100 },
        serverSet: true,
        comment: '선택지 값. 예약 레코드에 이 문자열이 그대로 저장된다',
      },
      {
        name: 'description',
        type: { kind: 'varchar', length: 200 },
        nullable: true,
        serverSet: true,
        comment: "감을 잡게 하는 비유 (예: '동전 크기 정도'). 크기 항목에만 쓴다",
      },
      {
        name: 'display_order',
        type: { kind: 'int' },
        default: '0',
        serverSet: true,
        comment: '표시 순서',
      },
      ...timestamps(),
    ],
    indexes: [{ name: 'uq_custom_option', columns: ['option_group', 'value'], unique: true }],
  },

  {
    name: 'shop_schedule_tb',
    label: '영업 일정',
    comment:
      '휴무일·임시휴업. 여기에 있는 날짜는 예약 가능 목록에서 제외된다. 정기 휴무(월요일)는 요일 규칙이라 별도 컬럼으로 두었다.',
    status: 'new',
    primaryKey: ['id'],
    columns: [
      { ...id(), existing: false },
      {
        name: 'artist_id',
        type: { kind: 'bigint' },
        nullable: true,
        index: true,
        serverSet: true,
        comment: 'NULL이면 샵 전체 휴무, 값이 있으면 해당 아티스트만 휴가',
      },
      {
        name: 'closed_date',
        type: { kind: 'date' },
        index: true,
        serverSet: true,
        comment: '휴무 날짜',
      },
      {
        name: 'reason',
        type: { kind: 'varchar', length: 200 },
        nullable: true,
        serverSet: true,
        comment: "사유 (예: '광복절 연휴')",
      },
      ...timestamps(),
    ],
    foreignKeys: [
      {
        column: 'artist_id',
        references: { table: 'artist_tb', column: 'id' },
        onDelete: 'CASCADE',
      },
    ],
    indexes: [{ name: 'uq_shop_schedule', columns: ['artist_id', 'closed_date'], unique: true }],
  },
];

/** 이름으로 테이블 찾기. check.ts와 generate.ts가 쓴다. */
export function findTable(name: string): TableSpec | undefined {
  return TABLES.find((table) => table.name === name);
}
