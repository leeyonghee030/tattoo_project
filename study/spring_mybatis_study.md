# Spring Boot + MyBatis 핵심 개념 정리
> tattoo_project (BodyPart / Artist / ArtistGenre) 코드 기반

---

## 1. 전체 흐름 이해 (가장 중요)

요청이 들어오면 아래 순서로 흐릅니다.

```
HTTP 요청
    ↓
Controller   - 요청을 받아서 Service에 넘긴다
    ↓
Service      - 비즈니스 로직 처리 (데이터 조립 등)
    ↓
Mapper       - SQL 실행 인터페이스
    ↓
XML          - 실제 SQL 작성
    ↓
DB
```

각 계층의 역할이 분리되어 있기 때문에 **한 곳만 고쳐도 나머지는 그대로 둘 수 있습니다.**

---

## 2. @PathVariable vs @RequestBody

가장 자주 헷갈리는 부분입니다.

```java
// @PathVariable - URL 경로에 포함된 값
// 요청: PUT /artists/5
@PutMapping("/{id}")
public void update(@PathVariable Long id, @RequestBody ArtistRequestDto dto) { }

// @RequestBody - HTTP 요청 본문(JSON)에 담긴 값
// 요청 본문: { "name": "홍길동", "bio": "설명" }
```

| 구분 | 위치 | 예시 |
|---|---|---|
| `@PathVariable` | URL 경로 | `/artists/5` → id = 5 |
| `@RequestBody` | 요청 JSON 본문 | `{"name": "홍길동"}` |
| `@RequestParam` | URL 쿼리스트링 | `/artists?page=1` → page = 1 |

### 주의: 경로 변수 이름은 반드시 일치해야 한다

```java
// 잘못된 예 - 경로는 {id}인데 파라미터는 artistId → 바인딩 실패
@PutMapping("/{id}")
public void update(@PathVariable Long artistId) { }

// 올바른 예 1 - 이름 일치
@PutMapping("/{artistId}")
public void update(@PathVariable Long artistId) { }

// 올바른 예 2 - @PathVariable에 이름 명시
@PutMapping("/{id}")
public void update(@PathVariable("id") Long artistId) { }
```

---

## 3. @RequestMapping 경로: 리터럴 vs 경로변수

```java
// 잘못된 예 - /{artists}는 경로 변수로 인식됨
// /anything 처럼 어떤 값이든 매핑되어버림
@RequestMapping("/{artists}")

// 올바른 예 - /artists 라는 고정 경로
@RequestMapping("/artists")
```

`{ }` 중괄호가 있으면 항상 경로 변수입니다. 고정 경로에는 중괄호를 쓰지 않습니다.

---

## 4. HTTP 메서드 선택 기준

```
GET    /artists          → 목록 조회 (데이터 변경 없음)
GET    /artists/{id}     → 단건 조회
POST   /artists          → 새 데이터 등록
PUT    /artists/{id}     → 전체 수정 (모든 필드 교체)
PATCH  /artists/{id}/deactivate → 일부 상태 변경
DELETE /artists/{id}     → 삭제
```

### 주의: 같은 메서드 + 같은 경로는 2개 선언 불가

```java
// 이렇게 쓰면 앱 시작 시 AmbiguousHandlerMappingException 발생
@PutMapping("/{id}")
public void update(...) { }

@PutMapping("/{id}")        // 충돌!
public void deactivate(...) { }

// 해결: 경로를 다르게 구분
@PutMapping("/{id}")
public void update(...) { }

@PatchMapping("/{id}/deactivate")   // 경로 다름
public void deactivate(...) { }
```

---

## 5. Entity vs DTO - 왜 분리하는가

```java
// Entity - DB 테이블과 1:1 매핑. 모든 컬럼을 다 가진다.
public class Artist {
    private Long id;
    private Long userId;
    private String name;
    private Boolean isActive;
    private LocalDateTime createdAt;  // DB가 자동 생성
    private LocalDateTime updatedAt;  // DB가 자동 생성
}

// RequestDto - 클라이언트가 보내는 값만 담는다
// createdAt, updatedAt, isActive 같은 건 클라이언트가 보내지 않음
public class ArtistRequestDto {
    private Long userId;
    private String name;
    private String bio;
}

// ResponseDto - 클라이언트에게 돌려주는 값만 담는다
// 비밀번호 같은 민감한 정보는 여기서 제외
public class ArtistResponseDto {
    private Long id;
    private String name;
    // ...
    public static ArtistResponseDto from(Artist artist) { ... }
}
```

**핵심 이유:**
- Entity를 그대로 반환하면 불필요한/민감한 데이터까지 노출됨
- 클라이언트가 `createdAt`을 임의로 보내는 것을 막을 수 있음

---

## 6. Lombok 어노테이션

