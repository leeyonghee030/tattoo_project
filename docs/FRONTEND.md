# 프론트엔드 가이드

`apps/web`(Next.js) + `packages/ui`(디자인 시스템) + `packages/api-client`(계약 타입) 구조 설명.

---

## 1. 실행

```bash
pnpm install

# 프론트만 (백엔드 없이 모든 화면 동작)
cp apps/web/.env.example apps/web/.env.local
pnpm dev                    # http://localhost:3000

# 백엔드
./gradlew :api:bootRun      # http://localhost:8080
```

`.env.local` 기본값은 `DATA_SOURCE=mock`, `MOCK_AUTH=1`이다. 백엔드를 띄우지 않아도
아무 이메일·비밀번호로 관리자·아티스트 로그인이 통과하고, 모든 화면이 목 데이터로 동작한다.

실제 로그인을 검증하려면 `MOCK_AUTH=0`으로 두고 Spring을 띄운다.

| 명령             | 설명                                  |
| ---------------- | ------------------------------------- |
| `pnpm dev`       | 프론트 개발 서버                      |
| `pnpm build`     | 프론트 프로덕션 빌드 (타입 검사 포함) |
| `pnpm typecheck` | 전 패키지 타입 검사                   |
| `pnpm lint`      | ESLint                                |
| `pnpm format`    | Prettier 정리                         |
| `pnpm api:dev`   | `./gradlew :api:bootRun`              |
| `pnpm api:build` | `./gradlew :api:build`                |

---

## 2. 구조

```
tattoo_project/
├─ apps/
│  ├─ api/                    Spring Boot (기존 백엔드)
│  └─ web/                    Next.js App Router
│     └─ src/
│        ├─ app/
│        │  ├─ [locale]/      고객 공개 화면 (ko · en, SSR)
│        │  ├─ admin/         관리자 콘솔
│        │  ├─ artist/        아티스트 콘솔
│        │  └─ api/auth/      BFF 로그인·로그아웃·세션
│        ├─ actions/          Server Action (예약 생성 등)
│        ├─ components/       앱 전용 컴포넌트
│        ├─ data/             데이터 소스 (mock / http 교체 지점)
│        ├─ lib/              인증·i18n·환경변수
│        └─ proxy.ts          로케일 정리 + 역할 가드
├─ packages/
│  ├─ contract/               ★ 단일 진실
│  │  └─ src/
│  │     ├─ domain.ts         도메인 타입 · 예약 상태 · 전이 규칙
│  │     ├─ tables.ts         DB 테이블·컬럼 선언
│  │     ├─ flows.ts          퍼널 단계 ↔ 컬럼, 저장소 ↔ 엔드포인트
│  │     ├─ seed.ts           데모 데이터 (목과 DB 시드 공용)
│  │     ├─ generate.ts       → db/*.sql, docs/ERD.md
│  │     └─ check.ts          드리프트 검출
│  ├─ api-client/             엔드포인트 상수 · 에러 정규화 · fetch 래퍼
│  └─ ui/                     무채색 디자인 시스템
├─ db/                        생성물 — 직접 수정 금지
├─ docs/
│  ├─ API-CONTRACT.md         ★ 백엔드가 구현해야 할 규격
│  ├─ ERD.md                  생성물 — 테이블 명세
│  └─ FRONTEND.md             이 문서
└─ settings.gradle            include ':api' → apps/api
```

의존 방향: `contract ← api-client ← apps/web`

도메인 타입이 `contract`에 있는 이유는 DDL·시드·ERD가 같은 선언에서 파생되어야 하기
때문이다. 앱 코드는 계속 `@tattoo/api-client`에서 타입을 가져오면 된다 — api-client가
그대로 re-export한다.

