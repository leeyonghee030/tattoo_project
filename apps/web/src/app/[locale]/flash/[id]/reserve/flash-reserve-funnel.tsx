'use client';

import type { AvailabilityResponse, DepositPolicy, FlashDesign } from '@tattoo/api-client';
import {
  Button,
  CheckboxField,
  DatePicker,
  Field,
  FunnelHeader,
  FunnelStep,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  Skeleton,
  StepProgress,
  StickyCta,
  SummaryItem,
  SummaryList,
  TimeSlotPicker,
  useFunnel,
  useToast,
} from '@tattoo/ui';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { createFlashReservationAction, fetchAvailabilityAction } from '@/actions/reservations';
import { formatCurrency, formatDate, getDictionary, type Locale } from '@/lib/i18n';

/* ---------------------------------------------------------------------------
 * 플래시 도안 예약 퍼널 — 4단계.
 *
 *   1) 날짜   2) 시간   3) 이메일   4) 확인 및 동의
 *
 * 왜 4단계로 쪼갰나:
 *   한 페이지 폼으로 만들면 달력 + 시간 목록 + 이메일 + 약관이 한 화면에 쌓여
 *   모바일에서 세 번 스크롤해야 한다. 사용자는 전체 분량을 먼저 보고 부담을 느낀다.
 *   질문 하나씩 물으면 각 단계가 사소해 보이고, 진행 바가 끝이 가까움을 계속 알려준다.
 *
 * 상태를 URL에 두는 이유는 useFunnel 주석에 적어 뒀다 — 뒤로가기로 이탈하지 않게 하는 것.
 * ------------------------------------------------------------------------- */

const STEPS = ['date', 'time', 'email', 'confirm'] as const;

interface FlashReserveFunnelProps {
  locale: Locale;
  design: FlashDesign;
  /** 첫 진입 시점의 예약 가능 날짜. 날짜를 고르면 시간대는 그때 조회한다. */
  initialAvailability: AvailabilityResponse;
  depositPolicy: DepositPolicy;
}

