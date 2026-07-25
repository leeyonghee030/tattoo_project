import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALLOWED_STATUS_TRANSITIONS, ReservationStatus } from './domain.ts';
import { FLOWS } from './flows.ts';
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
} from './seed.ts';
import type { ColumnSpec, SqlType, TableSpec } from './spec.ts';
import { TABLES } from './tables.ts';

/* ---------------------------------------------------------------------------
 * DDL · 시드 SQL · ERD 문서 생성기.
 *
 *   pnpm db:generate
 *
 * 출력물은 전부 생성물이다. 직접 수정하면 `pnpm db:check`가 실패한다.
 *   db/schema.sql               새 DB에 처음 올릴 때
 *   db/migrate-from-current.sql 이미 admin_tb·artist_tb가 있는 DB에 적용할 때
 *   db/seed.sql                 데모 데이터 (프론트 목과 동일한 내용)
 *   docs/ERD.md                 테이블 관계도 + 컬럼 설명
 *
 * 출력에 생성 시각을 넣지 않는다 — 넣으면 매번 내용이 달라져 db:check가 항상 실패한다.
 * ------------------------------------------------------------------------- */

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const GENERATED_BANNER = (source: string, command: string) =>
  [
    '-- ⚠️ 이 파일은 생성물입니다. 직접 수정하지 마세요.',
    `-- 원본: ${source}`,
    `-- 재생성: ${command}`,
    '--',
    '-- 수정하려면 원본을 고치고 재생성 명령을 실행하세요.',
    '-- 직접 수정하면 `pnpm db:check`가 실패합니다.',
  ].join('\n');

/* ── SQL 렌더링 ─────────────────────────────────────────── */

function renderType(type: SqlType): string {
  switch (type.kind) {
    case 'bigint':
      return type.autoIncrement ? 'BIGINT NOT NULL AUTO_INCREMENT' : 'BIGINT';
    case 'int':
      return 'INT';
    case 'tinyint':
      return 'TINYINT';
    case 'boolean':
      // MySQL의 BOOLEAN은 TINYINT(1)의 별칭이다. 명시적으로 적어 의도를 남긴다.
      return 'TINYINT(1)';
    case 'varchar':
      return `VARCHAR(${type.length})`;
    case 'text':
      return 'TEXT';
    case 'date':
      return 'DATE';
    case 'time':
      return 'TIME';
    case 'datetime':
      return 'DATETIME';
    case 'decimal':
      return `DECIMAL(${type.precision}, ${type.scale})`;
  }
}

/** MySQL 문자열 리터럴. 역슬래시와 인용부호를 모두 이스케이프한다. */
function sqlString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  return sqlString(String(value));
}

function renderColumn(column: ColumnSpec): string {
  const parts: string[] = [`  \`${column.name}\``, renderType(column.type)];

  // AUTO_INCREMENT 컬럼은 renderType이 이미 NOT NULL을 포함한다.
  const isAutoIncrement = column.type.kind === 'bigint' && column.type.autoIncrement;
  if (!isAutoIncrement) {
    parts.push(column.nullable ? 'NULL' : 'NOT NULL');
    if (column.default !== undefined) parts.push(`DEFAULT ${column.default}`);
  }

  parts.push(`COMMENT ${sqlString(column.comment)}`);
  return parts.join(' ');
}

/**
 * FK 의존 순서로 테이블을 정렬한다(위상 정렬).
 *
 * 참조되는 테이블이 먼저 CREATE되어야 한다. 선언 순서에 의존하면 tables.ts에서
 * 테이블 위치를 옮기는 순간 스키마가 깨진다.
 */
