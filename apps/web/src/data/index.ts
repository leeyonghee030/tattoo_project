import 'server-only';

import { DATA_SOURCE } from '@/lib/env';

import { httpRepository } from './http';
import { mockRepository } from './mock';
import type { TattooRepository } from './repository';

/* ---------------------------------------------------------------------------
 * 데이터 소스 선택 지점.
 *
 * 'server-only'를 import한 이유: 이 모듈이 클라이언트 컴포넌트에 딸려 들어가면
 * 시드 데이터와 백엔드 주소가 브라우저 번들에 실린다. 실수로 import하면 빌드가
 * 실패하도록 막아 둔다.
 *
 * 화면에서는 항상 `repository`만 쓴다. mock/http를 직접 import하지 않는다 —
 * 그러면 교체 지점이 흩어진다.
 * ------------------------------------------------------------------------- */

export const repository: TattooRepository =
  DATA_SOURCE === 'http' ? httpRepository : mockRepository;

export type {
  CreateCustomReservationInput,
  CreateFlashReservationInput,
  FlashDesignFilter,
  ReservationFilter,
  TattooRepository,
} from './repository';