export function FlashReserveFunnel({
  locale,
  design,
  initialAvailability,
  depositPolicy,
}: FlashReserveFunnelProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const { toast } = useToast();
  const funnel = useFunnel(STEPS);

  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [agreed, setAgreed] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [termsOpen, setTermsOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  /*
   * 시간대를 날짜별로 담아 둔다. 단일 `slots` 상태를 쓰면 날짜를 바꿀 때 이전 날짜의
   * 시간표를 지워야 하는데, 그 초기화를 effect 안에서 하면 렌더가 한 번 더 돌고
   * React 19의 set-state-in-effect 규칙에도 걸린다.
   *
   * 날짜를 키로 두면 지울 일이 없고, 한 번 본 날짜로 되돌아갈 때 즉시 표시되는
   * 캐시 역할도 한다.
   */
  const [slotsByDate, setSlotsByDate] = React.useState<
    Record<string, NonNullable<AvailabilityResponse['slots']>>
  >({});

  const slots = date ? slotsByDate[date] : undefined;
  // 별도 로딩 상태를 두지 않는다. 날짜가 정해졌고 캐시가 비어 있으면 반드시 조회 중이다
  // (실패해도 아래에서 빈 배열을 채우므로 무한 로딩이 되지 않는다).
  const slotsLoading = Boolean(date) && slots === undefined;

  /**
   * 날짜가 바뀌면 그 날짜의 시간대를 조회한다.
   *
   * 이전 요청이 늦게 도착해 새 날짜의 결과를 덮어쓰는 걸 막기 위해 취소 플래그를 둔다.
   * 이게 없으면 날짜를 빠르게 두 번 바꿨을 때 첫 번째 날짜의 시간표가 표시된다.
   */
  React.useEffect(() => {
    // 이미 받아 둔 날짜는 다시 조회하지 않는다.
    if (!date || slotsByDate[date]) return;

    let cancelled = false;

    fetchAvailabilityAction(design.artistId, date).then((result) => {
      if (cancelled) return;

      if (result.ok) {
        setSlotsByDate((prev) => ({ ...prev, [date]: result.data.slots ?? [] }));
        return;
      }

      // 실패해도 빈 배열을 넣어 로딩 상태를 끝낸다. 비워 두면 스켈레톤이 영구히 돌고
      // 사용자는 기다려야 하는지 새로고침해야 하는지 알 수 없다. 원인은 토스트로 알린다.
      setSlotsByDate((prev) => ({ ...prev, [date]: [] }));
      toast(result.message, { tone: 'error' });
    });

    return () => {
      cancelled = true;
    };
    // slotsByDate를 의존성에 넣으면 조회 성공 직후 effect가 다시 돌아 무한 루프가 된다.
    // 위 early-return이 캐시 확인을 대신한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, design.artistId, toast]);

  /** 날짜를 바꾸면 이미 고른 시간은 무효다. 그 날짜에 없는 시간일 수 있다. */
  const handleDateChange = (next: string) => {
    setDate(next);
    setTime('');
  };

  const canGoNext = (() => {
    switch (funnel.step) {
      case 'date':
        return Boolean(date);
      case 'time':
        return Boolean(time);
      case 'email':
        return email.trim().length > 0;
      case 'confirm':
        return agreed;
    }
  })();

  const handleNext = () => {
    if (funnel.step === 'email') {
      // 다음으로 넘어가기 전에 형식을 확인한다. 마지막 단계에서 되돌리면
      // 사용자는 세 단계를 거슬러 올라가야 한다.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
        setEmailError('이메일 주소를 다시 확인해 주세요.');
        return;
      }
      setEmailError(null);
    }
    funnel.next();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await createFlashReservationAction({
      flashDesignId: design.id,
      preferredDate: date,
      preferredTime: time,
      email: email.trim(),
      privacyAgreed: agreed,
    });

    if (!result.ok) {
      setSubmitting(false);
      toast(result.message, { tone: 'error' });
      return;
    }

    // 완료 화면으로 replace한다. push하면 뒤로가기로 예약 폼에 돌아와
    // 같은 예약을 한 번 더 만들 수 있다.
    router.replace(`/${locale}/reservations/${result.data.reservationNumber}?created=1`);
  };

  return (
    <div className="pb-cta min-h-dvh">
      <FunnelHeader
        onBack={funnel.isFirst ? undefined : funnel.prev}
        onClose={() => router.push(`/${locale}/flash/${design.id}`)}
        progress={<StepProgress index={funnel.index} total={funnel.total} />}
      />

      {funnel.step === 'date' && (
        <FunnelStep
          stepKey="date"
          direction={funnel.direction}
          title={dict.reserve.selectDate}
          description={dict.reserve.selectDateDesc}
        >
          <DatePicker
            value={date}
            onChange={handleDateChange}
            availableDates={initialAvailability.availableDates}
            maxDate={initialAvailability.maxDate}
          />
          <p className="text-fg-subtle mt-6 text-[0.8125rem] leading-relaxed">
            취소선이 그어진 날짜는 휴무이거나 예약이 마감된 날입니다. 월요일은 정기 휴무입니다.
          </p>
        </FunnelStep>
      )}

      {funnel.step === 'time' && (
        <FunnelStep
          stepKey="time"
          direction={funnel.direction}
          title={dict.reserve.selectTime}
          description={dict.reserve.selectTimeDesc}
        >
          <p className="text-fg mb-4 text-sm font-medium">{formatDate(date, locale)}</p>

          {slotsLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-11" />
              ))}
            </div>
          ) : slots && slots.length > 0 ? (
            <TimeSlotPicker slots={slots} value={time} onChange={setTime} />
          ) : (
            // 빈 배열은 "이 날짜에 열린 시간이 없음" 또는 조회 실패다. 어느 쪽이든
            // 사용자가 할 수 있는 행동은 같으므로 다른 날짜를 고르도록 안내한다.
            <div className="border-line bg-surface rounded-lg border px-4 py-6 text-center">
              <p className="text-fg text-sm font-medium">선택할 수 있는 시간이 없습니다</p>
              <p className="text-fg-muted mt-1.5 text-[0.8125rem]">다른 날짜를 골라 주세요.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={funnel.prev}>
                날짜 다시 고르기
              </Button>
            </div>
          )}

          <p className="text-fg-subtle mt-6 text-[0.8125rem] leading-relaxed">
            예상 소요 시간은 <span data-numeric>{design.estimatedTime}</span>분입니다. 마감 시간에
            가까운 시간대는 선택되지 않을 수 있습니다.
          </p>
        </FunnelStep>
      )}

      {funnel.step === 'email' && (
        <FunnelStep
          stepKey="email"
          direction={funnel.direction}
          title={dict.reserve.enterEmail}
          description={dict.reserve.enterEmailDesc}
        >
          <Field label={dict.reserve.emailLabel} error={emailError} required>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              // 모바일에서 자동 대문자화를 끈다. 이메일이 'Name@...'으로 들어가는 사고를 막는다.
              autoCapitalize="none"
              spellCheck={false}
              placeholder={dict.reserve.emailPlaceholder}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) setEmailError(null);
              }}
              // 엔터로 다음 단계로 넘어가게 한다. 키보드를 닫고 버튼을 누르는 동작을 줄인다.
              onKeyDown={(event) => {
                if (event.key === 'Enter' && email.trim()) handleNext();
              }}
            />
          </Field>
        </FunnelStep>
      )}

      {funnel.step === 'confirm' && (
        <FunnelStep
          stepKey="confirm"
          direction={funnel.direction}
          title={dict.reserve.agreeTitle}
          description={dict.reserve.depositNotice}
        >
          {/* 지금까지 고른 내용을 전부 보여주고, 각 항목에서 해당 단계로 되돌아갈 수 있게 한다.
              여기서 실수를 발견했을 때 처음부터 다시 해야 하면 흐름을 버린다. */}
          <SummaryList className="border-line rounded-lg border px-4">
            <SummaryItem label={dict.reserve.summaryDesign} value={`#${design.id}`} />
            <SummaryItem label={dict.reserve.summaryArtist} value={design.artistName} />
            <SummaryItem
              label={dict.reserve.summaryDate}
              value={formatDate(date, locale)}
              onEdit={() => funnel.goTo('date')}
            />
            <SummaryItem
              label={dict.reserve.summaryTime}
              value={time}
              onEdit={() => funnel.goTo('time')}
            />
            <SummaryItem
              label={dict.reserve.emailLabel}
              value={email.trim()}
              onEdit={() => funnel.goTo('email')}
            />
            <SummaryItem
              label={dict.reserve.summaryDeposit}
              value={formatCurrency(depositPolicy.flashAmount, locale)}
            />
          </SummaryList>

          <div className="bg-surface mt-6 rounded-lg p-4">
            <CheckboxField
              checked={agreed}
              onCheckedChange={setAgreed}
              description={dict.reserve.agreePrivacyDesc}
              required
              action={
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="text-fg-muted decoration-line-strong hover:text-fg text-xs underline underline-offset-2 transition-colors"
                >
                  {dict.reserve.viewTerms}
                </button>
              }
            >
              {dict.reserve.agreePrivacy}
            </CheckboxField>
          </div>

          <p className="text-fg-subtle mt-5 text-[0.8125rem] leading-relaxed">
            예약 후 <span data-numeric>{depositPolicy.expireAfterDays}</span>일 안에 예약금 입금과
            채널 연락이 없으면 예약이 자동 취소됩니다.
          </p>
        </FunnelStep>
      )}

      {/* ── 하단 고정 CTA ─────────────────────────────────
          "다음"이 항상 같은 자리에 있어야 8단계를 리듬감 있게 넘길 수 있다. */}
      <StickyCta
        summary={
          funnel.step === 'confirm' ? (
            <div className="flex items-baseline justify-between">
              <span className="text-fg-muted text-[0.8125rem]">{dict.reserve.summaryDeposit}</span>
              <span className="text-fg text-[0.9375rem] font-bold" data-numeric>
                {formatCurrency(depositPolicy.flashAmount, locale)}
              </span>
            </div>
          ) : undefined
        }
      >
        {funnel.isLast ? (
          <Button size="xl" block loading={submitting} disabled={!canGoNext} onClick={handleSubmit}>
            {dict.common.submit}
          </Button>
        ) : (
          <Button size="xl" block disabled={!canGoNext} onClick={handleNext}>
            {dict.common.next}
          </Button>
        )}
      </StickyCta>

      {/* 약관 전문 — 바텀시트로 띄운다. 새 페이지로 이동하면 입력값이 날아간다. */}
      <Sheet open={termsOpen} onOpenChange={setTermsOpen}>
        <SheetContent showClose>
          <SheetTitle>개인정보 수집 및 이용 동의</SheetTitle>
          <SheetDescription>예약 확인과 안내 발송 목적으로만 사용합니다.</SheetDescription>
          <div className="text-fg-muted mt-5 space-y-4 text-[0.8125rem] leading-relaxed">
            <section>
              <h3 className="text-fg mb-1 font-semibold">수집 항목</h3>
              <p>이메일 주소, 희망 시술 일시, 선택한 도안 정보</p>
            </section>
            <section>
              <h3 className="text-fg mb-1 font-semibold">수집 목적</h3>
              <p>예약 접수 확인, 예약번호 발송, 시술 전 안내 및 변경사항 공지</p>
            </section>
            <section>
              <h3 className="text-fg mb-1 font-semibold">보유 기간</h3>
              <p>
                시술 완료 후 6개월간 보관하며, 기간 경과 시 지체 없이 파기합니다. 예약이 취소된 경우
                취소 시점부터 3개월간 보관합니다.
              </p>
            </section>
            <section>
              <h3 className="text-fg mb-1 font-semibold">동의를 거부할 권리</h3>
              <p>
                동의를 거부할 수 있으나, 이 경우 예약 접수가 불가능합니다. 전화 또는 채널을 통한
                예약은 별도로 문의해 주세요.
              </p>
            </section>
          </div>
          <Button variant="secondary" block className="mt-6" onClick={() => setTermsOpen(false)}>
            {dict.common.close}
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