function sortByDependency(tables: TableSpec[]): TableSpec[] {
  const byName = new Map(tables.map((table) => [table.name, table]));
  const sorted: TableSpec[] = [];
  const state = new Map<string, 'visiting' | 'done'>();

  function visit(table: TableSpec) {
    const current = state.get(table.name);
    if (current === 'done') return;
    if (current === 'visiting') {
      throw new Error(`테이블 참조가 순환합니다: ${table.name}`);
    }
    state.set(table.name, 'visiting');

    for (const fk of table.foreignKeys ?? []) {
      // 자기 참조는 순환이 아니다(같은 테이블 안에서 해결된다).
      if (fk.references.table === table.name) continue;
      const parent = byName.get(fk.references.table);
      if (!parent) {
        throw new Error(
          `${table.name}.${fk.column}이 존재하지 않는 테이블 ${fk.references.table}을 참조합니다`,
        );
      }
      visit(parent);
    }

    state.set(table.name, 'done');
    sorted.push(table);
  }

  for (const table of tables) visit(table);
  return sorted;
}

function renderCreateTable(table: TableSpec): string {
  const lines: string[] = [];

  lines.push(`-- ${table.label}: ${table.comment}`);
  lines.push(`CREATE TABLE IF NOT EXISTS \`${table.name}\` (`);

  const body: string[] = table.columns.map(renderColumn);

  body.push(`  PRIMARY KEY (${table.primaryKey.map((key) => `\`${key}\``).join(', ')})`);

  for (const column of table.columns) {
    if (column.unique) {
      body.push(`  UNIQUE KEY \`uq_${table.name}_${column.name}\` (\`${column.name}\`)`);
    }
  }

  for (const column of table.columns) {
    // UNIQUE는 이미 인덱스를 만든다. 중복 생성하지 않는다.
    if (column.index && !column.unique) {
      body.push(`  KEY \`idx_${table.name}_${column.name}\` (\`${column.name}\`)`);
    }
  }

  for (const index of table.indexes ?? []) {
    const columns = index.columns.map((column) => `\`${column}\``).join(', ');
    body.push(`  ${index.unique ? 'UNIQUE KEY' : 'KEY'} \`${index.name}\` (${columns})`);
  }

  for (const fk of table.foreignKeys ?? []) {
    body.push(
      `  CONSTRAINT \`fk_${table.name}_${fk.column}\` FOREIGN KEY (\`${fk.column}\`) ` +
        `REFERENCES \`${fk.references.table}\` (\`${fk.references.column}\`) ` +
        `ON DELETE ${fk.onDelete ?? 'RESTRICT'}`,
    );
  }

  for (const column of table.columns) {
    if (column.check) {
      body.push(`  CONSTRAINT \`ck_${table.name}_${column.name}\` CHECK (${column.check})`);
    }
  }

  lines.push(body.join(',\n'));
  lines.push(
    `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=${sqlString(table.label)};`,
  );

  return lines.join('\n');
}

/* ── db/schema.sql ──────────────────────────────────────── */

function buildSchemaSql(): string {
  const sorted = sortByDependency(TABLES);

  return [
    GENERATED_BANNER('packages/contract/src/tables.ts', 'pnpm db:generate'),
    '',
    '-- 새 데이터베이스에 처음 올릴 때 쓰는 전체 스키마입니다.',
    '-- 이미 admin_tb·artist_tb가 있는 DB에는 db/migrate-from-current.sql을 쓰세요.',
    '',
    '-- 한글을 저장하므로 utf8mb4가 필수입니다. utf8(=utf8mb3)은 이모지를 잘라먹습니다.',
    'CREATE DATABASE IF NOT EXISTS `tattoo`',
    '  DEFAULT CHARACTER SET utf8mb4',
    '  DEFAULT COLLATE utf8mb4_unicode_ci;',
    '',
    'USE `tattoo`;',
    '',
    ...sorted.map((table) => `${renderCreateTable(table)}\n`),
  ].join('\n');
}

/* ── db/migrate-from-current.sql ────────────────────────── */

