import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ENDPOINT_BINDINGS, FLOWS } from './flows.ts';
import { buildAll } from './generate.ts';
import { TABLES, findTable } from './tables.ts';

/* ---------------------------------------------------------------------------
 * 드리프트 검사기.
 *
 *   pnpm db:check
 *
 * 무엇을 막는가 — 화면·계약·DB 중 하나만 바뀌고 나머지가 안 따라오는 상황.
 *
 *   1) 생성물 최신 여부   db/*.sql, docs/ERD.md가 contract와 일치하는가
 *   2) 퍼널 → 컬럼        퍼널 코드의 단계가 flows.ts와 같은가, 그 컬럼이 존재하는가
 *   3) 컬럼 → 퍼널        NOT NULL인데 아무도 채우지 않는 컬럼이 있는가
 *   4) 건너뛰기 → NULL    건너뛸 수 있는 단계의 컬럼이 nullable인가
 *   5) 저장소 ↔ 엔드포인트 메서드와 API 상수가 짝을 이루는가
 *
 * 2번은 퍼널 컴포넌트의 STEPS 배열을 텍스트로 읽어 비교한다. AST 파싱까지 하지 않는
 * 이유는 우리가 쓴 파일이고 형식이 고정되어 있어서다 — 형식이 바뀌면 검사기가
 * "STEPS를 찾을 수 없다"고 실패하므로 조용히 통과하는 일은 없다.
 * ------------------------------------------------------------------------- */

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

interface Problem {
  rule: string;
  message: string;
  fix: string;
}

const problems: Problem[] = [];

function report(rule: string, message: string, fix: string) {
  problems.push({ rule, message, fix });
}

function readRepoFile(relativePath: string): string | null {
  try {
    return readFileSync(resolve(REPO_ROOT, relativePath), 'utf8');
  } catch {
    return null;
  }
}

/**
 * 줄바꿈을 LF로 통일한다.
 *
 * .gitattributes가 LF를 강제하지만, core.autocrlf=true인 환경에서 그 설정 이전에
 * 체크아웃된 작업 복사본은 CRLF일 수 있다. 생성기는 항상 LF를 쓰므로 비교 전에
 * 양쪽을 맞춘다. 이걸 빼면 "줄바꿈만 다른데 전체 파일이 낡았다"고 신고한다.
 */
function normalizeEol(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

/* ── 1. 생성물이 최신인가 ───────────────────────────────── */

function checkGeneratedFiles() {
  for (const file of buildAll()) {
    const onDisk = readRepoFile(file.path);

    if (onDisk === null) {
      report('생성물 누락', `${file.path}이 없습니다.`, 'pnpm db:generate 를 실행하세요.');
      continue;
    }

    const normalizedDisk = normalizeEol(onDisk);
    const normalizedExpected = normalizeEol(file.content);

    if (normalizedDisk !== normalizedExpected) {
      // 어디가 다른지 첫 지점을 알려준다. 전체 diff는 git diff로 보면 된다.
      const expected = normalizedExpected.split('\n');
      const actual = normalizedDisk.split('\n');
      const at = expected.findIndex((line, index) => actual[index] !== line);

      report(
        '생성물 낡음',
        `${file.path}이 contract와 다릅니다 (${at >= 0 ? `${at + 1}번째 줄부터` : '길이 불일치'}).`,
        'contract를 고친 뒤 pnpm db:generate 를 실행하지 않았거나, 생성물을 직접 수정했습니다. pnpm db:generate 후 git diff로 확인하세요.',
      );
    }
  }
}

/* ── 2. 퍼널 단계 ↔ flows.ts ────────────────────────────── */

/**
 * 퍼널 컴포넌트에서 `const STEPS = [...] as const;` 배열을 읽는다.
 * 못 찾으면 실패로 처리한다 — 조용히 통과하면 검사가 무의미하다.
 */
function extractSteps(source: string): string[] | null {
  const match = source.match(/const STEPS = \[([\s\S]*?)\]\s*as const;/);
  if (!match?.[1]) return null;

  const items = match[1].match(/'([^']+)'/g);
  if (!items) return null;
  return items.map((item) => item.slice(1, -1));
}

