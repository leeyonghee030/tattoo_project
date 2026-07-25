import {
  ReservationStatus,
  type Artist,
  type CalculatorConfig,
  type CustomReservation,
  type DepositPolicy,
  type FaqEntry,
  type FlashDesign,
  type FlashReservation,
  type Notice,
  type Reservation,
  type SiteContent,
} from './domain.ts';

/* ---------------------------------------------------------------------------
 * 시드 데이터 — 데모 화면과 DB 초기 데이터의 공통 출처.
 *
 * 두 곳에서 쓴다.
 *   · apps/web/src/data/mock.ts    — 목 저장소가 메모리에 올리는 초기 상태
 *   · db/seed.sql                  — generate.ts가 INSERT 문으로 변환
 *
 * 한 곳에서 나오므로 "화면에서 보이는 데모 데이터"와 "DB에 넣는 초기 데이터"가
 * 어긋날 수 없다. 예약 시나리오를 하나 추가하면 양쪽에 동시에 반영된다.
 *
 * 화면을 실제처럼 검증하려면 데이터가 현실적이어야 한다. 특히 이런 것들:
 *   - 긴 아티스트명·도안명 (레이아웃이 깨지는지)
 *   - sold out 도안 (비활성 상태가 목록에서 어떻게 보이는지)
 *   - 상태가 골고루 섞인 예약 (배지 5종이 한 화면에 같이 있을 때 구분되는지)
 *   - 빈 값 (introduce가 null인 아티스트)
 * 예쁜 데이터만 넣으면 실제 데이터에서 처음 깨진다.
 *
 * 이미지 URL은 비워 뒀다. 화면에서는 id 기반으로 무채색 패턴을 생성해 채운다.
 * 외부 플레이스홀더 서비스를 쓰면 오프라인에서 전부 깨진 이미지가 된다.
 * ------------------------------------------------------------------------- */

export const ARTISTS: Artist[] = [
  {
    id: 1,
    artistName: '무영',
    introduce:
      '선 하나로 형태를 잡는 작업을 합니다. 얇은 라인워크와 여백을 중요하게 다루며, 시간이 지나도 흐려지지 않는 굵기를 찾는 데 오래 공을 들입니다.',
    artistImageUrl: null,
    genres: ['라인워크', '미니멀', '레터링'],
    socialLinks: { instagram: 'https://instagram.com/', kakao: 'https://pf.kakao.com/' },
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 2,
    artistName: 'HAEUN',
    introduce:
      '동양화의 번짐을 피부 위로 옮기는 작업. 먹의 농담을 그라데이션으로 표현하며 큰 면적 작업을 주로 맡습니다.',
    artistImageUrl: null,
    genres: ['블랙워크', '동양화', '이레주미'],
    socialLinks: { instagram: 'https://instagram.com/', line: 'https://line.me/' },
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 3,
    artistName: '정하',
    // 소개를 아직 안 쓴 아티스트. 목록에서 빈 값 처리가 되는지 확인용.
    introduce: null,
    artistImageUrl: null,
    genres: ['레터링'],
    socialLinks: { instagram: 'https://instagram.com/' },
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 4,
    artistName: 'Seonwoo Bak',
    introduce:
      '기하 도형과 점묘를 조합합니다. 대칭이 어긋나는 지점을 일부러 남겨 두는 편이고, 도안 상담에 시간을 많이 씁니다.',
    artistImageUrl: null,
    genres: ['지오메트릭', '점묘', '블랙워크'],
    socialLinks: {
      instagram: 'https://instagram.com/',
      whatsapp: 'https://wa.me/',
      kakao: 'https://pf.kakao.com/',
    },
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 5,
    // 의도적으로 긴 이름 — 카드·테이블에서 잘림 처리가 되는지 확인용
    artistName: '김레아 · RHEA STUDIO',
    introduce: '컬러 작업 전담. 채도가 오래 남는 잉크만 씁니다.',
    artistImageUrl: null,
    genres: ['컬러', '수채화'],
    socialLinks: { instagram: 'https://instagram.com/' },
    displayOrder: 5,
    isActive: true,
  },
];

