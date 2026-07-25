# API 계약서

프론트엔드(`apps/web`)가 백엔드(`apps/api`)에 기대하는 요청·응답 규격.

프론트는 이 계약대로 화면을 완성했고, 아직 구현되지 않은 엔드포인트는 목 저장소
(`apps/web/src/data/mock.ts`)로 동작한다. 백엔드가 엔드포인트를 하나씩 구현하고 나서
`DATA_SOURCE=http`로 켜면 해당 화면부터 실제 데이터로 넘어간다.

- 경로 상수: `packages/api-client/src/endpoints.ts`
- 응답 타입: `packages/api-client/src/types.ts`
- 저장소 인터페이스: `apps/web/src/data/repository.ts`

---

## 목차

- [0. 백엔드에 먼저 고쳐야 할 것](#0-백엔드에-먼저-고쳐야-할-것)
- [1. 공통 규격](#1-공통-규격)
- [2. 예약 상태 코드](#2-예약-상태-코드)
- [3. 인증](#3-인증)
- [4. 공개 API](#4-공개-api)
- [5. 관리자 API](#5-관리자-api)
- [6. 아티스트 API](#6-아티스트-api)
- [7. 구현 우선순위](#7-구현-우선순위)

---

## 0. 백엔드에 먼저 고쳐야 할 것

화면을 붙이면서 발견한 것들. 위에서부터 영향이 크다.

### 0.1 🔴 인터셉터가 모든 경로를 막는다

`apps/api/.../config/WebConfig.java:24`

```java
registry.addInterceptor(jwtInterceptor)
        .addPathPatterns("/**")
        .excludePathPatterns("/api/admin/login", "/api/artist/login");
```

README의 고객 흐름은 전부 비로그인인데, 지금 설정이면 도안 목록·예약 생성까지 401이 난다.
공개 경로를 화이트리스트에 추가해야 한다.

```java
.excludePathPatterns(
        "/api/admin/login",
        "/api/artist/login",
        "/api/public/**"      // ← 고객용 전체
);
```

프론트는 모든 비로그인 API를 `/api/public/` 접두어로 통일해서, 이 한 줄로 끝나게 설계했다.

### 0.2 🔴 로그인 실패가 500으로 나간다

`apps/api/.../service/AdminService.java:20`, `ArtistService.java:31`

```java
throw new RuntimeException("이메일,비밀번호 한번더 확인 부탁드립니다.");
```

Spring 기본 핸들러가 이걸 **HTTP 500**으로 내보낸다. 즉 "비밀번호 틀림"과 "DB 연결 끊김"이
프론트에서 똑같이 보인다. 사용자에게 보여줄 문구가 완전히 다른데 구분할 수 없다.

프론트는 임시로 "로그인 요청의 500은 자격증명 오류"라고 가정해 두었다
(`packages/api-client/src/errors.ts`의 `loginAttempt`). 이 가정은 백엔드가 진짜 장애를
일으켰을 때 그것을 "비밀번호 틀림"으로 잘못 안내한다. 아래처럼 고치면 그 보정을 지울 수 있다.

```java
// 401 + 코드로 내려주기
@ExceptionHandler(InvalidCredentialsException.class)
public ResponseEntity<ErrorResponse> handle(InvalidCredentialsException e) {
    return ResponseEntity.status(401)
        .body(new ErrorResponse("INVALID_CREDENTIALS", e.getMessage()));
}
```

### 0.3 🔴 비밀번호가 평문 비교된다

`AdminService.java:24`, `ArtistService.java:36`

```java
if (!loginRequestDto.getPassword().equals(admin.getPasswordHash()))
```

필드 이름은 `passwordHash`인데 평문과 `equals`로 비교한다. DB에 평문이 저장되어 있다는 뜻이고,
DB가 한 번 유출되면 모든 계정이 즉시 털린다. `spring-security-crypto`의 `BCryptPasswordEncoder`로
바꿔야 한다.

```gradle
implementation 'org.springframework.security:spring-security-crypto'
```

```java
if (!passwordEncoder.matches(dto.getPassword(), admin.getPasswordHash()))
```

### 0.4 🟡 로그인 5회 실패 잠금이 구현되지 않았다

README에 명시된 요구사항이지만 `admin_tb`/`artist_tb`에 시도 횟수·잠금 컬럼이 없고 로직도 없다.
프론트는 서버가 `ACCOUNT_LOCKED` 코드를 주면 전용 안내를 띄울 준비만 되어 있다
(`apps/web/src/components/login-form.tsx`).

필요한 것: `login_fail_count INT`, `locked_at DATETIME` 컬럼 + 성공 시 카운트 초기화 +
관리자 잠금 해제 API.

### 0.5 🟡 JWT 시크릿이 소스에 하드코딩되어 있다

`apps/api/.../util/JwtUtil.java:14`

```java
private final String SECRET_KEY = "your-secret-key-here-make-it-long";
```

이 값이 git 히스토리에 남아 있으므로, 저장소에 접근 가능한 누구나 임의의 관리자 토큰을 위조할 수 있다.
`application.yml`(gitignore 대상)이나 환경 변수로 옮기고 **새 값으로 교체**해야 한다.
기존 값은 이미 노출된 것으로 취급한다.

### 0.6 🟡 미구현 매퍼가 `interface`가 아니라 `class`다

`CustomReservationMapper.java`, `FlashDesignMapper.java`, `FlashReservationMapper.java`,
`UserMapper.java`

```java
@Mapper
public class UserMapper { }   // ← MyBatis는 interface를 요구한다
```

MyBatis의 `@Mapper`는 인터페이스에만 동작한다. 컴파일은 통과하지만 런타임에 프록시가 만들어지지
않는다. 구현할 때 `interface`로 바꿔야 한다.

### 0.7 🟡 예약번호 체계가 없다

프론트는 고객에게 `TT-2026-0148` 형태의 조회용 번호를 발급한다고 가정했다. 엔티티에는 `id`만
있는데, 연속된 정수를 고객에게 노출하면 번호를 하나씩 바꿔가며 남의 예약을 조회할 수 있다.
`reservation_number VARCHAR` 컬럼(UNIQUE)이 필요하다.

### 0.8 🟢 `./gradlew :api:test`가 실패한다 (기존 상태)

`TattooProjectApplicationTests.contextLoads()`가 `DataSourceBeanCreationException`으로 실패한다.
`@SpringBootTest`가 실제 DataSource를 요구하는데 `application.yml`이 gitignore 대상이라
저장소에 없기 때문이다.

프론트 작업 이전 커밋(`7c67f02`)에서도 동일하게 실패하는 것을 확인했다 — 모노레포 재편과
무관한 기존 상태다. `./gradlew :api:build -x test`는 통과한다.

해결 방법 두 가지 중 하나:

```yaml
# apps/api/src/test/resources/application.yml — 테스트용 인메모리 DB
spring:
  datasource:
    url: jdbc:h2:mem:test;MODE=MySQL
    driver-class-name: org.h2.Driver
```

또는 컨텍스트 전체를 띄우지 않도록 테스트를 바꾼다(`@SpringBootTest` 제거).
전자가 낫다 — 매퍼 XML까지 검증되기 때문이다.

### 0.9 🟢 CORS는 설정하지 않아도 된다

`WebConfig`에 `addCorsMappings`가 없어서 브라우저 직접 호출은 차단된다. 프론트는 Next.js
Route Handler를 경유(BFF)하는 서버 간 호출로 설계했으므로 **CORS 설정이 필요하지 않다**.
`API_BASE_URL`로만 접근한다. 나중에 브라우저에서 직접 부르는 구조로 바꾸면 그때 필요해진다.

---

## 1. 공통 규격

### 1.1 인증 헤더

```
Authorization: Bearer <JWT>
```

`JwtInterceptor`가 `"Bearer "`를 `replace`로 제거한다. 프론트는 항상 접두어를 붙여 보낸다.

### 1.2 에러 응답

모든 4xx·5xx는 아래 형태를 지킨다. `code`가 있으면 프론트가 그것을 신뢰하고, 없으면 HTTP
상태로 추측한다(추측은 부정확하므로 항상 `code`를 넣어주는 게 좋다).

```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "fieldErrors": { "email": "형식이 올바르지 않습니다" }
}
```

| code                  | HTTP | 의미                                |
| --------------------- | ---- | ----------------------------------- |
| `INVALID_CREDENTIALS` | 401  | 이메일·비밀번호 불일치              |
| `ACCOUNT_LOCKED`      | 401  | 5회 실패로 잠김                     |
| `UNAUTHORIZED`        | 401  | 토큰 없음·만료·블랙리스트           |
| `FORBIDDEN`           | 403  | 권한 부족                           |
| `NOT_FOUND`           | 404  | 대상 없음                           |
| `VALIDATION_FAILED`   | 400  | 입력 검증 실패 (`fieldErrors` 동반) |
| `BLACKLISTED`         | 403  | 블랙리스트 고객의 예약 시도         |
| `SLOT_TAKEN`          | 409  | 선택한 시간이 그사이 확정됨         |
| `MAINTENANCE`         | 503  | 점검 모드                           |

`fieldErrors`의 키는 요청 본문의 필드명과 같아야 한다. 프론트는 이 값을 해당 입력칸 아래에
바로 표시한다.

### 1.3 목록 응답

```json
{
  "items": [],
  "page": 1,
  "size": 20,
  "totalItems": 137,
  "totalPages": 7
}
```

`page`는 1부터 시작한다.

### 1.4 날짜·시간

| 용도 | 형식                   | 예                    |
| ---- | ---------------------- | --------------------- |
| 날짜 | `YYYY-MM-DD`           | `2026-08-03`          |
| 시각 | `HH:mm`                | `14:00`               |
| 일시 | ISO 8601 (타임존 없음) | `2026-07-21T10:24:00` |

**날짜는 반드시 문자열로 주고받는다.** `Date`를 ISO로 직렬화하면 UTC로 밀려서 한국 시간
기준 자정 직후 예약이 하루 앞당겨지는 사고가 난다. 프론트도 같은 이유로 로컬 y/m/d만 다룬다
(`packages/ui/src/components/date-picker.tsx`).

---

## 2. 예약 상태 코드

엔티티의 `int status` 값. **이 표가 유일한 기준이다.**

| 값  | 상수              | 의미                              | 다음 상태 |
| --- | ----------------- | --------------------------------- | --------- |
| `0` | `WAITING`         | 예약 생성됨, 고객 입금 전         | 1, 3, 4   |
| `1` | `PAYMENT_PENDING` | 고객이 '입금완료' 클릭, 확인 대기 | 2, 3, 4   |
| `2` | `CONFIRMED`       | 아티스트 캘린더 등록 완료         | —         |
| `3` | `NO_RESPONSE`     | 만료 기간 경과, 자동 만료         | —         |
| `4` | `CANCELLED`       | 관리자 취소 처리                  | —         |

전이 규칙은 `packages/api-client/src/types.ts`의 `ALLOWED_STATUS_TRANSITIONS`에 코드로도
있다. **백엔드가 이 규칙을 검증해야 한다** — 프론트 검증은 UI 편의용이고, API를 직접 호출하면
우회된다.

숫자 의미를 바꾸려면 이 문서와 `types.ts`를 함께 고쳐야 한다. 한쪽만 바꾸면 확정된 예약이
취소로 표시되는 종류의 사고가 난다.

---

## 3. 인증

### 3.1 구현 완료 ✅

| 메서드 | 경로                 | 요청                  | 응답        |
| ------ | -------------------- | --------------------- | ----------- |
| POST   | `/api/admin/login`   | `{ email, password }` | `{ token }` |
| POST   | `/api/admin/logout`  | (헤더 토큰)           | `200` 평문  |
| POST   | `/api/artist/login`  | `{ email, password }` | `{ token }` |
| POST   | `/api/artist/logout` | (헤더 토큰)           | `200` 평문  |

JWT 클레임:

```json
{ "sub": "admin@blanktattoo.kr", "role": "Admin", "iat": 1..., "exp": 1... }
```

`role`은 `"Admin"` 또는 `"Artist"` (대문자 시작, `JwtUtil.generateToken`의 두 번째 인자).

### 3.2 프론트 BFF 경로

브라우저는 Spring을 직접 부르지 않는다.

```
브라우저 → POST /api/auth/login   (Next Route Handler)
         → POST /api/admin/login  (Spring)
         ← { token }
         ← Set-Cookie: tt_token=<JWT>; HttpOnly; SameSite=Lax
         ← { email, role, expiresAt }     ← 토큰은 응답에 넣지 않는다
```

`GET /api/auth/session`으로 현재 세션을 조회하고, `POST /api/auth/logout`이 Spring 로그아웃
(블랙리스트 등록)을 호출한 뒤 쿠키를 지운다.

### 3.3 요청 사항

**아티스트 계정 ↔ 아티스트 레코드 연결.** `GET /api/artist/profile`이 JWT의 `sub`(이메일)로
본인 레코드를 찾아 돌려줘야 한다. 프론트가 보낸 아티스트 id를 신뢰하면 남의 예약을 조회할 수 있다.

---

## 4. 공개 API

모두 비로그인. 접두어는 `/api/public/`으로 통일했다 ([0.1](#01--인터셉터가-모든-경로를-막는다) 참고).

### 4.1 `GET /api/public/artists`

활성 아티스트 목록. `displayOrder` 오름차순.

```json
[
  {
    "id": 1,
    "artistName": "무영",
    "introduce": "선 하나로 형태를 잡는 작업을 합니다.",
    "artistImageUrl": null,
    "genres": ["라인워크", "미니멀"],
    "socialLinks": { "instagram": "https://...", "kakao": null, "line": null, "whatsapp": null },
    "displayOrder": 1,
    "isActive": true
  }
]
```

엔티티에 없어 추가가 필요한 것: `genres`(배열), `displayOrder`, `isActive`.
`instagramFormUrl` 등 4개 URL 컬럼은 `socialLinks` 객체로 묶어서 내려준다.

`isActive=false`인 아티스트는 이 목록에서 제외한다(관리자 API에서는 포함).

### 4.2 `GET /api/public/artists/{id}`

단건. 비활성이면 `404`.

### 4.3 `GET /api/public/flash-designs`

쿼리: `artistId`, `genre`, `category`, `page`, `size`

```json
{
  "items": [
    {
      "id": 101,
      "artistId": 1,
      "artistName": "무영",
      "imageUrl": "https://.../design-101.webp",
      "estimatedTime": 40,
      "price": "90,000",
      "category": "미니",
      "genre": "라인워크",
      "isSoldOut": false,
      "displayOrder": 1
    }
  ],
  "page": 1,
  "size": 12,
  "totalItems": 12,
  "totalPages": 1
}
```

- **`artistName`을 조인해서 함께 내려준다.** 없으면 목록 12개를 그리려고 아티스트를 12번 더
  조회해야 한다.
- `price`는 엔티티가 `String`이라 그대로 문자열로 둔다. 프론트는 계산에 쓰지 않고 표시만 한다.
  통계·매출 집계가 필요하면 별도 숫자 컬럼(`price_amount INT`)을 두는 게 맞다.
- 정렬: `isSoldOut` 오름차순 → `displayOrder` 오름차순. (판매 종료를 뒤로 밀되 숨기지는 않는다.
  숨기면 "어제 본 도안이 사라졌다"는 문의가 생긴다.)
- 엔티티에 없어 추가 필요: `category`, `genre`, `isSoldOut`, `displayOrder`.

### 4.4 `GET /api/public/flash-designs/{id}`

단건. 판매 종료 도안도 `200`으로 내려준다(상세는 볼 수 있고 예약만 막는다).

### 4.5 `GET /api/public/availability`

쿼리: `artistId` (필수), `date` (선택)

```json
{
  "artistId": 1,
  "availableDates": ["2026-08-03", "2026-08-04"],
  "maxDate": "2026-09-23",
  "slots": [
    { "time": "11:00", "taken": false },
    { "time": "14:00", "taken": true }
  ]
}
```

- `availableDates`: 휴무일·임시휴업·아티스트 휴가·정원 마감을 **모두 제외한** 최종 목록.
  프론트는 이 배열을 화이트리스트로 쓴다.
- `maxDate`: 관리자의 '예약 가능 기간' 설정 상한.
- `slots`: `date`를 준 경우에만. `taken=true`는 상태 0·1·2인 예약이 이미 있는 시간.
- `artistId=0`은 "특정 아티스트 없음"(커스텀 예약 달력)이라는 관례값이다. 샵 전체 영업일을
  돌려주면 된다.

### 4.6 `POST /api/public/reservations/flash`

```json
{
  "flashDesignId": 101,
  "preferredDate": "2026-08-03",
  "preferredTime": "14:00",
  "email": "jiwoo.k@example.com",
  "privacyAgreed": true
}
```

응답: 생성된 예약 (`type: "FLASH"`, `status: 0`, `reservationNumber` 포함)

백엔드가 반드시 검증할 것:

1. `privacyAgreed !== true` → `400 VALIDATION_FAILED`. **프론트 체크박스만 믿으면 안 된다.**
2. 도안이 `isSoldOut` → `400`
3. 같은 아티스트·날짜·시간에 상태 0·1·2 예약 존재 → `409 SLOT_TAKEN`
   (이 검사가 없으면 두 고객이 같은 시간을 잡고 사람이 수동으로 정리해야 한다)
4. 블랙리스트 이메일 → `403 BLACKLISTED` + 관리자 슬랙 알림 (README 시나리오 3)

부수 효과: 예약번호 이메일 발송, `#예약알림` 슬랙 카드 전송.

### 4.7 `POST /api/public/reservations/custom`

```json
{
  "artistId": null,
  "tattooGenre": "지오메트릭",
  "bodyPart": "등",
  "tattooSize": "20cm 이상",
  "gender": "남성",
  "age": "30대",
  "preferredDate": "2026-08-12",
  "email": "minseo@example.com",
  "privacyAgreed": true,
  "funnel": "인스타그램"
}
```

`artistId`와 `preferredDate`는 `null` 허용 — 커스텀은 상담에서 정할 수 있다.
나머지는 필수. 블랙리스트·동의 검증은 플래시와 동일.

### 4.8 `POST /api/public/reservations/{reservationNumber}/deposit-paid`

고객이 '입금완료'를 누른 시점. `0 → 1` 전이.

- 이미 `1` 이상이면 **에러가 아니라 현재 예약을 그대로 돌려준다.** 중복 클릭을 실패로 처리하면
  사용자는 뭔가 잘못됐다고 느끼고 문의한다.
- 상태 `3`·`4`는 `409`.

### 4.9 `GET /api/public/reservations/lookup`

쿼리: `reservationNumber`, `email` — **둘 다 필수.**

번호만으로 열어주면 번호를 순차 대입해 남의 예약(이메일 포함)을 볼 수 있다.
불일치는 `404`로 통일한다(`403`을 주면 "그 번호는 존재한다"는 정보가 새어 나간다).

> **추가 요청** — 예약 생성 직후 완료 화면은 번호만 알고 있다. 지금 프론트는 목록 검색으로
> 우회하고 있다(`apps/web/src/app/[locale]/reservations/[number]/page.tsx`의
> `findByNumberOnly`). 생성 응답에 10분 정도 유효한 일회용 `lookupToken`을 함께 내려주면
> 이 우회를 지울 수 있다.

### 4.10 그 외 공개 조회

| 경로                             | 응답 타입                  | 비고                       |
| -------------------------------- | -------------------------- | -------------------------- |
| `GET /api/public/deposit-policy` | `DepositPolicy`            | 예약금 금액·계좌·만료 일수 |
| `GET /api/public/calculator`     | `CalculatorConfig`         | 미니타투 계산기 항목·금액  |
| `GET /api/public/custom-options` | `CustomReservationOptions` | 커스텀 퍼널 선택지         |
| `GET /api/public/content`        | `SiteContent`              | 배너·위치·관리법·SNS       |
| `GET /api/public/notices`        | `Notice[]`                 | 고정 공지 우선, 최신순     |
| `GET /api/public/faq`            | `FaqEntry[]`               | `displayOrder` 순          |

`custom-options`를 API로 뺀 이유: 장르를 하나 추가할 때마다 프론트 배포가 필요해지면
관리자 화면에서 편집하는 의미가 없다.

`SiteContent`는 다국어(한/영) 대응이 필요하다. 지금 프론트는 한국어만 서버에서 받고 영문은
정적 사전(`apps/web/src/lib/i18n.ts`)을 쓴다. 관리자가 영문도 편집하려면 응답을
`{ ko: {...}, en: {...} }` 구조로 바꾸면 된다.

---

## 5. 관리자 API

전부 `Authorization` 헤더 필요 + **`role === "Admin"` 검증 필요.**

> 지금 `JwtInterceptor`는 토큰 유효성만 보고 `role`을 확인하지 않는다. 아티스트 토큰으로
> `/api/admin/**`를 호출하면 통과한다. 인터셉터에서 경로별 role 검사를 추가해야 한다.

| 메서드       | 경로                           | 용도                                                      |
| ------------ | ------------------------------ | --------------------------------------------------------- |
| GET          | `/api/admin/dashboard`         | 지표 + 최근 예약 + 월별 추이                              |
| GET          | `/api/admin/reservations`      | 예약 목록. `?type= &status= &q= &artistId= &page= &size=` |
| PATCH        | `/api/admin/reservations/{id}` | 상태 변경 / 메모 저장                                     |
| GET          | `/api/admin/customers`         | 고객 목록·예약 이력·재방문 표시                           |
| GET·POST     | `/api/admin/artists`           | 아티스트 계정 관리                                        |
| PATCH·DELETE | `/api/admin/artists/{id}`      | 정보 수정·활성화·비번 초기화                              |
| GET·POST     | `/api/admin/flash-designs`     | 도안 등록·일괄 업로드·순서                                |
| GET          | `/api/admin/statistics`        | 기간별 예약·매출, 엑셀                                    |
| GET          | `/api/admin/blacklist`         | 블랙리스트 관리                                           |

### 5.1 `GET /api/admin/dashboard`

```json
{
  "todayReservationCount": 3,
  "waitingCount": 5,
  "paymentPendingCount": 2,
  "confirmedThisMonthCount": 12,
  "recentReservations": [],
  "monthlyTrend": [{ "month": "2026-07", "count": 34 }]
}
```

`recentReservations`는 `requestedAt` 내림차순 6건.

### 5.2 `GET /api/admin/reservations`

`q`는 예약번호·이메일·아티스트명 통합 검색(부분 일치, 대소문자 무시).
응답의 각 항목은 `type` 필드로 플래시/커스텀을 구분한다 — 프론트가 이 값으로 분기한다.

### 5.3 `PATCH /api/admin/reservations/{id}`

```json
{ "status": 4, "adminMemo": "고객 요청으로 취소" }
```

[2절](#2-예약-상태-코드)의 전이 규칙 위반은 `400`. 확정(2)에서 대기(0)로 되돌리는 요청 같은 것.

---

## 6. 아티스트 API

`role === "Artist"` 검증 + **본인 데이터로만 범위 제한.**

| 메서드    | 경로                        | 용도                       |
| --------- | --------------------------- | -------------------------- |
| GET       | `/api/artist/dashboard`     | 본인 지표                  |
| GET       | `/api/artist/reservations`  | 본인 예약만                |
| GET·PATCH | `/api/artist/profile`       | 본인 프로필                |
| GET·POST  | `/api/artist/flash-designs` | 본인 도안                  |
| GET       | `/api/artist/integrations`  | 구글 캘린더·슬랙 연동 상태 |

범위 제한은 **JWT의 `sub`로 판단해야 한다.** 쿼리 파라미터의 `artistId`를 그대로 쓰면
`?artistId=2`로 남의 예약과 고객 이메일을 조회할 수 있다.

---

## 7. 구현 우선순위

프론트 기준으로 막힌 순서. 위에서부터 하면 화면이 순차적으로 살아난다.

**1단계 — 지금 있는 것 고치기 (신규 API 없음)**

- [0.1](#01--인터셉터가-모든-경로를-막는다) 공개 경로 화이트리스트
- [0.2](#02--로그인-실패가-500으로-나간다) 로그인 실패 401 + `code`
- [0.3](#03--비밀번호가-평문-비교된다) BCrypt 적용
- [0.5](#05--jwt-시크릿이-소스에-하드코딩되어-있다) JWT 시크릿 외부화 + 교체
- 인터셉터 role 검증

**2단계 — 고객 화면 (공개 API)**

- `GET /artists`, `/flash-designs` → 메인·목록·상세가 실데이터로
- `GET /content`, `/notices`, `/faq` → 이용 안내
- `GET /availability` → 예약 달력
- `POST /reservations/flash`, `/custom` → 실제 예약 접수
- `GET /reservations/lookup`, `POST .../deposit-paid` → 예약 조회·입금 확인

**3단계 — 운영 화면**

- `GET /admin/dashboard`, `/admin/reservations`, `PATCH /admin/reservations/{id}`
- `GET /artist/profile`, `/artist/dashboard`, `/artist/reservations`

**4단계 — 나머지 관리자 메뉴**

README의 15개 메뉴 중 통계·고객·캘린더·콘텐츠·상품·슬랙·보안 등. 프론트에는 '준비 중'으로
메뉴만 노출되어 있다(`apps/web/src/app/admin/(console)/layout.tsx`).
