-- ⚠️ 이 파일은 생성물입니다. 직접 수정하지 마세요.
-- 원본: packages/contract/src/tables.ts
-- 재생성: pnpm db:generate
--
-- 수정하려면 원본을 고치고 재생성 명령을 실행하세요.
-- 직접 수정하면 `pnpm db:check`가 실패합니다.

-- 이미 운영 중인 DB에 적용하는 마이그레이션입니다.
--
-- 가정: admin_tb · artist_tb · token_blacklist_tb가 이미 있고, 컬럼 구성은
--       apps/api의 엔티티 필드와 1:1이다 (매퍼 XML이 SELECT * 하고 있으므로).
--       실제 DB와 다르면 tables.ts의 `existing` 플래그를 고치고 재생성하세요.
--
-- ⚠️ 운영 DB에 적용하기 전에 반드시 백업하세요.

USE `tattoo`;

-- ── 1. 기존 테이블에 컬럼 추가 ─────────────────────────
-- admin_tb (관리자)
ALTER TABLE `admin_tb` ADD COLUMN `login_fail_count` INT NOT NULL DEFAULT 0 COMMENT '연속 로그인 실패 횟수. 5회에서 잠금 (API-CONTRACT 0.4)';
ALTER TABLE `admin_tb` ADD COLUMN `locked_at` DATETIME NULL COMMENT '계정 잠금 시각. NULL이면 정상. 관리자만 해제 가능';
ALTER TABLE `admin_tb` ADD COLUMN `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각';
ALTER TABLE `admin_tb` ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각';

-- artist_tb (아티스트)
ALTER TABLE `artist_tb` ADD COLUMN `slack_member_id` VARCHAR(64) NULL COMMENT '슬랙 회원 ID. 알림 카드의 캘린더 등록 버튼으로 아티스트를 식별한다 (README 시나리오 1)';
ALTER TABLE `artist_tb` ADD COLUMN `google_calendar_id` VARCHAR(255) NULL COMMENT '구글 캘린더 ID. 확정 시 여기에 일정을 등록한다';
ALTER TABLE `artist_tb` ADD COLUMN `display_order` INT NOT NULL DEFAULT 0 COMMENT '공개 목록 노출 순서. 작을수록 먼저';
ALTER TABLE `artist_tb` ADD KEY `idx_artist_tb_display_order` (`display_order`);
ALTER TABLE `artist_tb` ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'false면 공개 목록에서 제외. 계정은 유지된다';
ALTER TABLE `artist_tb` ADD COLUMN `login_fail_count` INT NOT NULL DEFAULT 0 COMMENT '연속 로그인 실패 횟수';
ALTER TABLE `artist_tb` ADD COLUMN `locked_at` DATETIME NULL COMMENT '계정 잠금 시각';
ALTER TABLE `artist_tb` ADD COLUMN `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각';
ALTER TABLE `artist_tb` ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각';

-- token_blacklist_tb: 추가할 컬럼 없음
-- ── 2. 신설 테이블 ─────────────────────────────────────

