import { asApiError, toApiError } from './errors';

/* ---------------------------------------------------------------------------
 * fetch 래퍼.
 *
 * 브라우저와 서버(Route Handler / 서버 컴포넌트) 양쪽에서 쓴다. 차이는 baseUrl과
 * 토큰 전달 방식뿐이라 인스턴스를 만들어 주입한다.
 * ------------------------------------------------------------------------- */

export interface ApiClientConfig {
  /** 예) 'http://localhost:8080'. 브라우저에서 BFF를 부를 때는 빈 문자열. */
  baseUrl: string;
  /**
   * 요청마다 Authorization 헤더에 넣을 토큰을 돌려준다.
   * 서버에서는 쿠키에서 읽고, 브라우저에서는 BFF가 쿠키를 대신 붙여주므로 불필요하다.
   */
  getToken?: () => string | undefined | Promise<string | undefined>;
  /** 401을 받았을 때 호출된다. 보통 로그인 화면으로 보낸다. */
  onUnauthorized?: () => void;
  /** 기본 타임아웃(ms). 0이면 끄기. */
  timeoutMs?: number;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON으로 직렬화해서 보낸다. FormData가 필요하면 rawBody를 쓴다. */
  body?: unknown;
  /** 직렬화하지 않고 그대로 보낸다 (파일 업로드). */
  rawBody?: BodyInit;
  /** 쿼리스트링. undefined/null 값은 제외된다. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /**
   * 로그인 요청임을 표시. 500을 자격증명 오류로 해석하는 보정을 켠다.
   * 자세한 이유는 errors.ts 주석 참고.
   */
  loginAttempt?: boolean;
  /** Next.js 캐시 옵션 통과용 */
  next?: { revalidate?: number | false; tags?: string[] };
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const url = `${baseUrl}${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export class ApiClient {
  private readonly config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = { timeoutMs: 15_000, ...config };
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      body,
      rawBody,
      query,
      loginAttempt = false,
      headers: extraHeaders,
      signal: externalSignal,
      ...rest
    } = options;

    const headers = new Headers(extraHeaders);
    if (body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');

    const token = await this.config.getToken?.();
    if (token && !headers.has('Authorization')) {
      // 백엔드 JwtInterceptor는 'Bearer ' 접두어를 replace로 떼어낸다.
      headers.set('Authorization', `Bearer ${token}`);
    }

    // 타임아웃과 호출자가 넘긴 signal을 함께 존중한다. 둘 중 하나라도 끊기면 취소.
    const controller = new AbortController();
    const timeoutMs = this.config.timeoutMs ?? 0;
    const timeoutId =
      timeoutMs > 0 ? setTimeout(() => controller.abort(new Error('timeout')), timeoutMs) : null;
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort(externalSignal.reason);
      else
        externalSignal.addEventListener('abort', () => controller.abort(externalSignal.reason), {
          once: true,
        });
    }

    let response: Response;
    try {
      response = await fetch(buildUrl(this.config.baseUrl, path, query), {
        ...rest,
        headers,
        body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
        signal: controller.signal,
      });
    } catch (error) {
      throw asApiError(error);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    if (!response.ok) {
      // 본문이 JSON이 아닐 수 있다(백엔드가 평문을 돌려주는 엔드포인트도 있다).
      const errorBody = await this.readBodySafely(response);
      if (response.status === 401 && !loginAttempt) {
        this.config.onUnauthorized?.();
      }
      throw toApiError(response.status, errorBody, { loginAttempt });
    }

    // 204 No Content, 또는 로그아웃처럼 평문을 돌려주는 응답
    if (response.status === 204) return undefined as T;
    const parsed = await this.readBodySafely(response);
    return parsed as T;
  }

  /** JSON 파싱 실패를 에러로 만들지 않는다. 평문이면 { message } 형태로 감싼다. */
  private async readBodySafely(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return undefined;
    const contentType = response.headers.get('Content-Type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return { message: text };
      }
    }
    return { message: text };
  }

  get<T>(path: string, options?: Omit<RequestOptions, 'body' | 'rawBody'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}