스키마를 바꾸는 절차는 [README의 '스키마를 바꿀 때'](../README.md#스키마를-바꿀-때-하네스)
참고.

---

## 3. 목 → 실제 API 교체

화면은 `repository` 인터페이스만 안다(`src/data/repository.ts`). 구현이 두 개 있고
환경 변수로 고른다.

```
DATA_SOURCE=mock   →  src/data/mock.ts   (기본값. 백엔드 없이 동작)
DATA_SOURCE=http   →  src/data/http.ts   (Spring 호출)
```

MSW를 쓰지 않은 이유: App Router의 서버 컴포넌트에서 `fetch`를 가로채려면 `instrumentation`
기반 노드 통합이 필요하고 초기화 순서가 불안정하다. 인터페이스로 갈라두면 그 복잡도 없이 같은
효과를 얻고, 계약 위반이 런타임이 아니라 **타입 검사에서** 잡힌다.

**엔드포인트 하나가 구현됐을 때 할 일**

1. `docs/API-CONTRACT.md`의 응답 형태와 실제 응답이 같은지 확인
2. `.env.local`에 `DATA_SOURCE=http` 설정
3. 해당 화면 확인. 다른 화면은 404(`NOT_FOUND`)가 나는데 그게 정상이다 —
   아직 구현되지 않은 엔드포인트를 목으로 조용히 대체하면 "구현됐다"고 착각하게 된다.

혼합 모드가 필요하면 `src/data/index.ts`에서 메서드별로 골라 조합하면 된다.

---

## 4. 디자인 시스템

### 4.1 토큰

`packages/ui/src/styles/tokens.css`에 `--tt-*` 접두어로 정의하고,
`index.css`의 `@theme inline`이 Tailwind 유틸리티로 노출한다.

```
bg / surface / surface-strong / surface-inset      표면
fg / fg-muted / fg-subtle / fg-onaccent            전경
line / line-strong                                  테두리
accent / accent-hover / accent-active               강조 (검정 ↔ 흰색)
danger / danger-bg / danger-border                  위험 (유일한 유채색)
```

```tsx
<div className="bg-surface text-fg-muted border-line rounded-lg" />
```

접두어를 붙인 이유: Tailwind v4의 `--radius-*`, `--shadow-*`, `--ease-*`, `--container-*`
네임스페이스와 이름이 겹치면 `@theme inline` 매핑이 자기 참조가 되어 깨진다.

`@theme inline`을 쓴 이유: `inline`이 아니면 Tailwind가 빌드 시점에 토큰 값을 그대로 박아버려서
다크 모드 런타임 전환이 먹지 않는다.

**토큰을 추가할 때는 세 곳을 함께 고친다.**
`tokens.css` → `index.css`의 `@theme inline` → `lib/cn.ts`의 tailwind-merge 목록.
마지막 것을 빠뜨리면 `cn('text-title', 'text-fg-muted')`에서 하나가 조용히 사라진다.

### 4.2 색 없이 상태를 구분하는 방법

무채색 기반이라 예약 상태 5종을 색으로 구분할 수 없다. 세 가지를 겹쳐 쓴다.

| 상태         | 배지               | 근거                               |
| ------------ | ------------------ | ---------------------------------- |
| 확정         | 검정 채움          | 가장 강함. 끝난 일.                |
| 입금확인대기 | 검정 테두리        | 진행 중. 누군가의 행동을 기다린다. |
| 대기         | 옅은 회색 채움     | 막 시작.                           |
| 무응답       | 점선 테두리        | 점선 = 미완결이라는 시각적 은유.   |
| 취소         | 취소선 + 가장 옅게 | 더 볼 필요 없음.                   |

여기에 앞머리 점(dot)이 채움 여부를 한 번 더 반복한다. 어느 하나만으로 판단하게 만들지 않는
것이 핵심이다 — 흑백 인쇄물로 출력해도, 색약 사용자가 봐도 같은 순서로 읽힌다.

매핑은 `apps/web/src/components/reservation-status-badge.tsx`에 있다.

### 4.3 다크 모드

`<html data-theme="light|dark">`로 전환한다. 속성이 없으면 `prefers-color-scheme`을 따른다.
컴포넌트는 토큰만 참조하므로 다크 모드 분기 코드를 갖지 않는다.

첫 페인트 전에 `layout.tsx`의 인라인 스크립트가 `localStorage`를 읽어 속성을 심는다.
React 마운트 후에 적용하면 다크 모드 사용자에게 흰 화면이 한 번 번쩍인다.

---

## 5. 토스식 흐름 (퍼널)

플래시 예약 4단계, 커스텀 예약 8단계. 원칙은 **한 화면에 질문 하나**다.

한 페이지 폼으로 만들면 선택 항목 7개가 한 화면에 쌓여 모바일에서 세 번 스크롤해야 하고,
사용자는 전체 분량을 먼저 보고 부담을 느껴 이탈한다. 하나씩 물으면 각 단계가 사소해 보이고
진행 바가 끝이 가까움을 계속 알려준다.

### 5.1 단계 상태를 URL에 두는 이유

`useFunnel`(`packages/ui/src/hooks/use-funnel.ts`)이 각 단계를 `history` 엔트리로 쌓는다.

커스텀 예약은 8단계다. 3단계에서 브라우저 뒤로가기를 누른 사용자가 사이트 밖으로 튕겨나가면
그 예약은 그대로 이탈이다. 단계를 히스토리에 쌓아두면 **뒤로가기가 "이전 질문"으로 동작**하고,
새로고침해도 단계가 유지된다.

`useRouter`를 쓰지 않은 이유: 이 패키지는 프레임워크에 의존하지 않아야 하고, `router.push`는
서버 왕복과 리렌더를 유발해 단계 전환이 눈에 보일 만큼 늦어진다.

```tsx
const funnel = useFunnel(['date', 'time', 'email', 'confirm'] as const);

funnel.step; // 'date'
funnel.direction; // 'forward' | 'backward' — 진입 애니메이션 방향
funnel.next(); // pushState
funnel.prev(); // history.back()
funnel.goTo('date'); // 지난 단계로 점프 (history.go)
```

### 5.2 방향이 있는 전환

앞으로 갈 때는 오른쪽에서, 뒤로 갈 때는 왼쪽에서 들어온다. 방향이 일관되면 사용자는 자기가
흐름 위 어디로 움직였는지 무의식적으로 파악한다. 이동 거리는 16px로 짧게 둔다 — 크게 움직이면
화면이 산만해진다.

### 5.3 선택하면 자동으로 다음

단일 선택 단계는 탭 한 번에 다음으로 넘어간다(160ms 지연). 즉시 넘기면 자기 선택이 반영된 걸
못 보고 넘어가서 "눌린 것이 맞나" 확신이 안 든다. 짧은 지연을 두면 체크 표시가 한 번 보인다.

자동 진행을 하지 않는 단계는 날짜(달력은 오조작이 쉽다)와 마지막 폼이다.

### 5.4 마지막에 전부 다시 보여준다

8단계를 거친 사용자는 자기가 뭘 골랐는지 잊는다. 마지막 화면에 전부 나열하고 각 항목에
수정 버튼을 달아 해당 단계로 되돌릴 수 있게 한다(`SummaryList`). 이게 없으면 사용자는
실수를 발견했을 때 처음부터 다시 하지 않고 흐름을 버린다.

---

## 6. 인증

```
브라우저 → POST /api/auth/login       (Next Route Handler = BFF)
         → POST /api/admin/login      (Spring)
         ← { token }
         ← Set-Cookie: tt_token=...; HttpOnly; SameSite=Lax
         ← { email, role, expiresAt }   ← 토큰은 응답에 넣지 않는다
```

**한 겹을 두는 이유 세 가지**

1. JWT를 httpOnly 쿠키에 보관한다. XSS 한 번으로 토큰이 유출되지 않는다.
   (백엔드에 리프레시 토큰이 없어서 탈취되면 24시간 내내 유효하다.)
2. 서버 간 호출이라 **CORS 설정이 필요 없다.** Spring의 `WebConfig`를 건드리지 않아도 된다.
3. Spring 주소가 브라우저에 노출되지 않는다.

### 6.1 가드 두 겹

| 위치                    | 하는 일                                               | 보안 경계인가 |
| ----------------------- | ----------------------------------------------------- | ------------- |
| `src/proxy.ts`          | 토큰 payload의 role을 보고 로그인 화면으로 리다이렉트 | ❌ 아니다     |
| `lib/session.server.ts` | 레이아웃에서 `requireSession(role)`                   | ❌ 아니다     |
| Spring `JwtInterceptor` | 서명 검증 + 블랙리스트 확인                           | ✅ 이것뿐     |

앞의 두 겹은 서명을 검증하지 않는다(`decodeJwtUnsafe`). Edge 런타임에서 시크릿을 다루지 않기
위한 선택이고, 목적은 "로그인 안 한 사람에게 빈 대시보드를 보여주지 않는 것"이다.
위조 토큰으로 화면까지는 도달할 수 있지만 실제 데이터는 하나도 조회되지 않는다.

같은 검사를 proxy와 레이아웃에 두 번 하는 이유: proxy의 `matcher`가 바뀌거나 새 경로가
패턴에서 빠지면 가드가 조용히 사라진다. 레이아웃에서 다시 확인하면 그런 실수가 화면까지
도달하지 않는다.

---

## 7. 다국어

공개 화면만 `[locale]/` (`ko` · `en`)이다. 관리자·아티스트는 내부 운영 도구라 한국어 단일이다.

- 사전: `apps/web/src/lib/i18n.ts`. 한국어가 기준이고 영문은 타입으로 같은 구조를 강제한다.
- `proxy.ts`가 `Accept-Language`를 보고 로케일 없는 경로를 리다이렉트한다.
- 로케일 전환은 현재 경로의 첫 세그먼트만 교체해 같은 화면에 머문다. 홈으로 보내면
  사용자가 보고 있던 도안을 다시 찾아야 한다.

`next-intl`을 쓰지 않은 이유: 지금 필요한 건 정적 사전 하나뿐이고, 복수형·날짜 포맷은
`Intl` API로 충분하다. 문구가 수백 개로 늘어나면 그때 도입해도 구조가 같아서 옮기기 쉽다.

**현재 상태**: 공개 화면 UI 문구는 한/영 모두 있다. 관리자가 편집하는 콘텐츠(`SiteContent`,
공지, FAQ, 도안 정보)는 한국어만 내려온다 — 백엔드 응답을 `{ ko, en }` 구조로 바꿔야 완성된다
(`docs/API-CONTRACT.md` 4.10절).

---

## 8. 도안 썸네일

`imageUrl`이 비어 있으면 도안 id로 결정되는 무채색 기하 패턴을 SVG로 그린다
(`components/design-thumb.tsx`).

외부 플레이스홀더 서비스를 쓰지 않은 이유: 오프라인이나 CSP가 걸린 환경에서 전부 깨진
이미지가 되고, 회색 박스에 "600x800" 글자가 박혀 있으면 디자인 검토가 불가능하다. 패턴은 항상
렌더되고 흑백 기반 디자인 안에서 의도된 그래픽처럼 보인다.

같은 도안은 항상 같은 패턴이 나온다. 새로고침마다 바뀌면 목록에서 특정 도안을 눈으로 추적할 수
없다.

실제 이미지 CDN이 정해지면 `next/image`로 바꾸고 `next.config.ts`에 `remotePatterns`를
추가한다. 지금 `<img>`를 쓰는 이유는 관리자가 올릴 도메인을 미리 알 수 없기 때문이다.

---

## 9. 아직 안 된 것

| 항목                                   | 상태                               |
| -------------------------------------- | ---------------------------------- |
| 관리자 15개 메뉴 중 대시보드·예약 관리 | ✅ 화면 완성                       |
| 나머지 13개 메뉴                       | ⬜ 사이드바에 '준비 중'으로 노출만 |
| 예약 상세 편집(상태 변경·메모)         | ⬜ 목록까지만                      |
| 샵 상품 · 팝업                         | ⬜ 미착수                          |
| 슬랙 · 구글 캘린더 연동 화면           | ⬜ 백엔드 선행 필요                |
| 콘텐츠 영문 번역                       | ⬜ 백엔드 응답 구조 변경 필요      |
| 자동화 테스트                          | ⬜ 없음                            |

우선순위는 `docs/API-CONTRACT.md` 7절 참고.
