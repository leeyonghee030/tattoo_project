'use client';

import { Button, Field, Input } from '@tattoo/ui';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { lookupReservationAction } from '@/actions/reservations';
import { getDictionary, type Locale } from '@/lib/i18n';

/**
 * 예약 조회 폼.
 *
 * 예약번호 + 이메일 두 개를 요구한다. 번호만으로 열어주면 번호를 순차 대입해서
 * 남의 예약(이메일 주소 포함)을 볼 수 있다.
 */
export function LookupForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const router = useRouter();

  const [number, setNumber] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result = await lookupReservationAction(number, email);

    if (!result.ok) {
      setPending(false);
      setError(result.message);
      return;
    }

    // 이메일을 쿼리로 넘겨 상세 화면에서도 같은 검증을 태운다.
    // 넘기지 않으면 상세 화면이 번호만으로 열리는 경로가 생긴다.
    router.push(
      `/${locale}/reservations/${result.data.reservationNumber}?email=${encodeURIComponent(email.trim())}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label={dict.lookup.numberLabel} required>
        <Input
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          placeholder={dict.lookup.numberPlaceholder}
          autoCapitalize="characters"
          spellCheck={false}
          // 예약번호는 하이픈 포함 영숫자다. 숫자 키패드를 띄우면 하이픈을 못 넣는다.
          inputMode="text"
          prefix={<Search size={16} />}
        />
      </Field>

      <Field
        label={dict.reserve.emailLabel}
        error={error}
        description="예약 시 입력한 이메일 주소를 그대로 입력해 주세요."
        required
      >
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={dict.reserve.emailPlaceholder}
        />
      </Field>

      <Button
        type="submit"
        size="xl"
        block
        loading={pending}
        disabled={!number.trim() || !email.trim()}
      >
        {dict.lookup.submit}
      </Button>
    </form>
  );
}
