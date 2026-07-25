import {
  API,
  ApiClient,
  type Artist,
  type AvailabilityResponse,
  type CalculatorConfig,
  type CustomReservation,
  type CustomReservationOptions,
  type DashboardSummary,
  type DepositPolicy,
  type FaqEntry,
  type FlashDesign,
  type FlashReservation,
  type Notice,
  type Paginated,
  type Reservation,
  type SiteContent,
} from '@tattoo/api-client';
import { cookies } from 'next/headers';

import { TOKEN_COOKIE } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/env';

import type {
  CreateCustomReservationInput,
  CreateFlashReservationInput,
  FlashDesignFilter,
  ReservationFilter,
  TattooRepository,
} from './repository';

/* ---------------------------------------------------------------------------
 * Spring 백엔드를 실제로 호출하는 구현.
 *
 * 지금 백엔드에 존재하는 건 로그인/로그아웃 4개뿐이므로, 여기 대부분의 메서드는
 * 호출하면 404가 돌아온다(ApiError code = 'NOT_FOUND'). 그게 맞는 동작이다 —
 * 목으로 조용히 대체하면 "구현됐다"고 착각하게 된다.
 *
 * 백엔드가 엔드포인트를 구현할 때마다 DATA_SOURCE=http로 켜서 하나씩 검증하면 된다.
 * 경로와 응답 형태는 docs/API-CONTRACT.md와 packages/api-client/src/endpoints.ts에 있다.
 * ------------------------------------------------------------------------- */

function createClient(): ApiClient {
  return new ApiClient({
    baseUrl: API_BASE_URL,
    // 서버 사이드에서 httpOnly 쿠키를 읽어 Authorization 헤더로 옮긴다.
    // 브라우저는 이 경로를 직접 타지 않으므로 토큰이 JS에 노출되지 않는다.
    getToken: async () => {
      const store = await cookies();
      return store.get(TOKEN_COOKIE)?.value;
    },
  });
}

export const httpRepository: TattooRepository = {
  async listArtists(): Promise<Artist[]> {
    return createClient().get<Artist[]>(API.artists);
  },

  async getArtist(id) {
    return createClient().get<Artist>(API.artist(id));
  },

  async listFlashDesigns(filter: FlashDesignFilter = {}) {
    return createClient().get<Paginated<FlashDesign>>(API.flashDesigns, {
      query: {
        artistId: filter.artistId,
        genre: filter.genre,
        category: filter.category,
        page: filter.page,
        size: filter.size,
      },
    });
  },

  async getFlashDesign(id) {
    return createClient().get<FlashDesign>(API.flashDesign(id));
  },

  async getAvailability(artistId, date) {
    return createClient().get<AvailabilityResponse>(API.availability, {
      query: { artistId, date },
    });
  },

  async getDepositPolicy(): Promise<DepositPolicy> {
    return createClient().get<DepositPolicy>(API.depositPolicy);
  },

  async getCalculatorConfig(): Promise<CalculatorConfig> {
    return createClient().get<CalculatorConfig>(API.calculator);
  },

  async getCustomOptions(): Promise<CustomReservationOptions> {
    return createClient().get<CustomReservationOptions>(API.customOptions);
  },

  async getSiteContent(): Promise<SiteContent> {
    return createClient().get<SiteContent>(API.siteContent);
  },

  async listNotices(): Promise<Notice[]> {
    return createClient().get<Notice[]>(API.notices);
  },

  async listFaq(): Promise<FaqEntry[]> {
    return createClient().get<FaqEntry[]>(API.faq);
  },

  async createFlashReservation(input: CreateFlashReservationInput): Promise<FlashReservation> {
    return createClient().post<FlashReservation>(API.createFlashReservation, input);
  },

  async createCustomReservation(input: CreateCustomReservationInput): Promise<CustomReservation> {
    return createClient().post<CustomReservation>(API.createCustomReservation, input);
  },

  async markDepositPaid(reservationNumber): Promise<Reservation> {
    return createClient().post<Reservation>(API.markDepositPaid(reservationNumber));
  },

  async lookupReservation(reservationNumber, email) {
    return createClient().get<Reservation>(API.lookupReservation, {
      query: { reservationNumber, email },
    });
  },

  async getMyArtistProfile(): Promise<Artist | null> {
    // email 인자를 쓰지 않는다. 백엔드가 JWT subject로 판단해야 한다 —
    // 클라이언트가 보낸 이메일을 신뢰하면 남의 프로필을 조회할 수 있다.
    return createClient().get<Artist>(API.artistProfile);
  },

  async getDashboard(scope): Promise<DashboardSummary> {
    // 아티스트는 본인 범위만 조회한다. 범위 판단은 백엔드가 토큰의 role/email로
    // 다시 해야 한다 — 프론트가 보낸 artistId를 그대로 믿으면 다른 아티스트의
    // 예약을 조회할 수 있다.
    const path = scope.role === 'Admin' ? API.adminDashboard : API.artistDashboard;
    return createClient().get<DashboardSummary>(path);
  },

  async listReservations(filter: ReservationFilter = {}) {
    return createClient().get<Paginated<Reservation>>(API.adminReservations, {
      query: {
        type: filter.type,
        status: filter.status,
        q: filter.q,
        artistId: filter.artistId,
        page: filter.page,
        size: filter.size,
      },
    });
  },
};