-- 아티스트 장르: 아티스트의 주력 장르. 한 아티스트가 여러 장르를 갖고, 응답에서는 genres 배열로 묶인다. 별도 테이블로 뺀 이유는 장르로 도안을 필터링하고 통계를 내야 하기 때문 — 콤마 문자열로 두면 둘 다 못 한다.
CREATE TABLE IF NOT EXISTS `artist_genre_tb` (
  `artist_id` BIGINT NOT NULL COMMENT 'artist_tb.id',
  `genre` VARCHAR(50) NOT NULL COMMENT '장르명 (예: ''라인워크'', ''블랙워크'')',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT '표시 순서',
  PRIMARY KEY (`artist_id`, `genre`),
  KEY `idx_artist_genre_genre` (`genre`),
  CONSTRAINT `fk_artist_genre_tb_artist_id` FOREIGN KEY (`artist_id`) REFERENCES `artist_tb` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='아티스트 장르';

-- 고객: 비로그인 고객. 이메일만으로 식별한다. 같은 이메일로 재예약하면 같은 행을 재사용해 재방문 고객을 판별한다 (README 고객 관리).
CREATE TABLE IF NOT EXISTS `user_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `email` VARCHAR(255) NOT NULL COMMENT '예약 시 입력한 이메일. 로그인은 하지 않는다',
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '구글 이메일 인증 완료 여부 (README 시나리오 1)',
  `is_blacklisted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'true면 예약 시도가 차단되고 관리자에게 슬랙 알림이 간다 (README 시나리오 3)',
  `blacklist_reason` VARCHAR(500) NULL COMMENT '블랙리스트 지정 사유. 관리자 전용',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_tb_email` (`email`),
  KEY `idx_user_tb_is_blacklisted` (`is_blacklisted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고객';

-- 플래시 도안: 바로 예약 가능한 완성 도안.
CREATE TABLE IF NOT EXISTS `flash_design_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `artist_id` BIGINT NOT NULL COMMENT 'artist_tb.id',
  `image_url` VARCHAR(512) NOT NULL COMMENT '도안 이미지',
  `estimated_time` INT NOT NULL COMMENT '예상 시술 시간(분). 시간대 마감 계산에 쓴다',
  `price` VARCHAR(50) NOT NULL COMMENT '표시용 금액 문자열 (예: ''90,000''). 엔티티가 String이라 유지했다 — 계산에는 쓰지 않는다',
  `price_amount` INT NULL COMMENT '집계용 숫자 금액. price가 문자열이라 매출 통계를 낼 수 없어 별도로 둔다 (API-CONTRACT 4.3)',
  `category` VARCHAR(50) NULL COMMENT '크기 분류 (예: ''미니'', ''스탠다드'', ''라지'')',
  `genre` VARCHAR(50) NULL COMMENT '장르. 공개 목록 필터에 쓴다',
  `is_sold_out` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'true면 목록에는 남지만 예약할 수 없다',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT '노출 순서',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`),
  KEY `idx_flash_design_tb_artist_id` (`artist_id`),
  KEY `idx_flash_design_tb_category` (`category`),
  KEY `idx_flash_design_tb_genre` (`genre`),
  CONSTRAINT `fk_flash_design_tb_artist_id` FOREIGN KEY (`artist_id`) REFERENCES `artist_tb` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='플래시 도안';

-- 플래시 예약: 도안을 골라 날짜·시간을 지정하는 예약. 프론트 퍼널 4단계로 수집된다.
CREATE TABLE IF NOT EXISTS `flash_reservation_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `reservation_number` VARCHAR(20) NOT NULL COMMENT '고객 조회용 번호 (예: ''TT-2026-0148''). id를 노출하면 순차 대입으로 남의 예약을 볼 수 있어 별도 컬럼이 필요하다 (API-CONTRACT 0.7)',
  `user_id` BIGINT NOT NULL COMMENT 'user_tb.id. 이메일로 찾거나 새로 만든다',
  `flash_design_id` BIGINT NOT NULL COMMENT 'flash_design_tb.id',
  `artist_id` BIGINT NOT NULL COMMENT '도안의 아티스트를 예약 시점에 복사해 둔다. 도안이 다른 아티스트에게 넘어가도 과거 예약의 담당자는 바뀌지 않아야 한다',
  `preferred_date` DATE NOT NULL COMMENT '희망 시술 날짜',
  `preferred_time` TIME NOT NULL COMMENT '희망 시술 시각',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '예약 상태 — 0=WAITING 1=PAYMENT_PENDING 2=CONFIRMED 3=NO_RESPONSE 4=CANCELLED',
  `contact_channel_url` VARCHAR(512) NULL COMMENT '고객에게 안내한 연락 채널',
  `privacy_agreed_at` DATETIME NOT NULL COMMENT '개인정보처리방침 동의 시각. 동의 여부를 boolean으로만 두면 언제 동의했는지 증명할 수 없다',
  `admin_memo` TEXT NULL COMMENT '관리자 내부 메모. 고객에게 보이지 않는다',
  `requested_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '예약 접수 시각. 만료 기간 계산의 기준',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_flash_reservation_tb_reservation_number` (`reservation_number`),
  KEY `idx_flash_reservation_tb_user_id` (`user_id`),
  KEY `idx_flash_reservation_tb_flash_design_id` (`flash_design_id`),
  KEY `idx_flash_reservation_tb_artist_id` (`artist_id`),
  KEY `idx_flash_reservation_tb_preferred_date` (`preferred_date`),
  KEY `idx_flash_reservation_tb_status` (`status`),
  KEY `uq_flash_slot` (`artist_id`, `preferred_date`, `preferred_time`),
  CONSTRAINT `fk_flash_reservation_tb_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_tb` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_flash_reservation_tb_flash_design_id` FOREIGN KEY (`flash_design_id`) REFERENCES `flash_design_tb` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_flash_reservation_tb_artist_id` FOREIGN KEY (`artist_id`) REFERENCES `artist_tb` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ck_flash_reservation_tb_status` CHECK (status IN (0, 1, 2, 3, 4))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='플래시 예약';