export const FLASH_DESIGNS: FlashDesign[] = [
  {
    id: 101,
    artistId: 1,
    artistName: '무영',
    imageUrl: '',
    estimatedTime: 40,
    price: '90,000',
    category: '미니',
    genre: '라인워크',
    isSoldOut: false,
    displayOrder: 1,
  },
  {
    id: 102,
    artistId: 1,
    artistName: '무영',
    imageUrl: '',
    estimatedTime: 60,
    price: '140,000',
    category: '미니',
    genre: '미니멀',
    isSoldOut: false,
    displayOrder: 2,
  },
  {
    id: 103,
    artistId: 1,
    artistName: '무영',
    imageUrl: '',
    estimatedTime: 90,
    price: '210,000',
    category: '스탠다드',
    genre: '라인워크',
    isSoldOut: true,
    displayOrder: 3,
  },
  {
    id: 104,
    artistId: 2,
    artistName: 'HAEUN',
    imageUrl: '',
    estimatedTime: 180,
    price: '450,000',
    category: '라지',
    genre: '블랙워크',
    isSoldOut: false,
    displayOrder: 4,
  },
  {
    id: 105,
    artistId: 2,
    artistName: 'HAEUN',
    imageUrl: '',
    estimatedTime: 240,
    price: '620,000',
    category: '라지',
    genre: '동양화',
    isSoldOut: false,
    displayOrder: 5,
  },
  {
    id: 106,
    artistId: 2,
    artistName: 'HAEUN',
    imageUrl: '',
    estimatedTime: 120,
    price: '300,000',
    category: '스탠다드',
    genre: '이레주미',
    isSoldOut: false,
    displayOrder: 6,
  },
  {
    id: 107,
    artistId: 3,
    artistName: '정하',
    imageUrl: '',
    estimatedTime: 30,
    price: '70,000',
    category: '미니',
    genre: '레터링',
    isSoldOut: false,
    displayOrder: 7,
  },
  {
    id: 108,
    artistId: 3,
    artistName: '정하',
    imageUrl: '',
    estimatedTime: 45,
    price: '110,000',
    category: '미니',
    genre: '레터링',
    isSoldOut: false,
    displayOrder: 8,
  },
  {
    id: 109,
    artistId: 4,
    artistName: 'Seonwoo Bak',
    imageUrl: '',
    estimatedTime: 150,
    price: '380,000',
    category: '라지',
    genre: '지오메트릭',
    isSoldOut: false,
    displayOrder: 9,
  },
  {
    id: 110,
    artistId: 4,
    artistName: 'Seonwoo Bak',
    imageUrl: '',
    estimatedTime: 100,
    price: '250,000',
    category: '스탠다드',
    genre: '점묘',
    isSoldOut: false,
    displayOrder: 10,
  },
  {
    id: 111,
    artistId: 5,
    artistName: '김레아 · RHEA STUDIO',
    imageUrl: '',
    estimatedTime: 120,
    price: '340,000',
    category: '스탠다드',
    genre: '컬러',
    isSoldOut: false,
    displayOrder: 11,
  },
  {
    id: 112,
    artistId: 5,
    artistName: '김레아 · RHEA STUDIO',
    imageUrl: '',
    estimatedTime: 200,
    price: '540,000',
    category: '라지',
    genre: '수채화',
    isSoldOut: true,
    displayOrder: 12,
  },
];

/**
 * 아티스트 로그인 계정 → 아티스트 레코드 매핑 (목 전용).
 *
 * 실제 백엔드는 artist_tb의 email 컬럼으로 이 연결을 갖고 있고, JWT subject로 조회한다.
 * 목에서는 그 테이블이 없으니 여기에 둔다. 목록에 없는 이메일로 로그인하면
 * 첫 번째 아티스트로 취급한다 — 개발 중 아무 계정으로나 화면을 볼 수 있게 하려는 것이고,
 * 실제 백엔드에서는 매칭되지 않으면 조회 실패가 맞다.
 */
export const ARTIST_ACCOUNTS: Record<string, number> = {
  'muyoung@blanktattoo.kr': 1,
  'haeun@blanktattoo.kr': 2,
  'jungha@blanktattoo.kr': 3,
  'seonwoo@blanktattoo.kr': 4,
  'rhea@blanktattoo.kr': 5,
};

/** 커스텀 예약 선택지. 관리자가 편집하는 값이라 실제로는 API로 내려와야 한다. */
export const CUSTOM_OPTIONS = {
  genres: [
    '라인워크',
    '미니멀',
    '블랙워크',
    '동양화',
    '이레주미',
    '지오메트릭',
    '점묘',
    '레터링',
    '컬러',
    '수채화',
  ],
  bodyParts: ['팔 안쪽', '팔 바깥쪽', '손목', '어깨', '등', '허벅지', '발목', '갈비', '목·귀 뒤'],
  sizes: [
    { value: '5cm 이하', description: '동전 크기 정도' },
    { value: '5~10cm', description: '손바닥 절반 정도' },
    { value: '10~20cm', description: '손바닥 전체 정도' },
    { value: '20cm 이상', description: '반나절 이상 소요' },
  ],
  genders: ['여성', '남성', '선택하지 않음'],
  ages: ['10대', '20대', '30대', '40대 이상'],
} as const;