function buildMigrationSql(): string {
  const sorted = sortByDependency(TABLES);
  const lines: string[] = [
    GENERATED_BANNER('packages/contract/src/tables.ts', 'pnpm db:generate'),
    '',
    '-- 이미 운영 중인 DB에 적용하는 마이그레이션입니다.',
    '--',
    '-- 가정: admin_tb · artist_tb · token_blacklist_tb가 이미 있고, 컬럼 구성은',
    '--       apps/api의 엔티티 필드와 1:1이다 (매퍼 XML이 SELECT * 하고 있으므로).',
    '--       실제 DB와 다르면 tables.ts의 `existing` 플래그를 고치고 재생성하세요.',
    '--',
    '-- ⚠️ 운영 DB에 적용하기 전에 반드시 백업하세요.',
    '',
    'USE `tattoo`;',
    '',
  ];

  const newTables = sorted.filter((table) => table.status === 'new');
  const existingTables = sorted.filter((table) => table.status === 'existing');

  lines.push('-- ── 1. 기존 테이블에 컬럼 추가 ─────────────────────────');
  let alterCount = 0;
  for (const table of existingTables) {
    const missing = table.columns.filter((column) => !column.existing);
    if (missing.length === 0) {
      lines.push(`-- ${table.name}: 추가할 컬럼 없음`);
      continue;
    }

    lines.push(`-- ${table.name} (${table.label})`);
    for (const column of missing) {
      alterCount += 1;
      const definition = renderColumn(column).trim();
      lines.push(`ALTER TABLE \`${table.name}\` ADD COLUMN ${definition};`);
      if (column.unique) {
        lines.push(
          `ALTER TABLE \`${table.name}\` ADD UNIQUE KEY \`uq_${table.name}_${column.name}\` (\`${column.name}\`);`,
        );
      } else if (column.index) {
        lines.push(
          `ALTER TABLE \`${table.name}\` ADD KEY \`idx_${table.name}_${column.name}\` (\`${column.name}\`);`,
        );
      }
    }
    lines.push('');
  }
  if (alterCount === 0) lines.push('-- (추가할 컬럼이 없습니다)', '');

  lines.push('-- ── 2. 신설 테이블 ─────────────────────────────────────');
  lines.push('');
  for (const table of newTables) {
    lines.push(renderCreateTable(table), '');
  }

  return lines.join('\n');
}

/* ── db/seed.sql ────────────────────────────────────────── */

/**
 * 예약 이메일에서 고객 목록을 만든다.
 *
 * 시드에는 user_tb가 따로 없다 — 프론트 목은 고객을 예약에 딸린 이메일로만 다룬다.
 * DB에는 정규화된 행이 필요하므로 여기서 만들어낸다. 같은 이메일은 한 행으로 합친다
 * (실제 백엔드도 재방문 고객을 그렇게 판별해야 한다).
 */
function deriveUsers(): Array<{ id: number; email: string }> {
  const emails = [...new Set(RESERVATIONS.map((reservation) => reservation.email))].sort();
  return emails.map((email, index) => ({ id: 5001 + index, email }));
}