function checkFlowSteps() {
  for (const flow of FLOWS) {
    const source = readRepoFile(flow.sourceFile);

    if (source === null) {
      report(
        '퍼널 파일 없음',
        `${flow.label}의 화면 코드 ${flow.sourceFile}을 찾을 수 없습니다.`,
        '파일을 옮겼다면 packages/contract/src/flows.ts의 sourceFile을 고치세요.',
      );
      continue;
    }

    const actualSteps = extractSteps(source);
    if (actualSteps === null) {
      report(
        '단계 배열 파싱 실패',
        `${flow.sourceFile}에서 \`const STEPS = [...] as const;\`를 찾지 못했습니다.`,
        '퍼널이 STEPS 상수로 단계를 선언하도록 유지하세요. 검사기가 이 형식을 읽습니다.',
      );
      continue;
    }

    const declared = flow.steps.map((step) => step.id);

    const missingInContract = actualSteps.filter((step) => !declared.includes(step));
    if (missingInContract.length > 0) {
      report(
        '화면에만 있는 단계',
        `${flow.label}: 화면에는 [${missingInContract.join(', ')}] 단계가 있는데 flows.ts에 없습니다.`,
        `packages/contract/src/flows.ts의 ${flow.id}에 단계를 추가하고, 그 단계가 받는 값을 담을 컬럼을 tables.ts에 만드세요.`,
      );
    }

    const missingInCode = declared.filter((step) => !actualSteps.includes(step));
    if (missingInCode.length > 0) {
      report(
        'flows.ts에만 있는 단계',
        `${flow.label}: flows.ts에 [${missingInCode.join(', ')}] 단계가 있는데 화면에는 없습니다.`,
        `단계를 없앴다면 flows.ts에서도 지우고, 그 단계만 쓰던 컬럼이 남았는지 확인하세요.`,
      );
    }

    // 순서까지 확인한다. 순서가 다르면 진행 표시("3 / 8")가 실제와 어긋난다.
    if (
      missingInContract.length === 0 &&
      missingInCode.length === 0 &&
      actualSteps.join(',') !== declared.join(',')
    ) {
      report(
        '단계 순서 불일치',
        `${flow.label}: 화면은 [${actualSteps.join(', ')}], flows.ts는 [${declared.join(', ')}] 순서입니다.`,
        'flows.ts의 steps 배열 순서를 화면의 STEPS와 맞추세요.',
      );
    }

    /* 각 단계가 채운다고 선언한 컬럼이 실제로 있는가 */
    for (const step of flow.steps) {
      for (const reference of step.collects) {
        const [tableName, columnName] = reference.split('.');
        const table = tableName ? findTable(tableName) : undefined;

        if (!table) {
          report(
            '없는 테이블 참조',
            `${flow.label} / ${step.id} 단계가 존재하지 않는 테이블 \`${tableName}\`을 참조합니다.`,
            'flows.ts의 collects를 고치거나 tables.ts에 테이블을 추가하세요.',
          );
          continue;
        }

        const column = table.columns.find((candidate) => candidate.name === columnName);
        if (!column) {
          report(
            '없는 컬럼 참조',
            `${flow.label} / ${step.id} 단계가 \`${reference}\`를 채운다고 선언했지만 그 컬럼이 없습니다.`,
            `tables.ts의 ${tableName}에 \`${columnName}\` 컬럼을 추가하고 pnpm db:generate 를 실행하세요.`,
          );
          continue;
        }

        /* 4. 건너뛸 수 있는 단계의 컬럼은 NULL을 허용해야 한다 */
        if (step.skippable && !column.nullable && column.default === undefined) {
          report(
            '건너뛰기 vs NOT NULL',
            `${flow.label} / ${step.id}는 건너뛸 수 있는데 \`${reference}\`가 NOT NULL이고 기본값도 없습니다.`,
            `사용자가 건너뛰면 저장할 값이 없어 INSERT가 실패합니다. tables.ts에서 nullable: true를 주거나 기본값을 정하세요.`,
          );
        }
      }
    }
  }
}

/* ── 3. 아무도 채우지 않는 NOT NULL 컬럼 ────────────────── */

function checkUncollectedColumns() {
  // 퍼널이 채우는 컬럼 전체를 모은다.
  const collected = new Set(FLOWS.flatMap((flow) => flow.steps.flatMap((step) => step.collects)));

  // 퍼널이 레코드를 만드는 테이블만 검사한다. 관리자가 직접 입력하는
  // 콘텐츠 테이블(공지·FAQ 등)은 퍼널과 무관하므로 대상이 아니다.
  const flowTargets = new Set(FLOWS.map((flow) => flow.writesTo));
  // 고객 이메일이 들어가는 user_tb도 퍼널이 채우므로 포함한다.
  flowTargets.add('user_tb');

  for (const table of TABLES) {
    if (!flowTargets.has(table.name)) continue;

    for (const column of table.columns) {
      if (column.nullable) continue;
      if (column.default !== undefined) continue;
      if (column.serverSet) continue;
      if (collected.has(`${table.name}.${column.name}`)) continue;

      report(
        '채우는 곳이 없는 컬럼',
        `\`${table.name}.${column.name}\`은 NOT NULL이고 기본값도 없는데 어떤 퍼널 단계도 채우지 않습니다.`,
        `화면에서 입력받아야 한다면 flows.ts의 해당 단계 collects에 추가하세요. 서버가 채운다면 tables.ts에서 serverSet: true를 주세요.`,
      );
    }
  }
}