/** 상태가 골고루 섞인 예약 목록. 관리자 테이블·배지 검증용. */
export const RESERVATIONS: Reservation[] = [
  {
    id: 9001,
    type: 'FLASH',
    reservationNumber: 'TT-2026-0148',
    status: ReservationStatus.CONFIRMED,
    email: 'jiwoo.k@example.com',
    preferredDate: '2026-08-03',
    preferredTime: '14:00',
    requestedAt: '2026-07-21T10:24:00',
    flashDesignId: 101,
    flashDesignImageUrl: '',
    artistId: 1,
    artistName: '무영',
    contactChannelUrl: 'https://pf.kakao.com/',
    adminMemo: '재방문 고객. 지난번 손목 작업.',
  } satisfies FlashReservation,
  {
    id: 9002,
    type: 'FLASH',
    reservationNumber: 'TT-2026-0149',
    status: ReservationStatus.PAYMENT_PENDING,
    email: 'haneul@example.com',
    preferredDate: '2026-08-05',
    preferredTime: '11:00',
    requestedAt: '2026-07-22T15:02:00',
    flashDesignId: 104,
    flashDesignImageUrl: '',
    artistId: 2,
    artistName: 'HAEUN',
    contactChannelUrl: 'https://line.me/',
    adminMemo: null,
  } satisfies FlashReservation,
  {
    id: 9003,
    type: 'CUSTOM',
    reservationNumber: 'TT-2026-0150',
    status: ReservationStatus.WAITING,
    email: 'minseo.park@example.com',
    preferredDate: '2026-08-12',
    requestedAt: '2026-07-23T09:41:00',
    artistId: 4,
    artistName: 'Seonwoo Bak',
    tattooGenre: '지오메트릭',
    bodyPart: '등',
    tattooSize: '20cm 이상',
    gender: '남성',
    age: '30대',
    funnel: '인스타그램',
    contactChannelUrl: null,
    progressStep: '도안 시안 작업',
    adminMemo: null,
  } satisfies CustomReservation,
  {
    id: 9004,
    type: 'CUSTOM',
    reservationNumber: 'TT-2026-0151',
    status: ReservationStatus.NO_RESPONSE,
    email: 'lost.contact@example.com',
    preferredDate: '2026-07-30',
    requestedAt: '2026-07-14T20:15:00',
    artistId: null,
    artistName: null,
    tattooGenre: '레터링',
    bodyPart: '손목',
    tattooSize: '5cm 이하',
    gender: '선택하지 않음',
    age: '20대',
    funnel: null,
    contactChannelUrl: null,
    progressStep: null,
    adminMemo: '3일 안내 메일 발송 후 무응답 처리.',
  } satisfies CustomReservation,
  {
    id: 9005,
    type: 'FLASH',
    reservationNumber: 'TT-2026-0152',
    status: ReservationStatus.CANCELLED,
    email: 'cancel.me@example.com',
    preferredDate: '2026-08-01',
    preferredTime: '16:30',
    requestedAt: '2026-07-18T13:00:00',
    flashDesignId: 107,
    flashDesignImageUrl: '',
    artistId: 3,
    artistName: '정하',
    contactChannelUrl: null,
    adminMemo: '고객 요청으로 취소. 예약금 환불 완료.',
  } satisfies FlashReservation,
  {
    id: 9006,
    type: 'FLASH',
    reservationNumber: 'TT-2026-0153',
    status: ReservationStatus.CONFIRMED,
    email: 'yuna.seo@example.com',
    preferredDate: '2026-08-07',
    preferredTime: '13:00',
    requestedAt: '2026-07-24T08:12:00',
    flashDesignId: 111,
    flashDesignImageUrl: '',
    artistId: 5,
    artistName: '김레아 · RHEA STUDIO',
    contactChannelUrl: 'https://instagram.com/',
    adminMemo: null,
  } satisfies FlashReservation,
  {
    id: 9007,
    type: 'CUSTOM',
    reservationNumber: 'TT-2026-0154',
    status: ReservationStatus.PAYMENT_PENDING,
    email: 'dohyun@example.com',
    preferredDate: '2026-08-19',
    requestedAt: '2026-07-24T18:47:00',
    artistId: 2,
    artistName: 'HAEUN',
    tattooGenre: '동양화',
    bodyPart: '허벅지',
    tattooSize: '10~20cm',
    gender: '여성',
    age: '20대',
    funnel: '지인 소개',
    contactChannelUrl: 'https://line.me/',
    progressStep: '상담 예약 완료',
    adminMemo: null,
  } satisfies CustomReservation,
];

export const DEPOSIT_POLICY: DepositPolicy = {
  flashAmount: 50_000,
  customAmount: 100_000,
  bankAccount: { bankName: '카카오뱅크', accountNumber: '3333-01-2345678', holderName: '김타투' },
  paypalUrl: 'https://paypal.me/',
  expireAfterDays: 3,
};