function buildSeedSql(): string {
  const users = deriveUsers();
  const userIdByEmail = new Map(users.map((user) => [user.email, user.id]));

  const lines: string[] = [
    GENERATED_BANNER('packages/contract/src/seed.ts', 'pnpm db:generate'),
    '',
    '-- 데모 데이터입니다. 프론트 목 저장소가 메모리에 올리는 것과 같은 내용이라',
    '-- 이 SQL을 넣으면 DATA_SOURCE=http로 바꿔도 화면이 동일하게 보입니다.',
    '',
    '-- ⚠️ 비밀번호가 평문입니다.',
    '--    현재 백엔드가 `password.equals(passwordHash)`로 평문 비교하기 때문입니다',
    '--    (docs/API-CONTRACT.md 0.3). BCrypt를 적용한 뒤에는 반드시 해시로 교체하세요.',
    '--    운영 환경에 이 시드를 그대로 넣으면 안 됩니다.',
    '',
    'USE `tattoo`;',
    '',
    '-- 외래키 때문에 삭제 순서가 중요하다. 자식부터 비운다.',
    'SET FOREIGN_KEY_CHECKS = 0;',
    'TRUNCATE TABLE `flash_reservation_tb`;',
    'TRUNCATE TABLE `custom_reservation_tb`;',
    'TRUNCATE TABLE `artist_genre_tb`;',
    'TRUNCATE TABLE `flash_design_tb`;',
    'TRUNCATE TABLE `user_tb`;',
    'TRUNCATE TABLE `artist_tb`;',
    'TRUNCATE TABLE `admin_tb`;',
    'TRUNCATE TABLE `notice_tb`;',
    'TRUNCATE TABLE `faq_tb`;',
    'TRUNCATE TABLE `site_content_tb`;',
    'TRUNCATE TABLE `deposit_policy_tb`;',
    'TRUNCATE TABLE `calculator_option_tb`;',
    'TRUNCATE TABLE `calculator_item_tb`;',
    'TRUNCATE TABLE `custom_option_tb`;',
    'TRUNCATE TABLE `shop_schedule_tb`;',
    'SET FOREIGN_KEY_CHECKS = 1;',
    '',
  ];

  /* 관리자 */
  lines.push('-- ── 관리자 ──────────────────────────────────────────');
  lines.push(
    'INSERT INTO `admin_tb` (`id`, `email`, `password_hash`) VALUES',
    `  (1, ${sqlString('admin@blanktattoo.kr')}, ${sqlString('admin1234')});`,
    '',
  );

  /* 아티스트 */
  lines.push('-- ── 아티스트 ────────────────────────────────────────');
  const emailByArtistId = new Map(
    Object.entries(ARTIST_ACCOUNTS).map(([email, artistId]) => [artistId, email]),
  );
  lines.push(
    'INSERT INTO `artist_tb`',
    '  (`id`, `email`, `password_hash`, `is_verified`, `artist_name`, `introduce`,',
    '   `artist_image_url`, `instagram_form_url`, `kakao_form_url`, `line_form_url`,',
    '   `watts_form_url`, `display_order`, `is_active`) VALUES',
  );
  lines.push(
    ARTISTS.map((artist) => {
      const email = emailByArtistId.get(artist.id) ?? `artist${artist.id}@blanktattoo.kr`;
      return (
        `  (${artist.id}, ${sqlString(email)}, ${sqlString('artist1234')}, 1, ` +
        `${sqlString(artist.artistName)}, ${sqlValue(artist.introduce)}, ` +
        `${sqlValue(artist.artistImageUrl)}, ${sqlValue(artist.socialLinks.instagram ?? null)}, ` +
        `${sqlValue(artist.socialLinks.kakao ?? null)}, ${sqlValue(artist.socialLinks.line ?? null)}, ` +
        `${sqlValue(artist.socialLinks.whatsapp ?? null)}, ${artist.displayOrder}, ` +
        `${artist.isActive ? 1 : 0})`
      );
    }).join(',\n') + ';',
  );
  lines.push('');

  /* 아티스트 장르 */
  lines.push('-- ── 아티스트 장르 ───────────────────────────────────');
  const genreRows = ARTISTS.flatMap((artist) =>
    artist.genres.map((genre, index) => `  (${artist.id}, ${sqlString(genre)}, ${index})`),
  );
  lines.push(
    'INSERT INTO `artist_genre_tb` (`artist_id`, `genre`, `display_order`) VALUES',
    genreRows.join(',\n') + ';',
    '',
  );

  /* 고객 */
  lines.push('-- ── 고객 (예약 이메일에서 도출) ─────────────────────');
  lines.push(
    'INSERT INTO `user_tb` (`id`, `email`, `is_verified`) VALUES',
    users.map((user) => `  (${user.id}, ${sqlString(user.email)}, 1)`).join(',\n') + ';',
    '',
  );

  /* 플래시 도안 */
  lines.push('-- ── 플래시 도안 ─────────────────────────────────────');
  lines.push(
    'INSERT INTO `flash_design_tb`',
    '  (`id`, `artist_id`, `image_url`, `estimated_time`, `price`, `price_amount`,',
    '   `category`, `genre`, `is_sold_out`, `display_order`) VALUES',
  );
  lines.push(
    FLASH_DESIGNS.map((design) => {
      // '90,000' → 90000. 통계용 숫자 컬럼을 채운다.
      const amount = Number(design.price.replace(/[^0-9]/g, ''));
      return (
        `  (${design.id}, ${design.artistId}, ${sqlString(design.imageUrl)}, ` +
        `${design.estimatedTime}, ${sqlString(design.price)}, ` +
        `${Number.isFinite(amount) && amount > 0 ? amount : 'NULL'}, ` +
        `${sqlValue(design.category)}, ${sqlValue(design.genre)}, ` +
        `${design.isSoldOut ? 1 : 0}, ${design.displayOrder})`
      );
    }).join(',\n') + ';',
  );
  lines.push('');

  /* 예약 */
  const flashReservations = RESERVATIONS.filter((r) => r.type === 'FLASH');
  const customReservations = RESERVATIONS.filter((r) => r.type === 'CUSTOM');

  lines.push('-- ── 플래시 예약 ─────────────────────────────────────');
  lines.push(
    'INSERT INTO `flash_reservation_tb`',
    '  (`id`, `reservation_number`, `user_id`, `flash_design_id`, `artist_id`,',
    '   `preferred_date`, `preferred_time`, `status`, `contact_channel_url`,',
    '   `privacy_agreed_at`, `admin_memo`, `requested_at`) VALUES',
  );
  lines.push(
    flashReservations
      .map(
        (r) =>
          `  (${r.id}, ${sqlString(r.reservationNumber)}, ${userIdByEmail.get(r.email)}, ` +
          `${r.flashDesignId}, ${r.artistId}, ${sqlString(r.preferredDate)}, ` +
          `${sqlString(r.preferredTime)}, ${r.status}, ${sqlValue(r.contactChannelUrl)}, ` +
          `${sqlString(r.requestedAt)}, ${sqlValue(r.adminMemo ?? null)}, ` +
          `${sqlString(r.requestedAt)})`,
      )
      .join(',\n') + ';',
  );
  lines.push('');

  lines.push('-- ── 커스텀 예약 ─────────────────────────────────────');
  lines.push(
    'INSERT INTO `custom_reservation_tb`',
    '  (`id`, `reservation_number`, `user_id`, `artist_id`, `tattoo_genre`, `body_part`,',
    '   `tattoo_size`, `gender`, `age`, `preferred_date`, `funnel`, `status`,',
    '   `progress_step`, `contact_channel_url`, `privacy_agreed_at`, `admin_memo`,',
    '   `requested_at`) VALUES',
  );
  lines.push(
    customReservations
      .map(
        (r) =>
          `  (${r.id}, ${sqlString(r.reservationNumber)}, ${userIdByEmail.get(r.email)}, ` +
          `${sqlValue(r.artistId)}, ${sqlString(r.tattooGenre)}, ${sqlString(r.bodyPart)}, ` +
          `${sqlString(r.tattooSize)}, ${sqlString(r.gender)}, ${sqlString(r.age)}, ` +
          // 커스텀은 날짜가 비어 있을 수 있다. 빈 문자열을 DATE 컬럼에 넣으면 에러가 난다.
          `${r.preferredDate ? sqlString(r.preferredDate) : 'NULL'}, ` +
          `${sqlValue(r.funnel)}, ${r.status}, ${sqlValue(r.progressStep ?? null)}, ` +
          `${sqlValue(r.contactChannelUrl)}, ${sqlString(r.requestedAt)}, ` +
          `${sqlValue(r.adminMemo ?? null)}, ${sqlString(r.requestedAt)})`,
      )
      .join(',\n') + ';',
  );
  lines.push('');

  /* 콘텐츠 */
  lines.push('-- ── 공지 ────────────────────────────────────────────');
  lines.push(
    'INSERT INTO `notice_tb` (`id`, `title`, `body`, `is_pinned`, `created_at`) VALUES',
    NOTICES.map(
      (notice) =>
        `  (${notice.id}, ${sqlString(notice.title)}, ${sqlString(notice.body)}, ` +
        `${notice.isPinned ? 1 : 0}, ${sqlString(notice.createdAt)})`,
    ).join(',\n') + ';',
    '',
  );

  lines.push('-- ── FAQ ─────────────────────────────────────────────');
  lines.push(
    'INSERT INTO `faq_tb` (`id`, `question`, `answer`, `display_order`) VALUES',
    FAQ.map(
      (entry) =>
        `  (${entry.id}, ${sqlString(entry.question)}, ${sqlString(entry.answer)}, ${entry.displayOrder})`,
    ).join(',\n') + ';',
    '',
  );

  lines.push('-- ── 사이트 문구 ─────────────────────────────────────');
  lines.push('-- 영문은 프론트 정적 사전(apps/web/src/lib/i18n.ts)에 있어 아직 DB에 없습니다.');
  lines.push('-- 관리자가 영문을 편집하려면 locale=en 행을 채워야 합니다.');
  const contentRows = Object.entries({
    heroTitle: SITE_CONTENT.heroTitle,
    heroSubtitle: SITE_CONTENT.heroSubtitle,
    shopAddress: SITE_CONTENT.shopAddress,
    shopMapUrl: SITE_CONTENT.shopMapUrl ?? '',
    aftercareGuide: SITE_CONTENT.aftercareGuide,
    instagramUrl: SITE_CONTENT.socialLinks.instagram ?? '',
    kakaoUrl: SITE_CONTENT.socialLinks.kakao ?? '',
    lineUrl: SITE_CONTENT.socialLinks.line ?? '',
  }).map(([key, value]) => `  (${sqlString('ko')}, ${sqlString(key)}, ${sqlString(value)})`);
  lines.push(
    'INSERT INTO `site_content_tb` (`locale`, `content_key`, `content_value`) VALUES',
    contentRows.join(',\n') + ';',
    '',
  );

  lines.push('-- ── 예약금 정책 ─────────────────────────────────────');
  lines.push(
    'INSERT INTO `deposit_policy_tb`',
    '  (`id`, `flash_amount`, `custom_amount`, `bank_name`, `account_number`,',
    '   `holder_name`, `paypal_url`, `expire_after_days`) VALUES',
    `  (1, ${DEPOSIT_POLICY.flashAmount}, ${DEPOSIT_POLICY.customAmount}, ` +
      `${sqlValue(DEPOSIT_POLICY.bankAccount?.bankName ?? null)}, ` +
      `${sqlValue(DEPOSIT_POLICY.bankAccount?.accountNumber ?? null)}, ` +
      `${sqlValue(DEPOSIT_POLICY.bankAccount?.holderName ?? null)}, ` +
      `${sqlValue(DEPOSIT_POLICY.paypalUrl)}, ${DEPOSIT_POLICY.expireAfterDays});`,
    '',
  );

  lines.push('-- ── 계산기 ──────────────────────────────────────────');
  lines.push(
    'INSERT INTO `calculator_item_tb` (`id`, `name`, `display_order`) VALUES',
    CALCULATOR_CONFIG.items
      .map((item, index) => `  (${item.id}, ${sqlString(item.name)}, ${index})`)
      .join(',\n') + ';',
    '',
  );
  lines.push(
    'INSERT INTO `calculator_option_tb` (`id`, `item_id`, `label`, `amount`, `display_order`) VALUES',
    CALCULATOR_CONFIG.items
      .flatMap((item) =>
        item.options.map(
          (option, index) =>
            `  (${option.id}, ${item.id}, ${sqlString(option.label)}, ${option.amount}, ${index})`,
        ),
      )
      .join(',\n') + ';',
    '',
  );
  lines.push(
    `-- baseAmount(${CALCULATOR_CONFIG.baseAmount}원)와 disclaimer는 site_content_tb에 둡니다.`,
    'INSERT INTO `site_content_tb` (`locale`, `content_key`, `content_value`) VALUES',
    `  (${sqlString('ko')}, ${sqlString('calculatorBaseAmount')}, ${sqlString(String(CALCULATOR_CONFIG.baseAmount))}),`,
    `  (${sqlString('ko')}, ${sqlString('calculatorDisclaimer')}, ${sqlString(CALCULATOR_CONFIG.disclaimer)});`,
    '',
  );

  lines.push('-- ── 커스텀 예약 선택지 ──────────────────────────────');
  const optionRows: string[] = [];
  let optionId = 1;
  const pushOptions = (group: string, values: readonly string[]) => {
    values.forEach((value, index) => {
      optionRows.push(
        `  (${optionId++}, ${sqlString(group)}, ${sqlString(value)}, NULL, ${index})`,
      );
    });
  };
  pushOptions('genre', CUSTOM_OPTIONS.genres);
  pushOptions('bodyPart', CUSTOM_OPTIONS.bodyParts);
  CUSTOM_OPTIONS.sizes.forEach((size, index) => {
    optionRows.push(
      `  (${optionId++}, ${sqlString('size')}, ${sqlString(size.value)}, ${sqlString(size.description)}, ${index})`,
    );
  });
  pushOptions('gender', CUSTOM_OPTIONS.genders);
  pushOptions('age', CUSTOM_OPTIONS.ages);
  lines.push(
    'INSERT INTO `custom_option_tb` (`id`, `option_group`, `value`, `description`, `display_order`) VALUES',
    optionRows.join(',\n') + ';',
    '',
  );

  lines.push('-- ── 영업 일정 (휴무) ────────────────────────────────');
  lines.push(
    '-- 8월 광복절 연휴 휴무 (NOTICES의 공지와 같은 기간)',
    'INSERT INTO `shop_schedule_tb` (`artist_id`, `closed_date`, `reason`) VALUES',
    ['2026-08-15', '2026-08-16', '2026-08-17', '2026-08-18']
      .map((date) => `  (NULL, ${sqlString(date)}, ${sqlString('광복절 연휴 휴무')})`)
      .join(',\n') + ';',
    '',
    '-- 월요일 정기 휴무는 날짜가 아니라 요일 규칙이라 이 테이블에 넣지 않습니다.',
    '-- 백엔드의 예약 가능 날짜 계산에서 DAYOFWEEK(date) = 2를 제외하세요.',
    '',
  );

  return lines.join('\n');
}