/* ── 5. 저장소 메서드 ↔ API 엔드포인트 ─────────────────── */

function checkEndpointBindings() {
  const repositorySource = readRepoFile('apps/web/src/data/repository.ts');
  const endpointsSource = readRepoFile('packages/api-client/src/endpoints.ts');

  if (repositorySource === null || endpointsSource === null) {
    report(
      '파일 없음',
      'repository.ts 또는 endpoints.ts를 읽을 수 없습니다.',
      '파일을 옮겼다면 packages/contract/src/check.ts의 경로를 고치세요.',
    );
    return;
  }

  /* TattooRepository 인터페이스 본문에서 메서드명을 뽑는다 */
  const interfaceMatch = repositorySource.match(
    /export interface TattooRepository \{([\s\S]*?)\n\}/,
  );
  if (!interfaceMatch?.[1]) {
    report(
      '저장소 인터페이스 파싱 실패',
      'repository.ts에서 `export interface TattooRepository { ... }`를 찾지 못했습니다.',
      '인터페이스 선언 형식을 유지하세요. 검사기가 이 형식을 읽습니다.',
    );
    return;
  }

  // 들여쓰기 2칸 + 메서드명 + '(' 형태만 잡는다. 주석과 프로퍼티는 걸러진다.
  const methodNames = [...interfaceMatch[1].matchAll(/^ {2}(\w+)\s*\(/gm)].map(
    (match) => match[1] as string,
  );

  const boundMethods = new Set(ENDPOINT_BINDINGS.map((binding) => binding.method));

  for (const method of methodNames) {
    if (!boundMethods.has(method)) {
      report(
        '엔드포인트 미선언',
        `저장소 메서드 \`${method}\`에 대응하는 엔드포인트가 flows.ts에 선언되지 않았습니다.`,
        `packages/api-client/src/endpoints.ts의 API에 경로를 추가하고, flows.ts의 ENDPOINT_BINDINGS에 짝을 등록하세요.`,
      );
    }
  }

  for (const binding of ENDPOINT_BINDINGS) {
    if (!methodNames.includes(binding.method)) {
      report(
        '없는 메서드 바인딩',
        `ENDPOINT_BINDINGS에 \`${binding.method}\`가 있는데 저장소 인터페이스에는 없습니다.`,
        '메서드를 없앴다면 flows.ts의 ENDPOINT_BINDINGS에서도 지우세요.',
      );
    }

    /* 엔드포인트 상수가 실제로 있는가 */
    for (const endpoint of binding.endpoints) {
      // `  키: '...'` 또는 `  키: (id) => ...` 두 형태를 모두 잡는다.
      const declared = new RegExp(`^\\s{2}${endpoint}:`, 'm').test(endpointsSource);
      if (!declared) {
        report(
          '없는 엔드포인트 상수',
          `\`${binding.method}\`가 참조하는 API 키 \`${endpoint}\`가 endpoints.ts에 없습니다.`,
          `packages/api-client/src/endpoints.ts의 API 객체에 \`${endpoint}\`를 추가하세요.`,
        );
      }
    }
  }
}

/* ── 실행 ───────────────────────────────────────────────── */

function main() {
  checkGeneratedFiles();
  checkFlowSteps();
  checkUncollectedColumns();
  checkEndpointBindings();

  if (problems.length === 0) {
    console.log('✓ 계약 · 화면 · DB 스키마가 일치합니다.');
    console.log(
      `  테이블 ${TABLES.length}개 · 흐름 ${FLOWS.length}개 · 엔드포인트 바인딩 ${ENDPOINT_BINDINGS.length}개`,
    );
    return;
  }

  console.error(`✗ ${problems.length}건의 불일치를 발견했습니다.\n`);

  // 규칙별로 묶어서 보여준다. 같은 원인으로 여러 건이 나오는 경우가 많다.
  const byRule = new Map<string, Problem[]>();
  for (const problem of problems) {
    const bucket = byRule.get(problem.rule) ?? [];
    bucket.push(problem);
    byRule.set(problem.rule, bucket);
  }

  for (const [rule, items] of byRule) {
    console.error(`[${rule}]`);
    for (const item of items) {
      console.error(`  · ${item.message}`);
      console.error(`    → ${item.fix}`);
    }
    console.error('');
  }

  process.exit(1);
}

main();
