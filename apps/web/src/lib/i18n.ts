/* ---------------------------------------------------------------------------
 * 다국어 — 공개(고객) 화면만 대상이다.
 *
 * README에 콘텐츠 관리의 "다국어(한/영)" 요구가 있어서 라우팅 구조를 미리 [locale]로
 * 잡았다. 관리자·아티스트 화면은 내부 운영 도구이므로 한국어 단일이다. 나중에 필요해도
 * 이 구조를 그대로 확장할 수 있다.
 *
 * next-intl 같은 라이브러리를 쓰지 않은 이유: 지금 필요한 건 정적 사전 하나뿐이고,
 * 복수형·날짜 포맷 같은 기능은 Intl API로 충분하다. 문구가 수백 개로 늘어나면
 * 그때 도입하면 된다 — 구조가 같아서 옮기기 쉽다.
 * ------------------------------------------------------------------------- */

export const LOCALES = ['ko', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ko';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

const ko = {
  common: {
    next: '다음',
    prev: '이전',
    submit: '완료',
    cancel: '취소',
    confirm: '확인',
    close: '닫기',
    search: '검색',
    loading: '불러오는 중',
    required: '필수',
    optional: '선택',
    won: '원',
    minutes: '분',
    copy: '복사',
    copied: '복사됨',
  },
  nav: {
    artists: '아티스트',
    flash: '플래시 도안',
    custom: '커스텀 예약',
    calculator: '미니타투 계산기',
    lookup: '예약 조회',
    guide: '이용 안내',
    shop: '샵 상품',
    reserve: '예약하기',
  },
  home: {
    heroTitle: '흔적이 남는 일에는\n신중한 손이 필요합니다',
    heroSubtitle: '도안을 고르고 날짜를 정하면, 나머지는 아티스트가 맞춰 드립니다.',
    ctaFlash: '플래시 도안 보기',
    ctaCustom: '커스텀 상담 시작',
    sectionArtists: '아티스트',
    sectionArtistsDesc: '작업 성향과 주력 장르를 보고 고르세요.',
    sectionFlash: '플래시 도안',
    sectionFlashDesc: '바로 예약할 수 있는 완성 도안입니다.',
    sectionNotice: '공지',
    viewAll: '전체 보기',
  },
  flash: {
    title: '플래시 도안',
    description: '원하는 도안을 고르면 날짜 선택으로 이어집니다.',
    soldOut: '판매 종료',
    estimatedTime: '예상 시간',
    filterAll: '전체',
    filterArtist: '아티스트',
    filterGenre: '장르',
    reserveThis: '이 도안으로 예약',
    empty: '조건에 맞는 도안이 없습니다',
    emptyDesc: '필터를 넓혀 보거나 커스텀 상담을 이용해 보세요.',
  },
  reserve: {
    selectDate: '언제 방문하시겠어요?',
    selectDateDesc: '아티스트가 예약을 받는 날짜만 표시됩니다.',
    selectTime: '몇 시가 좋으세요?',
    selectTimeDesc: '이미 예약된 시간은 선택할 수 없습니다.',
    enterEmail: '예약 안내를 받을 이메일을 알려주세요',
    enterEmailDesc: '예약번호와 안내 사항을 이 주소로 보냅니다.',
    emailLabel: '이메일',
    emailPlaceholder: 'name@example.com',
    agreeTitle: '마지막으로 확인해 주세요',
    agreePrivacy: '개인정보처리방침에 동의합니다',
    agreePrivacyDesc: '예약 확인과 안내 발송에만 사용하고, 시술 후 6개월 뒤 삭제합니다.',
    viewTerms: '전문 보기',
    summaryTitle: '예약 내용',
    summaryDesign: '도안',
    summaryArtist: '아티스트',
    summaryDate: '날짜',
    summaryTime: '시간',
    summaryDeposit: '예약금',
    depositNotice: '예약금 입금이 확인되면 예약이 확정됩니다.',
    completeTitle: '예약이 접수되었습니다',
    completeDesc: '아래 예약번호를 채널로 보내 주시면 확인이 빨라집니다.',
    reservationNumber: '예약번호',
    depositGuide: '예약금 안내',
    markPaid: '입금을 완료했어요',
    markPaidDone: '입금 확인 중입니다',
    goHome: '처음으로',
  },
  custom: {
    stepArtist: '어떤 아티스트에게 받고 싶으세요?',
    stepArtistDesc: '정하지 못했다면 건너뛰어도 됩니다.',
    stepGenre: '어떤 스타일을 원하세요?',
    stepBodyPart: '어디에 받으실 예정인가요?',
    stepSize: '크기는 어느 정도가 좋을까요?',
    stepGender: '성별을 알려주세요',
    stepGenderDesc: '부위별 시술 안내에 참고합니다.',
    stepAge: '연령대를 알려주세요',
    stepAgeDesc: '미성년자는 보호자 동의가 필요합니다.',
    stepDate: '희망하는 날짜가 있으세요?',
    stepDateDesc: '상담 후 조정될 수 있습니다.',
    skip: '아직 모르겠어요',
    anyArtist: '추천해 주세요',
  },
  lookup: {
    title: '예약 조회',
    description: '예약번호와 이메일을 입력하면 진행 상황을 확인할 수 있습니다.',
    numberLabel: '예약번호',
    numberPlaceholder: 'TT-2026-0000',
    submit: '조회하기',
    notFound: '예약을 찾을 수 없습니다',
    notFoundDesc: '예약번호와 이메일을 다시 확인해 주세요.',
  },
  status: {
    waiting: '대기',
    paymentPending: '입금확인대기',
    confirmed: '확정',
    noResponse: '무응답',
    cancelled: '취소',
  },
  calculator: {
    title: '미니타투 계산기',
    description: '항목을 고르면 예상 금액이 계산됩니다.',
    estimated: '예상 금액',
    reset: '초기화',
  },
  footer: {
    address: '주소',
    hours: '영업시간',
    contact: '문의',
    terms: '이용약관',
    privacy: '개인정보처리방침',
  },
} as const;

/** 영문 사전. 구조는 한국어와 동일해야 한다(타입으로 강제된다). */
const en: Dictionary = {
  common: {
    next: 'Next',
    prev: 'Back',
    submit: 'Done',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    search: 'Search',
    loading: 'Loading',
    required: 'Required',
    optional: 'Optional',
    won: 'KRW',
    minutes: 'min',
    copy: 'Copy',
    copied: 'Copied',
  },
  nav: {
    artists: 'Artists',
    flash: 'Flash designs',
    custom: 'Custom booking',
    calculator: 'Mini tattoo calculator',
    lookup: 'Find booking',
    guide: 'Guide',
    shop: 'Shop',
    reserve: 'Book now',
  },
  home: {
    heroTitle: 'Permanent work\ndeserves a careful hand',
    heroSubtitle: 'Pick a design, choose a date. Your artist takes it from there.',
    ctaFlash: 'Browse flash designs',
    ctaCustom: 'Start a custom consult',
    sectionArtists: 'Artists',
    sectionArtistsDesc: 'Choose by style and specialty.',
    sectionFlash: 'Flash designs',
    sectionFlashDesc: 'Ready-made designs you can book right away.',
    sectionNotice: 'Notices',
    viewAll: 'View all',
  },
  flash: {
    title: 'Flash designs',
    description: 'Pick a design and continue to date selection.',
    soldOut: 'Sold out',
    estimatedTime: 'Est. time',
    filterAll: 'All',
    filterArtist: 'Artist',
    filterGenre: 'Genre',
    reserveThis: 'Book this design',
    empty: 'No designs match your filters',
    emptyDesc: 'Try widening the filters, or start a custom consult.',
  },
  reserve: {
    selectDate: 'When would you like to come in?',
    selectDateDesc: 'Only dates your artist accepts are shown.',
    selectTime: 'What time works for you?',
    selectTimeDesc: 'Times already booked cannot be selected.',
    enterEmail: 'Where should we send your booking details?',
    enterEmailDesc: 'We will email your booking number and next steps.',
    emailLabel: 'Email',
    emailPlaceholder: 'name@example.com',
    agreeTitle: 'One last check',
    agreePrivacy: 'I agree to the privacy policy',
    agreePrivacyDesc:
      'Used only to confirm your booking and send updates. Deleted 6 months after your session.',
    viewTerms: 'Read full text',
    summaryTitle: 'Booking details',
    summaryDesign: 'Design',
    summaryArtist: 'Artist',
    summaryDate: 'Date',
    summaryTime: 'Time',
    summaryDeposit: 'Deposit',
    depositNotice: 'Your booking is confirmed once the deposit is received.',
    completeTitle: 'Booking received',
    completeDesc: 'Send the booking number below through our channel to speed up confirmation.',
    reservationNumber: 'Booking number',
    depositGuide: 'Deposit details',
    markPaid: 'I have sent the deposit',
    markPaidDone: 'Checking your deposit',
    goHome: 'Back to home',
  },
  custom: {
    stepArtist: 'Which artist would you like?',
    stepArtistDesc: 'You can skip this if you are unsure.',
    stepGenre: 'What style are you after?',
    stepBodyPart: 'Where would you like it?',
    stepSize: 'Roughly what size?',
    stepGender: 'Your gender',
    stepGenderDesc: 'Used for placement guidance.',
    stepAge: 'Your age range',
    stepAgeDesc: 'Minors need guardian consent.',
    stepDate: 'Any date in mind?',
    stepDateDesc: 'This can shift after the consult.',
    skip: 'Not sure yet',
    anyArtist: 'Recommend one for me',
  },
  lookup: {
    title: 'Find your booking',
    description: 'Enter your booking number and email to see its status.',
    numberLabel: 'Booking number',
    numberPlaceholder: 'TT-2026-0000',
    submit: 'Look up',
    notFound: 'Booking not found',
    notFoundDesc: 'Please check the booking number and email again.',
  },
  status: {
    waiting: 'Waiting',
    paymentPending: 'Verifying deposit',
    confirmed: 'Confirmed',
    noResponse: 'No response',
    cancelled: 'Cancelled',
  },
  calculator: {
    title: 'Mini tattoo calculator',
    description: 'Choose options to see an estimate.',
    estimated: 'Estimated',
    reset: 'Reset',
  },
  footer: {
    address: 'Address',
    hours: 'Hours',
    contact: 'Contact',
    terms: 'Terms',
    privacy: 'Privacy',
  },
};

/** 한국어 사전이 기준(source of truth). 영문 사전은 이 형태를 만족해야 한다. */
export type Dictionary = {
  [Section in keyof typeof ko]: { [Key in keyof (typeof ko)[Section]]: string };
};

const DICTIONARIES: Record<Locale, Dictionary> = { ko, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** 로케일에 맞는 금액 표기. 'KRW 150,000'이 아니라 '150,000원'으로 나오게 한다. */
export function formatCurrency(amount: number, locale: Locale): string {
  const formatted = new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(amount);
  return locale === 'ko' ? `${formatted}원` : `KRW ${formatted}`;
}

/** 'YYYY-MM-DD' → '2026년 8월 3일 (월)' / 'Mon, Aug 3, 2026' */
export function formatDate(dateKey: string, locale: Locale): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const date = new Date(y, m - 1, d);

  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: locale === 'ko' ? 'long' : 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}
