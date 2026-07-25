/* ---------------------------------------------------------------------------
 * 에러 정규화.
 *
 * 지금 백엔드는 로그인 실패를 `throw new RuntimeException("이메일,비밀번호 ...")`로
 * 처리한다. Spring Boot 기본 핸들러가 이걸 잡아 **HTTP 500**과 아래 형태로 내려준다.
 *
 *   { "timestamp": "...", "status": 500, "error": "Internal Server Error", "path": "/api/admin/login" }
 *
 * 즉 "비밀번호 틀림"과 "DB 연결 끊김"이 프론트에서 똑같이 500으로 보인다. 사용자에게
 * 보여줄 문구가 완전히 다른데 구분할 수 없다. 계약서에 401 + 코드 응답으로 바꾸도록
 * 요청해 뒀고(docs/API-CONTRACT.md), 그때까지는 아래 매핑으로 견딘다.
 * ------------------------------------------------------------------------- */

export type ApiErrorCode =
  /** 이메일 또는 비밀번호 불일치 */
  | 'INVALID_CREDENTIALS'
  /** 로그인 5회 실패로 계정 잠김. 관리자만 해제 가능. */
  | 'ACCOUNT_LOCKED'
  /** 토큰 없음·만료·블랙리스트 */
  | 'UNAUTHORIZED'
  /** 권한 부족 (아티스트가 관리자 API 호출 등) */
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  /** 입력값 검증 실패 */
  | 'VALIDATION_FAILED'
  /** 블랙리스트 고객의 예약 시도 */
  | 'BLACKLISTED'
  /** 선택한 시간대가 그사이 다른 고객에게 확정됨 */
  | 'SLOT_TAKEN'
  /** 점검 모드 */
  | 'MAINTENANCE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface ApiErrorBody {
  code?: ApiErrorCode;
  message?: string;
  /** 필드별 검증 오류. Field 컴포넌트의 error에 바로 꽂을 수 있다. */
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    if (fieldErrors) this.fieldErrors = fieldErrors;
  }
}

/** 사용자에게 그대로 보여줄 수 있는 한국어 문구. */
const MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  ACCOUNT_LOCKED: '로그인 5회 실패로 계정이 잠겼습니다. 관리자에게 해제를 요청해 주세요.',
  UNAUTHORIZED: '로그인이 필요합니다. 다시 로그인해 주세요.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 정보를 찾을 수 없습니다.',
  VALIDATION_FAILED: '입력한 내용을 다시 확인해 주세요.',
  BLACKLISTED: '예약이 제한된 계정입니다. 자세한 내용은 채널로 문의해 주세요.',
  SLOT_TAKEN: '선택한 시간이 방금 예약되었습니다. 다른 시간을 골라 주세요.',
  MAINTENANCE: '시스템 점검 중입니다. 잠시 후 다시 시도해 주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인해 주세요.',
  UNKNOWN: '문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

export function messageForCode(code: ApiErrorCode): string {
  return MESSAGES[code];
}

/**
 * HTTP 상태와 응답 본문으로 ApiError를 만든다.
 *
 * `loginAttempt`를 켜면 500을 INVALID_CREDENTIALS로 해석한다. 로그인 엔드포인트에서만
 * 이 가정이 성립한다 — 다른 API의 500을 자격증명 오류로 바꿔 말하면 진짜 서버 장애를
 * 숨기게 되므로 절대 기본값으로 두지 않는다.
 */
export function toApiError(
  status: number,
  body: unknown,
  options: { loginAttempt?: boolean } = {},
): ApiError {
  const parsed = (typeof body === 'object' && body !== null ? body : {}) as ApiErrorBody & {
    error?: string;
  };

  // 백엔드가 이미 코드를 내려주면 그대로 신뢰한다(계약 적용 후 경로).
  if (parsed.code && parsed.code in MESSAGES) {
    return new ApiError(
      status,
      parsed.code,
      parsed.message ?? MESSAGES[parsed.code],
      parsed.fieldErrors,
    );
  }

  let code: ApiErrorCode;
  switch (status) {
    case 400:
      code = 'VALIDATION_FAILED';
      break;
    case 401:
      code = options.loginAttempt ? 'INVALID_CREDENTIALS' : 'UNAUTHORIZED';
      break;
    case 403:
      code = 'FORBIDDEN';
      break;
    case 404:
      code = 'NOT_FOUND';
      break;
    case 409:
      code = 'SLOT_TAKEN';
      break;
    case 503:
      code = 'MAINTENANCE';
      break;
    case 500:
      // 현재 백엔드 구현 한정 보정. 계약이 적용되면 이 분기는 죽는다.
      code = options.loginAttempt ? 'INVALID_CREDENTIALS' : 'UNKNOWN';
      break;
    default:
      code = 'UNKNOWN';
  }

  return new ApiError(status, code, parsed.message ?? MESSAGES[code], parsed.fieldErrors);
}

/** 알 수 없는 예외를 ApiError로 좁힌다. catch 블록에서 쓴다. */
export function asApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof TypeError) {
    // fetch가 네트워크 단계에서 실패하면 TypeError를 던진다.
    return new ApiError(0, 'NETWORK_ERROR', MESSAGES.NETWORK_ERROR);
  }
  return new ApiError(0, 'UNKNOWN', MESSAGES.UNKNOWN);
}