```java
@Data
// = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor
// 한 줄로 기본 메서드를 전부 자동 생성

@NoArgsConstructor
// 빈 생성자 생성: new Artist()
// MyBatis가 DB 결과를 객체로 만들 때 빈 생성자를 사용함

@RequiredArgsConstructor
// final 필드를 파라미터로 받는 생성자 자동 생성
// Service, Controller에서 의존성 주입(DI)에 사용
@Service
@RequiredArgsConstructor
public class ArtistService {
    private final ArtistMapper artistMapper;  // 자동으로 생성자 주입됨
}
```

### 주의: @Data + Entity에서 순환참조

Entity끼리 서로 참조하는 관계라면 `@Data`의 `@ToString`이 무한 루프를 만들 수 있습니다.
이 프로젝트처럼 단순한 구조에서는 문제없습니다.

---

## 7. MyBatis XML - 핵심 속성

```xml
<!-- resultType: 조회 결과를 어떤 클래스로 받을지 -->
<!-- application.yml에 type-aliases-package 설정 덕분에 클래스 단순 이름으로 가능 -->
<select id="findAll" resultType="Artist">
    SELECT * FROM artist
</select>

<!-- parameterType: 전달받는 파라미터 타입 -->
<insert id="save" parameterType="Artist"
        useGeneratedKeys="true" keyProperty="id">
    INSERT INTO artist(name) VALUES(#{name})
</insert>
<!-- useGeneratedKeys="true" : DB가 자동 생성한 PK를 받아온다 -->
<!-- keyProperty="id"        : 받아온 PK를 Artist 객체의 id 필드에 넣어준다 -->

<!-- #{name} - Artist 객체의 getName() 값이 들어감 -->
<!-- map-underscore-to-camel-case: true 설정으로 -->
<!-- DB의 is_active → Java의 isActive 자동 변환 -->
```

---

## 8. snake_case ↔ camelCase 자동 변환

```yaml
# application.yml
mybatis:
  configuration:
    map-underscore-to-camel-case: true
```

이 설정 하나로 DB 컬럼명과 Java 필드명이 자동으로 연결됩니다.

```
DB 컬럼        Java 필드
user_id     →  userId
is_active   →  isActive
sort_order  →  sortOrder
created_at  →  createdAt
```

이 설정이 없으면 `SELECT user_id` 결과가 `userId`에 매핑되지 않아서 null이 됩니다.

---

## 9. ArtistGenre - delete + insert 패턴 (덮어쓰기)

장르 선택처럼 "여러 개를 통째로 교체"할 때 자주 쓰는 패턴입니다.

```java
public void updateGenre(Long artistId, ArtistGenreRequestDto dto) {
    // 1. 기존 데이터 전체 삭제
    artistGenreMapper.deleteByArtistId(artistId);

    // 2. 새 데이터 하나씩 저장
    for (Long genreId : dto.getGenreIds()) {
        ArtistGenre artistGenre = new ArtistGenre();
        artistGenre.setArtistId(artistId);
        artistGenre.setGenreId(genreId);
        artistGenreMapper.save(artistGenre);
    }
}
```

**왜 UPDATE가 아닌 DELETE + INSERT?**
중간 테이블(artist_genre)은 기본키가 `(artistId, genreId)` 조합이라
어떤 항목이 추가되고 어떤 항목이 삭제됐는지 diff를 구하기 어렵습니다.
그래서 전부 지우고 새로 넣는 방식이 코드가 단순하고 실수가 없습니다.

---

## 10. 비활성화(Soft Delete) vs 실제 삭제(Hard Delete)

```java
// Hard Delete - DB에서 row 자체를 삭제
DELETE FROM artist WHERE id = #{id}

// Soft Delete - 삭제하지 않고 상태만 변경
UPDATE artist SET is_active = FALSE WHERE id = #{id}
```

tattoo_project에서 Artist는 **Soft Delete**를 사용합니다.
- 과거 예약 이력 등 연관 데이터가 남아있어야 하기 때문
- 복구가 필요할 수 있기 때문

조회할 때는 `WHERE is_active = true` 조건으로 비활성화된 아티스트를 걸러냅니다.

---

## 실수 모음 (이 프로젝트에서 실제로 발생했던 것들)

| 실수 | 원인 | 해결 |
|---|---|---|
| `@RequestMapping("/{artists}")` | 고정 경로에 `{}` 사용 | `"/artists"` |
| `@PutMapping({"/id"})` | 경로변수 `{}` 누락 | `"/{id}"` |
| `update()`에서 `mapper.save()` 호출 | 메서드 이름 실수 | `mapper.update()` |
| `@PutMapping("/{id}")` 중복 선언 | 같은 경로 두 번 | 한쪽 경로 변경 |
| `update id="update"parameterType` | 속성 사이 공백 없음 | 공백 추가 |
| `@PathVariable Long artistId` (경로는 `{id}`) | 이름 불일치 | `@PathVariable("id")` 명시 |
