/* ---------------------------------------------------------------------------
 * 스키마 선언용 최소 DSL.
 *
 * ORM이 아니다. 목적은 하나 — 테이블 구조를 한 곳에 선언해 두고 거기서
 * DDL·ERD·검사 규칙을 뽑아내는 것이다. 런타임에 쿼리를 만들거나 매핑하지 않는다.
 * 쿼리는 MyBatis XML이 담당한다.
 *
 * 일부러 넣지 않은 기능: 관계 자동 조인, 마이그레이션 버전 관리, 타입 추론.
 * 넣기 시작하면 유지보수 대상이 되고, 그건 이 프로젝트가 지금 감당할 것이 아니다.
 * ------------------------------------------------------------------------- */

/** MySQL 8 기준 컬럼 타입. 필요한 것만 좁혀서 정의했다. */
export type SqlType =
  | { kind: 'bigint'; autoIncrement?: boolean }
  | { kind: 'int' }
  | { kind: 'tinyint' }
  | { kind: 'boolean' }
  | { kind: 'varchar'; length: number }
  | { kind: 'text' }
  | { kind: 'date' }
  | { kind: 'time' }
  | { kind: 'datetime' }
  | { kind: 'decimal'; precision: number; scale: number };

export interface ColumnSpec {
  /** DB 컬럼명 (snake_case) */
  name: string;
  type: SqlType;
  /** NULL 허용 여부. 기본 false(NOT NULL). */
  nullable?: boolean;
  /** DEFAULT 절. 문자열은 SQL 리터럴로 그대로 들어간다(예: `'0'`, `CURRENT_TIMESTAMP`). */
  default?: string;
  /** UNIQUE 제약 */
  unique?: boolean;
  /** 인덱스 생성 */
  index?: boolean;
  /** CHECK 제약 본문 (예: `status BETWEEN 0 AND 4`) */
  check?: string;
  /**
   * 대응하는 도메인 타입 필드명 (camelCase).
   * 없으면 DB 전용 컬럼(예: created_at, password_hash)이라는 뜻이다.
   */
  field?: string;
  /** 컬럼 주석. DDL의 COMMENT와 ERD 문서에 함께 들어간다. */
  comment: string;
  /**
   * 기존 DB에 이미 있는 컬럼인지.
   *
   * true면 마이그레이션 SQL에서 ALTER TABLE ADD COLUMN 대상에서 제외한다.
   * `admin_tb`·`artist_tb`·`token_blacklist_tb`는 이미 운영 중이라고 가정했다
   * (매퍼 XML이 SELECT하고 있으므로). 실제와 다르면 이 플래그를 고치면 된다.
   */
  existing?: boolean;
  /**
   * 서버가 채우는 값인지.
   *
   * true면 "어느 화면에서도 입력받지 않는다"는 뜻이고, check.ts가 이 컬럼을
   * 미수집 항목으로 신고하지 않는다. id·생성시각·상태 초기값 등이 여기 해당한다.
   */
  serverSet?: boolean;
}

export interface ForeignKeySpec {
  column: string;
  references: { table: string; column: string };
  /** 부모가 삭제될 때. 기본은 RESTRICT(삭제 금지). */
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

export interface TableSpec {
  name: string;
  /** 사람이 읽는 이름. ERD 문서에 쓴다. */
  label: string;
  comment: string;
  /**
   * 'existing' — 이미 DB에 있다고 가정. 마이그레이션에서는 부족한 컬럼만 ALTER로 추가.
   * 'new'      — 마이그레이션에서 CREATE TABLE로 새로 만든다.
   */
  status: 'existing' | 'new';
  columns: ColumnSpec[];
  primaryKey: string[];
  foreignKeys?: ForeignKeySpec[];
  /** 복합 인덱스 */
  indexes?: Array<{ name: string; columns: string[]; unique?: boolean }>;
}

/* ---------------------------------------------------------------------------
 * 화면 흐름 ↔ 컬럼 매핑.
 *
 * 이게 하네스의 핵심이다. "커스텀 예약에 단계를 하나 추가했다"를 선언하면,
 * check.ts가 그 단계에서 모으는 필드에 대응하는 컬럼이 있는지 확인한다. 반대로
 * NOT NULL인데 아무 단계도 채우지 않고 serverSet도 아닌 컬럼이 있으면 신고한다.
 *
 * 즉 화면을 고치고 DB를 잊거나, DB만 고치고 화면을 잊는 두 방향 모두 잡힌다.
 * ------------------------------------------------------------------------- */

export interface FlowStepSpec {
  /** 단계 식별자. 퍼널 코드의 STEPS 배열 값과 같아야 한다. */
  id: string;
  /** 화면에 나오는 질문 요약 */
  question: string;
  /**
   * 이 단계에서 사용자로부터 받는 컬럼.
   * `table.column` 형식으로 적는다.
   */
  collects: string[];
  /** 건너뛸 수 있는 단계인지. true면 해당 컬럼이 nullable이어야 한다. */
  skippable?: boolean;
}

export interface FlowSpec {
  /** 흐름 식별자 */
  id: string;
  label: string;
  /** 이 흐름이 최종적으로 만드는 레코드의 테이블 */
  writesTo: string;
  /** 퍼널 컴포넌트 파일 경로. 어긋났을 때 어디를 봐야 하는지 알려준다. */
  sourceFile: string;
  steps: FlowStepSpec[];
}

/* ---------------------------------------------------------------------------
 * 엔드포인트 ↔ 저장소 메서드 매핑.
 *
 * apps/web의 저장소 메서드 하나가 어떤 API 경로에 대응하는지 선언한다.
 * check.ts가 양쪽에 빠진 것이 없는지 확인한다 — 저장소에 메서드를 추가하고
 * 엔드포인트 상수를 안 만들거나, 그 반대 상황을 잡는다.
 * ------------------------------------------------------------------------- */

export interface EndpointBinding {
  /** apps/web/src/data/repository.ts의 메서드명 */
  method: string;
  /**
   * packages/api-client/src/endpoints.ts의 API 객체 키.
   *
   * 배열인 이유: getDashboard처럼 역할에 따라 다른 경로를 쓰는 메서드가 있다.
   */
  endpoints: string[];
  /** 백엔드 구현 여부. false면 목 저장소로만 동작한다. */
  implemented: boolean;
}
