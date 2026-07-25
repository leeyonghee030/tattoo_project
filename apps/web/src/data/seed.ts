/* ---------------------------------------------------------------------------
 * 시드 데이터는 @tattoo/contract가 소유한다.
 *
 * 여기서 re-export만 하는 이유: 같은 데이터가 두 곳에 쓰이기 때문이다.
 *   · 목 저장소(mock.ts)의 초기 메모리 상태
 *   · db/seed.sql의 INSERT 문 (packages/contract/src/generate.ts가 생성)
 *
 * 한 곳에서 나오므로 "화면에 보이는 데모 데이터"와 "DB 초기 데이터"가 어긋날 수 없다.
 * 시드를 고치려면 packages/contract/src/seed.ts를 고치고 `pnpm db:generate`를 돌린다.
 * ------------------------------------------------------------------------- */

export {
  ARTISTS,
  ARTIST_ACCOUNTS,
  CALCULATOR_CONFIG,
  CUSTOM_OPTIONS,
  DEPOSIT_POLICY,
  FAQ,
  FLASH_DESIGNS,
  NOTICES,
  RESERVATIONS,
  SITE_CONTENT,
} from '@tattoo/contract';
