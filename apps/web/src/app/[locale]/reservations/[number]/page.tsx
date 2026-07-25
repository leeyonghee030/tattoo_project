import { ReservationStatus } from '@tattoo/api-client';
import { Button, Card, CopyField, SummaryItem, SummaryList } from '@tattoo/ui';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { repository } from '@/data';
import { formatCurrency, formatDate, getDictionary, isLocale } from '@/lib/i18n';

import { DepositActions } from './deposit-actions';

export const metadata: Metadata = {
  title: '예약 확인',
  robots: { index: false, follow: false },
};

interface ReservationPageProps {
  params: Promise<{ locale: string; number: string }>;
  searchParams: Promise<{ created?: string; email?: string }>;
}

/* ---------------------------------------------------------------------------
 * 예약 완료 / 상세 화면.
 *
 * 두 경로로 들어온다.
 *   1) 예약 직후 (?created=1) — 축하 문구와 다음 할 일을 강조한다
 *   2) 예약 조회 화면에서 (email 확인 후) — 현재 상태 확인이 목적이다
 *
 * ⚠️ 이 화면은 예약번호만으로 열린다. 지금은 목이라 문제가 없지만, 실제
 *    백엔드에서는 예약번호 하나로 남의 예약(이메일 주소 포함)을 볼 수 있으면
 *    개인정보 노출이다. 계약서에 예약번호+이메일 동시 검증을 요구해 뒀다.
 *    아래 email 쿼리는 그 검증을 태우기 위한 것이다.
 * ------------------------------------------------------------------------- */