-- 커스텀 예약: 도안부터 상담하는 예약. 프론트 퍼널 8단계로 수집된다.
CREATE TABLE IF NOT EXISTS `custom_reservation_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `reservation_number` VARCHAR(20) NOT NULL COMMENT '고객 조회용 번호',
  `user_id` BIGINT NOT NULL COMMENT 'user_tb.id',
  `artist_id` BIGINT NULL COMMENT 'NULL 허용 — 고객이 ''추천해 주세요''를 고르면 상담 후 배정한다',
  `tattoo_genre` VARCHAR(50) NOT NULL COMMENT '희망 스타일',
  `body_part` VARCHAR(50) NOT NULL COMMENT '시술 부위',
  `tattoo_size` VARCHAR(50) NOT NULL COMMENT '희망 크기',
  `gender` VARCHAR(20) NOT NULL COMMENT '성별. ''선택하지 않음''도 값으로 저장한다',
  `age` VARCHAR(20) NOT NULL COMMENT '연령대 (예: ''20대''). 미성년자는 보호자 동의가 필요하다',
  `preferred_date` DATE NULL COMMENT 'NULL 허용 — 커스텀은 상담에서 날짜를 정할 수 있다',
  `funnel` VARCHAR(100) NULL COMMENT '유입 경로 (예: ''인스타그램''). 마케팅 분석용',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '예약 상태 — 0=WAITING 1=PAYMENT_PENDING 2=CONFIRMED 3=NO_RESPONSE 4=CANCELLED',
  `progress_step` VARCHAR(100) NULL COMMENT '커스텀 진행단계. 관리자가 목록을 편집한다 (README 예약 설정)',
  `contact_channel_url` VARCHAR(512) NULL COMMENT '안내한 연락 채널',
  `privacy_agreed_at` DATETIME NOT NULL COMMENT '개인정보처리방침 동의 시각',
  `admin_memo` TEXT NULL COMMENT '관리자 내부 메모',
  `requested_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '접수 시각',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_custom_reservation_tb_reservation_number` (`reservation_number`),
  KEY `idx_custom_reservation_tb_user_id` (`user_id`),
  KEY `idx_custom_reservation_tb_artist_id` (`artist_id`),
  KEY `idx_custom_reservation_tb_preferred_date` (`preferred_date`),
  KEY `idx_custom_reservation_tb_status` (`status`),
  CONSTRAINT `fk_custom_reservation_tb_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_tb` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_custom_reservation_tb_artist_id` FOREIGN KEY (`artist_id`) REFERENCES `artist_tb` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ck_custom_reservation_tb_status` CHECK (status IN (0, 1, 2, 3, 4))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='커스텀 예약';

-- 공지사항: 관리자가 등록하는 공지. 고정 공지가 메인 화면에 노출된다.
CREATE TABLE IF NOT EXISTS `notice_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `title` VARCHAR(200) NOT NULL COMMENT '제목',
  `body` TEXT NOT NULL COMMENT '본문',
  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'true면 목록 최상단 + 메인 화면 노출',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '작성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`),
  KEY `idx_notice_tb_is_pinned` (`is_pinned`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공지사항';

-- FAQ: 자주 묻는 질문. 이용 안내 화면에 표시된다.
CREATE TABLE IF NOT EXISTS `faq_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `question` VARCHAR(300) NOT NULL COMMENT '질문',
  `answer` TEXT NOT NULL COMMENT '답변',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT '표시 순서',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='FAQ';

-- 사이트 문구: 배너·위치·관리법 등 관리자가 편집하는 문구. locale 열로 한/영을 분리해 다국어를 지원한다 — 컬럼을 title_ko/title_en으로 늘리면 언어 추가마다 스키마가 바뀐다.
CREATE TABLE IF NOT EXISTS `site_content_tb` (
  `locale` VARCHAR(5) NOT NULL COMMENT '언어 코드 (''ko'' | ''en'')',
  `content_key` VARCHAR(100) NOT NULL COMMENT '문구 키 (예: ''heroTitle'', ''aftercareGuide'')',
  `content_value` TEXT NOT NULL COMMENT '문구 본문. 줄바꿈을 그대로 보존한다',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`locale`, `content_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사이트 문구';

-- 예약금 정책: 예약금 금액과 입금 계좌, 대기 만료 일수. 행이 하나만 존재한다(id=1). 설정값이라 테이블 하나에 몰아넣었다.
CREATE TABLE IF NOT EXISTS `deposit_policy_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK. 항상 1',
  `flash_amount` INT NOT NULL COMMENT '플래시 예약금(원)',
  `custom_amount` INT NOT NULL COMMENT '커스텀 상담 예약금(원)',
  `bank_name` VARCHAR(50) NULL COMMENT '입금 은행',
  `account_number` VARCHAR(50) NULL COMMENT '계좌번호',
  `holder_name` VARCHAR(50) NULL COMMENT '예금주',
  `paypal_url` VARCHAR(512) NULL COMMENT '해외 고객용 페이팔 링크',
  `expire_after_days` INT NOT NULL DEFAULT 3 COMMENT '대기 상태가 자동 만료되기까지의 일수 (README 시나리오 4)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='예약금 정책';

-- 계산기 항목: 미니타투 계산기의 질문 항목 (예: '크기', '색상', '부위').
CREATE TABLE IF NOT EXISTS `calculator_item_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `name` VARCHAR(50) NOT NULL COMMENT '항목명',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT '표시 순서',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='계산기 항목';

-- 계산기 선택지: 항목별 선택지와 가산 금액.
CREATE TABLE IF NOT EXISTS `calculator_option_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `item_id` BIGINT NOT NULL COMMENT 'calculator_item_tb.id',
  `label` VARCHAR(100) NOT NULL COMMENT '선택지 문구 (예: ''3~5cm'')',
  `amount` INT NOT NULL DEFAULT 0 COMMENT '가산 금액(원). 0이면 프론트가 표시하지 않는다',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT '표시 순서',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`),
  KEY `idx_calculator_option_tb_item_id` (`item_id`),
  CONSTRAINT `fk_calculator_option_tb_item_id` FOREIGN KEY (`item_id`) REFERENCES `calculator_item_tb` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='계산기 선택지';