/* ── docs/ERD.md ────────────────────────────────────────── */

function buildErdDoc(): string {
  const sorted = sortByDependency(TABLES);

  const lines: string[] = [
    '<!-- ⚠️ 이 파일은 생성물입니다. 직접 수정하지 마세요.',
    '     원본: packages/contract/src/tables.ts, packages/contract/src/flows.ts',
    '     재생성: pnpm db:generate -->',
    '',
    '# ERD · 테이블 명세',
    '',
    '`packages/contract/src/tables.ts`에서 생성됩니다. 스키마를 바꾸려면 그 파일을 고치고',
    '`pnpm db:generate`를 실행하세요.',
    '',
    '## 관계도',
    '',
    '```mermaid',
    'erDiagram',
  ];

  for (const table of sorted) {
    for (const fk of table.foreignKeys ?? []) {
      const column = table.columns.find((c) => c.name === fk.column);
      // nullable FK는 "없을 수도 있다"를 |o로 표현한다.
      const cardinality = column?.nullable ? '|o--o{' : '||--o{';
      lines.push(`  ${fk.references.table} ${cardinality} ${table.name} : "${fk.column}"`);
    }
  }
  lines.push('```');
  lines.push('');

  lines.push('## 화면 흐름 ↔ 컬럼');
  lines.push('');
  lines.push(
    '퍼널 단계가 어떤 컬럼을 채우는지입니다. `packages/contract/src/flows.ts`에 선언되어 있고,',
    '`pnpm db:check`가 이 대응이 깨졌는지 검사합니다.',
    '',
  );

  for (const flow of FLOWS) {
    lines.push(`### ${flow.label}`);
    lines.push('');
    lines.push(`- 결과 테이블: \`${flow.writesTo}\``);
    lines.push(`- 화면 코드: \`${flow.sourceFile}\``);
    lines.push('');
    lines.push('| # | 단계 | 질문 | 채우는 컬럼 | 건너뛰기 |');
    lines.push('| --- | --- | --- | --- | --- |');
    flow.steps.forEach((step, index) => {
      const collects =
        step.collects.length > 0 ? step.collects.map((entry) => `\`${entry}\``).join('<br>') : '—';
      lines.push(
        `| ${index + 1} | \`${step.id}\` | ${step.question} | ${collects} | ${step.skippable ? '가능' : '—'} |`,
      );
    });
    lines.push('');
  }

  lines.push('## 테이블 명세');
  lines.push('');

  const statusLabel = (status: TableSpec['status']) => (status === 'existing' ? '기존' : '신설');

  lines.push('| 테이블 | 이름 | 상태 | 설명 |');
  lines.push('| --- | --- | --- | --- |');
  for (const table of sorted) {
    lines.push(
      `| \`${table.name}\` | ${table.label} | ${statusLabel(table.status)} | ${table.comment.replace(/\n/g, ' ')} |`,
    );
  }
  lines.push('');

  for (const table of sorted) {
    lines.push(`### \`${table.name}\` — ${table.label}`);
    lines.push('');
    lines.push(table.comment);
    lines.push('');
    lines.push('| 컬럼 | 타입 | NULL | 기본값 | 도메인 필드 | 설명 |');
    lines.push('| --- | --- | --- | --- | --- | --- |');
    for (const column of table.columns) {
      const type = renderType(column.type).replace(' NOT NULL AUTO_INCREMENT', ' AI');
      const nullable = column.nullable ? '✓' : '';
      const defaultValue = column.default ? `\`${column.default}\`` : '';
      const field = column.field ? `\`${column.field}\`` : '';
      lines.push(
        `| \`${column.name}\` | ${type} | ${nullable} | ${defaultValue} | ${field} | ${column.comment.replace(/\n/g, ' ')} |`,
      );
    }
    lines.push('');
  }

  lines.push('## 예약 상태 코드');
  lines.push('');
  lines.push(
    '`status` 컬럼 값입니다. `packages/contract/src/domain.ts`의 `ReservationStatus`에서',
    '생성되며, DDL의 CHECK 제약도 같은 값에서 나옵니다.',
    '',
  );
  lines.push('| 값 | 상수 | 다음 상태 |');
  lines.push('| --- | --- | --- |');
  const nameByValue = new Map(
    Object.entries(ReservationStatus).map(([name, value]) => [value, name]),
  );

  for (const [name, value] of Object.entries(ReservationStatus)) {
    // 전이 표는 domain.ts의 ALLOWED_STATUS_TRANSITIONS를 그대로 읽는다.
    // 여기에 복사해 두면 그게 바로 이 하네스가 막으려는 드리프트가 된다.
    const next = ALLOWED_STATUS_TRANSITIONS[value].map(
      (target) => nameByValue.get(target) ?? String(target),
    );
    lines.push(`| \`${value}\` | \`${name}\` | ${next.length > 0 ? next.join(', ') : '종료'} |`);
  }
  lines.push('');

  return lines.join('\n');
}

