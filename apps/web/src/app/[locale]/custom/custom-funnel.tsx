'use client';

import type {
  Artist,
  AvailabilityResponse,
  CustomReservationOptions,
  DepositPolicy,
} from '@tattoo/api-client';
import {
  Button,
  CheckboxField,
  ChoiceCard,
  ChoiceGrid,
  DatePicker,
  Field,
  FunnelHeader,
  FunnelStep,
  Input,
  OptionItem,
  OptionList,
  StepProgress,
  StickyCta,
  SummaryItem,
  SummaryList,
  useFunnel,
  useToast,
} from '@tattoo/ui';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { createCustomReservationAction } from '@/actions/reservations';
import { DesignThumb } from '@/components/design-thumb';
import { formatCurrency, formatDate, getDictionary, type Locale } from '@/lib/i18n';

/* ---------------------------------------------------------------------------
 * 커스텀 예약 퍼널 — README 시나리오 2의 8단계.
 *
 *   1 아티스트 · 2 장르 · 3 부위 · 4 크기 · 5 성별 · 6 연령대 · 7 날짜 · 8 이메일+동의
 *
 * 단일 선택 단계는 "선택하면 자동으로 다음"으로 넘긴다. 탭 한 번에 넘어가면 8단계가
 * 체감상 훨씬 짧다. 대신 되돌릴 수 있어야 하므로(오선택) 뒤로가기가 항상 열려 있고,
 * 마지막 확인 화면에서 모든 항목을 수정할 수 있다.
 *
 * 자동 진행을 하지 않는 단계는 날짜(달력은 오조작이 쉽다)와 마지막 폼이다.
 * ------------------------------------------------------------------------- */

const STEPS = ['artist', 'genre', 'bodyPart', 'size', 'gender', 'age', 'date', 'contact'] as const;

/** 아티스트를 지정하지 않는 선택지. 빈 문자열은 '미선택'과 구분되지 않아 별도 토큰을 쓴다. */
const ANY_ARTIST = 'any';

interface CustomFunnelProps {
  locale: Locale;
  artists: Artist[];
  options: CustomReservationOptions;
  availability: AvailabilityResponse;
  depositPolicy: DepositPolicy;
}

