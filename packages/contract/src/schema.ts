/* ---------------------------------------------------------------------------
 * @tattoo/contract/schema — 스키마 메타데이터.
 *
 * 생성기(generate.ts)와 검사기(check.ts)만 쓴다. 앱 코드에서 import하지 않는다 —
 * 브라우저 번들에 테이블 정의가 들어갈 이유가 없다.
 * ------------------------------------------------------------------------- */

export { ENDPOINT_BINDINGS, FLOWS } from './flows.ts';
export { TABLES, findTable } from './tables.ts';
export type {
  ColumnSpec,
  EndpointBinding,
  FlowSpec,
  FlowStepSpec,
  ForeignKeySpec,
  SqlType,
  TableSpec,
} from './spec.ts';