/* ── 출력 ───────────────────────────────────────────────── */

export interface GeneratedFile {
  path: string;
  content: string;
}

/** 생성 결과를 돌려준다. check.ts가 디스크에 쓰지 않고 비교할 때 쓴다. */
export function buildAll(): GeneratedFile[] {
  return [
    { path: 'db/schema.sql', content: buildSchemaSql() },
    { path: 'db/migrate-from-current.sql', content: buildMigrationSql() },
    { path: 'db/seed.sql', content: buildSeedSql() },
    { path: 'docs/ERD.md', content: buildErdDoc() },
  ];
}

function main() {
  const files = buildAll();
  for (const file of files) {
    const absolute = resolve(REPO_ROOT, file.path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, file.content, 'utf8');
    const lineCount = file.content.split('\n').length;
    console.log(`  생성 ${file.path} (${lineCount}줄)`);
  }
  console.log(`\n${files.length}개 파일을 생성했습니다.`);
}

// 직접 실행할 때만 파일을 쓴다. check.ts가 import할 때는 쓰지 않는다.
//
// import.meta.url과 argv[1]을 문자열로 비교하면 안 된다 — 경로에 ASCII가 아닌 문자가
// 있으면 URL 쪽만 퍼센트 인코딩되어 항상 불일치한다(이 저장소 경로에 '용희'가 있다).
// 양쪽을 파일 경로로 정규화해서 비교한다.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