export default async function ReservationDetailPage({
  params,
  searchParams,
}: ReservationPageProps) {
  const { locale, number } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const { created, email } = await searchParams;
  const justCreated = created === '1';

  // 조회 화면에서 온 경우 이메일이 함께 넘어온다. 방금 만든 예약은
  // 번호를 아는 것만으로 충분하다(직전 화면에서 사용자가 입력한 것이므로).
  const reservation = email
    ? await repository.lookupReservation(number, email)
    : await findByNumberOnly(number);

  if (!reservation) notFound();

  const depositPolicy = await repository.getDepositPolicy();
  const depositAmount =
    reservation.type === 'FLASH' ? depositPolicy.flashAmount : depositPolicy.customAmount;

  return (
    <div className="max-w-narrow mx-auto px-4 py-12 sm:py-16">
      {justCreated && (
        <div className="mb-8 text-center">
          <div className="bg-accent text-fg-onaccent mx-auto mb-5 grid size-14 place-items-center rounded-full">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="text-title text-fg">{dict.reserve.completeTitle}</h1>
          <p className="text-fg-muted mt-2.5 text-[0.9375rem] leading-relaxed">
            {dict.reserve.completeDesc}
          </p>
        </div>
      )}

      {!justCreated && (
        <header className="mb-8">
          <h1 className="text-title text-fg">{dict.lookup.title}</h1>
        </header>
      )}

      {/* 예약번호를 가장 크게. 이 화면에서 사용자가 해야 할 일은 이 번호를 복사해
          채널로 보내는 것이다. 그 행동을 방해하는 요소를 위에 두지 않는다. */}
      <CopyField label={dict.reserve.reservationNumber} value={reservation.reservationNumber} />

      <div className="border-line mt-4 flex items-center justify-between rounded-lg border px-4 py-3.5">
        <span className="text-fg-muted text-[0.8125rem]">진행 상태</span>
        <ReservationStatusBadge status={reservation.status} locale={locale} />
      </div>

      {/* ── 다음 할 일 안내 ─────────────────────────────
          상태에 따라 사용자가 지금 무엇을 해야 하는지가 달라진다.
          "대기 중입니다"만 띄우면 사용자는 기다려야 하는지 뭘 해야 하는지 모른다. */}
      {reservation.status === ReservationStatus.WAITING && (
        <Card variant="filled" padding="md" className="mt-6">
          <h2 className="text-fg text-sm font-semibold">지금 해주실 일</h2>
          <ol className="text-fg-muted mt-3 space-y-3 text-[0.8125rem] leading-relaxed">
            <li className="flex gap-2.5">
              <span className="text-fg shrink-0 font-semibold" data-numeric>
                1
              </span>
              <span>
                예약금{' '}
                <strong className="text-fg font-semibold" data-numeric>
                  {formatCurrency(depositAmount, locale)}
                </strong>
                을 아래 계좌로 입금해 주세요.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-fg shrink-0 font-semibold" data-numeric>
                2
              </span>
              <span>채널로 위 예약번호와 입금자명을 보내 주세요.</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-fg shrink-0 font-semibold" data-numeric>
                3
              </span>
              <span>아래 버튼을 눌러 입금 완료를 알려 주세요.</span>
            </li>
          </ol>

          {depositPolicy.bankAccount && (
            <div className="border-line bg-bg mt-4 rounded-md border p-3.5">
              <p className="text-fg-muted text-[0.8125rem]">{dict.reserve.depositGuide}</p>
              <p className="text-fg mt-1 text-sm font-semibold" data-numeric>
                {depositPolicy.bankAccount.bankName} {depositPolicy.bankAccount.accountNumber}
              </p>
              <p className="text-fg-muted text-[0.8125rem]">
                예금주 {depositPolicy.bankAccount.holderName}
              </p>
            </div>
          )}

          <p className="text-fg-subtle mt-3.5 text-[0.8125rem] leading-relaxed">
            <span data-numeric>{depositPolicy.expireAfterDays}</span>일 안에 연락이 없으면 예약이
            자동 취소됩니다.
          </p>
        </Card>
      )}

      {/* 상태 코드를 숫자로 비교하지 않는다(status <= 1 같은 코드는 값이 재배치되면 조용히 깨진다). */}
      {reservation.contactChannelUrl &&
        ([ReservationStatus.WAITING, ReservationStatus.PAYMENT_PENDING] as number[]).includes(
          reservation.status,
        ) && (
          <Button variant="outline" size="lg" block className="mt-4" asChild>
            <a href={reservation.contactChannelUrl} target="_blank" rel="noreferrer noopener">
              <MessageCircle size={16} />
              채널로 연락하기
            </a>
          </Button>
        )}

      <div className="mt-4">
        <DepositActions
          locale={locale}
          reservationNumber={reservation.reservationNumber}
          status={reservation.status}
        />
      </div>

      {/* ── 예약 내용 ───────────────────────────────────── */}
      <h2 className="text-fg mt-10 mb-2 text-sm font-semibold">{dict.reserve.summaryTitle}</h2>
      <SummaryList className="border-line rounded-lg border px-4">
        <SummaryItem label="종류" value={reservation.type === 'FLASH' ? '플래시 도안' : '커스텀'} />
        <SummaryItem
          label={dict.reserve.summaryArtist}
          value={reservation.artistName ?? ''}
          placeholder="상담 후 배정"
        />
        <SummaryItem
          label={dict.reserve.summaryDate}
          value={reservation.preferredDate ? formatDate(reservation.preferredDate, locale) : ''}
          placeholder="상담 후 결정"
        />
        {reservation.type === 'FLASH' && (
          <SummaryItem label={dict.reserve.summaryTime} value={reservation.preferredTime} />
        )}
        {reservation.type === 'CUSTOM' && (
          <>
            <SummaryItem label="스타일" value={reservation.tattooGenre} />
            <SummaryItem label="부위" value={reservation.bodyPart} />
            <SummaryItem label="크기" value={reservation.tattooSize} />
          </>
        )}
        <SummaryItem label={dict.reserve.emailLabel} value={reservation.email} />
        <SummaryItem
          label={dict.reserve.summaryDeposit}
          value={formatCurrency(depositAmount, locale)}
        />
      </SummaryList>

      <div className="mt-8 flex flex-col gap-2">
        <Button variant="secondary" size="lg" block asChild>
          <Link href={`/${locale}`}>{dict.reserve.goHome}</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * 예약 직후 화면용 조회. 이메일 없이 번호만으로 찾는다.
 *
 * lookupReservation은 이메일을 필수로 요구하므로(그게 맞다) 여기서는 목록에서
 * 직접 찾는다. 실제 백엔드에서는 예약 생성 응답에 짧게 유효한 조회 토큰을 함께
 * 내려주는 방식이 더 안전하다 — 계약서에 남겨 뒀다.
 */
async function findByNumberOnly(reservationNumber: string) {
  const page = await repository.listReservations({ q: reservationNumber, size: 1 });
  return page.items[0] ?? null;
}