export function CustomFunnel({
  locale,
  artists,
  options,
  availability,
  depositPolicy,
}: CustomFunnelProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const { toast } = useToast();
  const funnel = useFunnel(STEPS);

  const [artistChoice, setArtistChoice] = React.useState('');
  const [genre, setGenre] = React.useState('');
  const [bodyPart, setBodyPart] = React.useState('');
  const [size, setSize] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [age, setAge] = React.useState('');
  const [date, setDate] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [agreed, setAgreed] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  /**
   * 선택 후 자동으로 다음 단계로.
   *
   * 즉시 넘기면 사용자가 자기 선택이 반영된 걸 못 보고 넘어간다. 아주 짧은 지연(160ms)을
   * 두면 체크 표시가 한 번 보이고 넘어가서 "눌린 것이 맞다"는 확인이 된다.
   */
  const advanceAfterPick = React.useCallback(() => {
    const timer = setTimeout(() => funnel.next(), 160);
    return () => clearTimeout(timer);
  }, [funnel]);

  const pick = <T,>(setter: (value: T) => void) => {
    return (value: T) => {
      setter(value);
      advanceAfterPick();
    };
  };

  const selectedArtist =
    artistChoice && artistChoice !== ANY_ARTIST
      ? artists.find((a) => String(a.id) === artistChoice)
      : undefined;

  const canGoNext = (() => {
    switch (funnel.step) {
      case 'artist':
        return Boolean(artistChoice);
      case 'genre':
        return Boolean(genre);
      case 'bodyPart':
        return Boolean(bodyPart);
      case 'size':
        return Boolean(size);
      case 'gender':
        return Boolean(gender);
      case 'age':
        return Boolean(age);
      // 날짜는 건너뛸 수 있다 — 커스텀은 상담에서 정해도 된다.
      case 'date':
        return true;
      case 'contact':
        return email.trim().length > 0 && agreed;
    }
  })();

  const handleSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setEmailError('이메일 주소를 다시 확인해 주세요.');
      return;
    }
    setEmailError(null);
    setSubmitting(true);

    const result = await createCustomReservationAction({
      artistId: selectedArtist?.id ?? null,
      tattooGenre: genre,
      bodyPart,
      tattooSize: size,
      gender,
      age,
      preferredDate: date || null,
      email: email.trim(),
      privacyAgreed: agreed,
    });

    if (!result.ok) {
      setSubmitting(false);
      toast(result.message, { tone: 'error' });
      return;
    }

    router.replace(`/${locale}/reservations/${result.data.reservationNumber}?created=1`);
  };

  return (
    <div className="pb-cta min-h-dvh">
      <FunnelHeader
        onBack={funnel.isFirst ? undefined : funnel.prev}
        onClose={() => router.push(`/${locale}`)}
        progress={<StepProgress index={funnel.index} total={funnel.total} />}
      />

      {/* 1 — 아티스트 */}
      {funnel.step === 'artist' && (
        <FunnelStep
          stepKey="artist"
          direction={funnel.direction}
          title={dict.custom.stepArtist}
          description={dict.custom.stepArtistDesc}
        >
          <ChoiceGrid value={artistChoice} onValueChange={pick(setArtistChoice)}>
            {artists.map((artist) => (
              <ChoiceCard
                key={artist.id}
                value={String(artist.id)}
                label={artist.artistName}
                description={artist.genres.slice(0, 2).join(' · ')}
                media={
                  <DesignThumb
                    seed={artist.id * 7}
                    imageUrl={artist.artistImageUrl}
                    alt={`${artist.artistName} 프로필`}
                    ratio="4/5"
                    className="size-full"
                  />
                }
              />
            ))}
          </ChoiceGrid>

          <div className="mt-3">
            <OptionList value={artistChoice} onValueChange={pick(setArtistChoice)}>
              <OptionItem
                value={ANY_ARTIST}
                label={dict.custom.anyArtist}
                description="상담 후 작업 성향이 맞는 아티스트를 배정해 드립니다."
              />
            </OptionList>
          </div>
        </FunnelStep>
      )}

      {/* 2 — 장르 */}
      {funnel.step === 'genre' && (
        <FunnelStep stepKey="genre" direction={funnel.direction} title={dict.custom.stepGenre}>
          <OptionList value={genre} onValueChange={pick(setGenre)} columns={2}>
            {options.genres.map((item) => (
              <OptionItem key={item} value={item} label={item} />
            ))}
          </OptionList>
        </FunnelStep>
      )}

      {/* 3 — 부위 */}
      {funnel.step === 'bodyPart' && (
        <FunnelStep
          stepKey="bodyPart"
          direction={funnel.direction}
          title={dict.custom.stepBodyPart}
        >
          <OptionList value={bodyPart} onValueChange={pick(setBodyPart)} columns={2}>
            {options.bodyParts.map((item) => (
              <OptionItem key={item} value={item} label={item} />
            ))}
          </OptionList>
        </FunnelStep>
      )}

      {/* 4 — 크기 */}
      {funnel.step === 'size' && (
        <FunnelStep stepKey="size" direction={funnel.direction} title={dict.custom.stepSize}>
          <OptionList value={size} onValueChange={pick(setSize)}>
            {options.sizes.map((item) => (
              <OptionItem
                key={item.value}
                value={item.value}
                label={item.value}
                description={item.description}
              />
            ))}
          </OptionList>
        </FunnelStep>
      )}

      {/* 5 — 성별 */}
      {funnel.step === 'gender' && (
        <FunnelStep
          stepKey="gender"
          direction={funnel.direction}
          title={dict.custom.stepGender}
          description={dict.custom.stepGenderDesc}
        >
          <OptionList value={gender} onValueChange={pick(setGender)}>
            {options.genders.map((item) => (
              <OptionItem key={item} value={item} label={item} />
            ))}
          </OptionList>
        </FunnelStep>
      )}

      {/* 6 — 연령대 */}
      {funnel.step === 'age' && (
        <FunnelStep
          stepKey="age"
          direction={funnel.direction}
          title={dict.custom.stepAge}
          description={dict.custom.stepAgeDesc}
        >
          <OptionList value={age} onValueChange={pick(setAge)} columns={2}>
            {options.ages.map((item) => (
              <OptionItem key={item} value={item} label={item} />
            ))}
          </OptionList>
        </FunnelStep>
      )}

      {/* 7 — 날짜 (건너뛰기 가능) */}
      {funnel.step === 'date' && (
        <FunnelStep
          stepKey="date"
          direction={funnel.direction}
          title={dict.custom.stepDate}
          description={dict.custom.stepDateDesc}
        >
          <DatePicker
            value={date}
            onChange={setDate}
            availableDates={availability.availableDates}
            maxDate={availability.maxDate}
          />
          {date && (
            <Button variant="link" className="mt-5" onClick={() => setDate('')}>
              날짜 선택 해제
            </Button>
          )}
        </FunnelStep>
      )}

      {/* 8 — 이메일 + 동의 + 확인 */}
      {funnel.step === 'contact' && (
        <FunnelStep
          stepKey="contact"
          direction={funnel.direction}
          title={dict.reserve.enterEmail}
          description={dict.reserve.enterEmailDesc}
        >
          <Field label={dict.reserve.emailLabel} error={emailError} required>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={dict.reserve.emailPlaceholder}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) setEmailError(null);
              }}
            />
          </Field>

          <h2 className="text-fg mt-9 mb-2 text-sm font-semibold">{dict.reserve.summaryTitle}</h2>
          <SummaryList className="border-line rounded-lg border px-4">
            <SummaryItem
              label={dict.reserve.summaryArtist}
              value={selectedArtist?.artistName ?? dict.custom.anyArtist}
              onEdit={() => funnel.goTo('artist')}
            />
            <SummaryItem label="스타일" value={genre} onEdit={() => funnel.goTo('genre')} />
            <SummaryItem label="부위" value={bodyPart} onEdit={() => funnel.goTo('bodyPart')} />
            <SummaryItem label="크기" value={size} onEdit={() => funnel.goTo('size')} />
            <SummaryItem label="성별" value={gender} onEdit={() => funnel.goTo('gender')} />
            <SummaryItem label="연령대" value={age} onEdit={() => funnel.goTo('age')} />
            <SummaryItem
              label={dict.reserve.summaryDate}
              value={date ? formatDate(date, locale) : ''}
              placeholder="상담 후 결정"
              onEdit={() => funnel.goTo('date')}
            />
          </SummaryList>

          <div className="bg-surface mt-6 rounded-lg p-4">
            <CheckboxField
              checked={agreed}
              onCheckedChange={setAgreed}
              description={dict.reserve.agreePrivacyDesc}
              required
            >
              {dict.reserve.agreePrivacy}
            </CheckboxField>
          </div>

          <p className="text-fg-subtle mt-5 text-[0.8125rem] leading-relaxed">
            상담 예약금은{' '}
            <span className="text-fg font-medium" data-numeric>
              {formatCurrency(depositPolicy.customAmount, locale)}
            </span>
            이며, 도안 작업이 시작되면 시술 금액에서 차감됩니다.
          </p>
        </FunnelStep>
      )}

      <StickyCta>
        {funnel.isLast ? (
          <Button size="xl" block loading={submitting} disabled={!canGoNext} onClick={handleSubmit}>
            {dict.common.submit}
          </Button>
        ) : funnel.step === 'date' ? (
          // 날짜 단계만 두 개의 행동을 둔다. 건너뛰기를 같은 크기로 두면
          // 사용자가 날짜를 고르는 것보다 건너뛰기를 먼저 누른다.
          <div className="flex gap-2">
            <Button size="xl" variant="secondary" className="flex-1" onClick={funnel.next}>
              {dict.custom.skip}
            </Button>
            <Button size="xl" className="flex-[2]" disabled={!date} onClick={funnel.next}>
              {dict.common.next}
            </Button>
          </div>
        ) : (
          <Button size="xl" block disabled={!canGoNext} onClick={funnel.next}>
            {dict.common.next}
          </Button>
        )}
      </StickyCta>
    </div>
  );
}