export const CALCULATOR_CONFIG: CalculatorConfig = {
  baseAmount: 50_000,
  disclaimer:
    '계산 결과는 참고용 예상 금액입니다. 실제 금액은 도안 복잡도와 부위에 따라 상담 후 확정됩니다.',
  items: [
    {
      id: 1,
      name: '크기',
      options: [
        { id: 11, label: '3cm 이하', amount: 0 },
        { id: 12, label: '3~5cm', amount: 30_000 },
        { id: 13, label: '5~8cm', amount: 70_000 },
      ],
    },
    {
      id: 2,
      name: '색상',
      options: [
        { id: 21, label: '블랙 단색', amount: 0 },
        { id: 22, label: '블랙 + 1색', amount: 20_000 },
        { id: 23, label: '풀컬러', amount: 50_000 },
      ],
    },
    {
      id: 3,
      name: '부위',
      options: [
        { id: 31, label: '팔·다리', amount: 0 },
        { id: 32, label: '손·발·목', amount: 20_000 },
        { id: 33, label: '갈비·등', amount: 30_000 },
      ],
    },
  ],
};

export const SITE_CONTENT: SiteContent = {
  heroTitle: '흔적이 남는 일에는\n신중한 손이 필요합니다',
  heroSubtitle: '도안을 고르고 날짜를 정하면, 나머지는 아티스트가 맞춰 드립니다.',
  shopAddress: '서울 마포구 연희로 12, 3층',
  shopMapUrl: 'https://map.naver.com/',
  aftercareGuide:
    '시술 후 3시간 뒤 랩을 제거하고 미온수로 가볍게 세척해 주세요. 첫 2주간은 사우나·수영·과도한 음주를 피하고, 처방된 연고를 하루 2회 얇게 바릅니다. 각질이 생기면 억지로 떼지 마세요.',
  socialLinks: {
    instagram: 'https://instagram.com/',
    kakao: 'https://pf.kakao.com/',
    line: 'https://line.me/',
  },
};

export const NOTICES: Notice[] = [
  {
    id: 1,
    title: '8월 휴무 안내 (8/15~8/18)',
    body: '광복절 연휴 기간 휴무입니다. 해당 기간 예약은 받지 않으며, 문의는 채널로 남겨 주시면 8/19부터 순차 답변드립니다.',
    createdAt: '2026-07-20T10:00:00',
    isPinned: true,
  },
  {
    id: 2,
    title: '예약금 정책 변경',
    body: '7월 1일부터 플래시 도안 예약금이 5만원, 커스텀 상담 예약금이 10만원으로 조정되었습니다. 예약금은 시술 금액에서 차감됩니다.',
    createdAt: '2026-06-25T14:30:00',
    isPinned: false,
  },
  {
    id: 3,
    title: '신규 아티스트 합류',
    body: '컬러 작업을 담당하는 김레아 아티스트가 합류했습니다. 플래시 도안이 순차적으로 업로드됩니다.',
    createdAt: '2026-06-10T09:00:00',
    isPinned: false,
  },
];

export const FAQ: FaqEntry[] = [
  {
    id: 1,
    question: '예약금은 환불되나요?',
    answer:
      '시술 7일 전까지 취소하시면 전액 환불됩니다. 이후 취소는 도안 작업이 시작되어 환불이 어렵습니다. 일정 변경은 1회까지 무료입니다.',
    displayOrder: 1,
  },
  {
    id: 2,
    question: '예약번호를 어디에 보내야 하나요?',
    answer:
      '예약 완료 화면과 이메일에 안내된 카카오톡 또는 라인 채널로 예약번호와 입금자명을 보내 주세요. 두 정보가 확인되면 아티스트가 캘린더에 등록하고 예약이 확정됩니다.',
    displayOrder: 2,
  },
  {
    id: 3,
    question: '미성년자도 시술받을 수 있나요?',
    answer: '만 18세 미만은 보호자 동의서와 신분증 사본이 필요합니다. 방문 시 지참해 주세요.',
    displayOrder: 3,
  },
  {
    id: 4,
    question: '도안을 직접 가져가도 되나요?',
    answer:
      '가능합니다. 커스텀 예약으로 진행하시고 상담 단계에서 이미지를 보내 주세요. 저작권이 있는 타 작가의 도안은 그대로 시술하지 않습니다.',
    displayOrder: 4,
  },
  {
    id: 5,
    question: '시술 시간은 얼마나 걸리나요?',
    answer:
      '플래시 도안은 상세 페이지의 예상 시간을 참고해 주세요. 커스텀은 크기와 복잡도에 따라 1시간부터 하루 종일까지 달라집니다.',
    displayOrder: 5,
  },
];