-- 커스텀 선택지: 커스텀 예약 퍼널의 선택지 (장르·부위·크기·성별·연령대). 프론트에 하드코딩하면 장르 하나 추가에도 배포가 필요해진다.
CREATE TABLE IF NOT EXISTS `custom_option_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `option_group` VARCHAR(30) NOT NULL COMMENT '선택지 묶음 (''genre'' | ''bodyPart'' | ''size'' | ''gender'' | ''age'')',
  `value` VARCHAR(100) NOT NULL COMMENT '선택지 값. 예약 레코드에 이 문자열이 그대로 저장된다',
  `description` VARCHAR(200) NULL COMMENT '감을 잡게 하는 비유 (예: ''동전 크기 정도''). 크기 항목에만 쓴다',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT '표시 순서',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`),
  KEY `idx_custom_option_tb_option_group` (`option_group`),
  UNIQUE KEY `uq_custom_option` (`option_group`, `value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='커스텀 선택지';

-- 영업 일정: 휴무일·임시휴업. 여기에 있는 날짜는 예약 가능 목록에서 제외된다. 정기 휴무(월요일)는 요일 규칙이라 별도 컬럼으로 두었다.
CREATE TABLE IF NOT EXISTS `shop_schedule_tb` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `artist_id` BIGINT NULL COMMENT 'NULL이면 샵 전체 휴무, 값이 있으면 해당 아티스트만 휴가',
  `closed_date` DATE NOT NULL COMMENT '휴무 날짜',
  `reason` VARCHAR(200) NULL COMMENT '사유 (예: ''광복절 연휴'')',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
  PRIMARY KEY (`id`),
  KEY `idx_shop_schedule_tb_artist_id` (`artist_id`),
  KEY `idx_shop_schedule_tb_closed_date` (`closed_date`),
  UNIQUE KEY `uq_shop_schedule` (`artist_id`, `closed_date`),
  CONSTRAINT `fk_shop_schedule_tb_artist_id` FOREIGN KEY (`artist_id`) REFERENCES `artist_tb` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영업 일정';
