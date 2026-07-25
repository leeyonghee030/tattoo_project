-- ⚠️ 이 파일은 생성물입니다. 직접 수정하지 마세요.
-- 원본: packages/contract/src/seed.ts
-- 재생성: pnpm db:generate
--
-- 수정하려면 원본을 고치고 재생성 명령을 실행하세요.
-- 직접 수정하면 `pnpm db:check`가 실패합니다.

-- 데모 데이터입니다. 프론트 목 저장소가 메모리에 올리는 것과 같은 내용이라
-- 이 SQL을 넣으면 DATA_SOURCE=http로 바꿔도 화면이 동일하게 보입니다.

-- ⚠️ 비밀번호가 평문입니다.
--    현재 백엔드가 `password.equals(passwordHash)`로 평문 비교하기 때문입니다
--    (docs/API-CONTRACT.md 0.3). BCrypt를 적용한 뒤에는 반드시 해시로 교체하세요.
--    운영 환경에 이 시드를 그대로 넣으면 안 됩니다.

USE `tattoo`;

-- 외래키 때문에 삭제 순서가 중요하다. 자식부터 비운다.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `flash_reservation_tb`;
TRUNCATE TABLE `custom_reservation_tb`;
TRUNCATE TABLE `artist_genre_tb`;
TRUNCATE TABLE `flash_design_tb`;
TRUNCATE TABLE `user_tb`;
TRUNCATE TABLE `artist_tb`;
TRUNCATE TABLE `admin_tb`;
TRUNCATE TABLE `notice_tb`;
TRUNCATE TABLE `faq_tb`;
TRUNCATE TABLE `site_content_tb`;
TRUNCATE TABLE `deposit_policy_tb`;
TRUNCATE TABLE `calculator_option_tb`;
TRUNCATE TABLE `calculator_item_tb`;
TRUNCATE TABLE `custom_option_tb`;
TRUNCATE TABLE `shop_schedule_tb`;
SET FOREIGN_KEY_CHECKS = 1;

-- ── 관리자 ──────────────────────────────────────────
INSERT INTO `admin_tb` (`id`, `email`, `password_hash`) VALUES
  (1, 'admin@blanktattoo.kr', 'admin1234');

-- ── 아티스트 ────────────────────────────────────────
INSERT INTO `artist_tb`
  (`id`, `email`, `password_hash`, `is_verified`, `artist_name`, `introduce`,
   `artist_image_url`, `instagram_form_url`, `kakao_form_url`, `line_form_url`,
   `watts_form_url`, `display_order`, `is_active`) VALUES
  (1, 'muyoung@blanktattoo.kr', 'artist1234', 1, '무영', '선 하나로 형태를 잡는 작업을 합니다. 얇은 라인워크와 여백을 중요하게 다루며, 시간이 지나도 흐려지지 않는 굵기를 찾는 데 오래 공을 들입니다.', NULL, 'https://instagram.com/', 'https://pf.kakao.com/', NULL, NULL, 1, 1),
  (2, 'haeun@blanktattoo.kr', 'artist1234', 1, 'HAEUN', '동양화의 번짐을 피부 위로 옮기는 작업. 먹의 농담을 그라데이션으로 표현하며 큰 면적 작업을 주로 맡습니다.', NULL, 'https://instagram.com/', NULL, 'https://line.me/', NULL, 2, 1),
  (3, 'jungha@blanktattoo.kr', 'artist1234', 1, '정하', NULL, NULL, 'https://instagram.com/', NULL, NULL, NULL, 3, 1),
  (4, 'seonwoo@blanktattoo.kr', 'artist1234', 1, 'Seonwoo Bak', '기하 도형과 점묘를 조합합니다. 대칭이 어긋나는 지점을 일부러 남겨 두는 편이고, 도안 상담에 시간을 많이 씁니다.', NULL, 'https://instagram.com/', 'https://pf.kakao.com/', NULL, 'https://wa.me/', 4, 1),
  (5, 'rhea@blanktattoo.kr', 'artist1234', 1, '김레아 · RHEA STUDIO', '컬러 작업 전담. 채도가 오래 남는 잉크만 씁니다.', NULL, 'https://instagram.com/', NULL, NULL, NULL, 5, 1);

-- ── 아티스트 장르 ───────────────────────────────────
INSERT INTO `artist_genre_tb` (`artist_id`, `genre`, `display_order`) VALUES
  (1, '라인워크', 0),
  (1, '미니멀', 1),
  (1, '레터링', 2),
  (2, '블랙워크', 0),
  (2, '동양화', 1),
  (2, '이레주미', 2),
  (3, '레터링', 0),
  (4, '지오메트릭', 0),
  (4, '점묘', 1),
  (4, '블랙워크', 2),
  (5, '컬러', 0),
  (5, '수채화', 1);

-- ── 고객 (예약 이메일에서 도출) ─────────────────────
INSERT INTO `user_tb` (`id`, `email`, `is_verified`) VALUES
  (5001, 'cancel.me@example.com', 1),
  (5002, 'dohyun@example.com', 1),
  (5003, 'haneul@example.com', 1),
  (5004, 'jiwoo.k@example.com', 1),
  (5005, 'lost.contact@example.com', 1),
  (5006, 'minseo.park@example.com', 1),
  (5007, 'yuna.seo@example.com', 1);

-- ── 플래시 도안 ─────────────────────────────────────
INSERT INTO `flash_design_tb`
  (`id`, `artist_id`, `image_url`, `estimated_time`, `price`, `price_amount`,
   `category`, `genre`, `is_sold_out`, `display_order`) VALUES
  (101, 1, '', 40, '90,000', 90000, '미니', '라인워크', 0, 1),
  (102, 1, '', 60, '140,000', 140000, '미니', '미니멀', 0, 2),
  (103, 1, '', 90, '210,000', 210000, '스탠다드', '라인워크', 1, 3),
  (104, 2, '', 180, '450,000', 450000, '라지', '블랙워크', 0, 4),
  (105, 2, '', 240, '620,000', 620000, '라지', '동양화', 0, 5),
  (106, 2, '', 120, '300,000', 300000, '스탠다드', '이레주미', 0, 6),
  (107, 3, '', 30, '70,000', 70000, '미니', '레터링', 0, 7),
  (108, 3, '', 45, '110,000', 110000, '미니', '레터링', 0, 8),
  (109, 4, '', 150, '380,000', 380000, '라지', '지오메트릭', 0, 9),
  (110, 4, '', 100, '250,000', 250000, '스탠다드', '점묘', 0, 10),
  (111, 5, '', 120, '340,000', 340000, '스탠다드', '컬러', 0, 11),
  (112, 5, '', 200, '540,000', 540000, '라지', '수채화', 1, 12);

-- ── 플래시 예약 ─────────────────────────────────────
INSERT INTO `flash_reservation_tb`
  (`id`, `reservation_number`, `user_id`, `flash_design_id`, `artist_id`,
   `preferred_date`, `preferred_time`, `status`, `contact_channel_url`,
   `privacy_agreed_at`, `admin_memo`, `requested_at`) VALUES
  (9001, 'TT-2026-0148', 5004, 101, 1, '2026-08-03', '14:00', 2, 'https://pf.kakao.com/', '2026-07-21T10:24:00', '재방문 고객. 지난번 손목 작업.', '2026-07-21T10:24:00'),
  (9002, 'TT-2026-0149', 5003, 104, 2, '2026-08-05', '11:00', 1, 'https://line.me/', '2026-07-22T15:02:00', NULL, '2026-07-22T15:02:00'),
  (9005, 'TT-2026-0152', 5001, 107, 3, '2026-08-01', '16:30', 4, NULL, '2026-07-18T13:00:00', '고객 요청으로 취소. 예약금 환불 완료.', '2026-07-18T13:00:00'),
  (9006, 'TT-2026-0153', 5007, 111, 5, '2026-08-07', '13:00', 2, 'https://instagram.com/', '2026-07-24T08:12:00', NULL, '2026-07-24T08:12:00');

-- ── 커스텀 예약 ─────────────────────────────────────
INSERT INTO `custom_reservation_tb`
  (`id`, `reservation_number`, `user_id`, `artist_id`, `tattoo_genre`, `body_part`,
   `tattoo_size`, `gender`, `age`, `preferred_date`, `funnel`, `status`,
   `progress_step`, `contact_channel_url`, `privacy_agreed_at`, `admin_memo`,
   `requested_at`) VALUES
  (9003, 'TT-2026-0150', 5006, 4, '지오메트릭', '등', '20cm 이상', '남성', '30대', '2026-08-12', '인스타그램', 0, '도안 시안 작업', NULL, '2026-07-23T09:41:00', NULL, '2026-07-23T09:41:00'),
  (9004, 'TT-2026-0151', 5005, NULL, '레터링', '손목', '5cm 이하', '선택하지 않음', '20대', '2026-07-30', NULL, 3, NULL, NULL, '2026-07-14T20:15:00', '3일 안내 메일 발송 후 무응답 처리.', '2026-07-14T20:15:00'),
  (9007, 'TT-2026-0154', 5002, 2, '동양화', '허벅지', '10~20cm', '여성', '20대', '2026-08-19', '지인 소개', 1, '상담 예약 완료', 'https://line.me/', '2026-07-24T18:47:00', NULL, '2026-07-24T18:47:00');

-- ── 공지 ────────────────────────────────────────────
INSERT INTO `notice_tb` (`id`, `title`, `body`, `is_pinned`, `created_at`) VALUES
  (1, '8월 휴무 안내 (8/15~8/18)', '광복절 연휴 기간 휴무입니다. 해당 기간 예약은 받지 않으며, 문의는 채널로 남겨 주시면 8/19부터 순차 답변드립니다.', 1, '2026-07-20T10:00:00'),
  (2, '예약금 정책 변경', '7월 1일부터 플래시 도안 예약금이 5만원, 커스텀 상담 예약금이 10만원으로 조정되었습니다. 예약금은 시술 금액에서 차감됩니다.', 0, '2026-06-25T14:30:00'),
  (3, '신규 아티스트 합류', '컬러 작업을 담당하는 김레아 아티스트가 합류했습니다. 플래시 도안이 순차적으로 업로드됩니다.', 0, '2026-06-10T09:00:00');

-- ── FAQ ─────────────────────────────────────────────
INSERT INTO `faq_tb` (`id`, `question`, `answer`, `display_order`) VALUES
  (1, '예약금은 환불되나요?', '시술 7일 전까지 취소하시면 전액 환불됩니다. 이후 취소는 도안 작업이 시작되어 환불이 어렵습니다. 일정 변경은 1회까지 무료입니다.', 1),
  (2, '예약번호를 어디에 보내야 하나요?', '예약 완료 화면과 이메일에 안내된 카카오톡 또는 라인 채널로 예약번호와 입금자명을 보내 주세요. 두 정보가 확인되면 아티스트가 캘린더에 등록하고 예약이 확정됩니다.', 2),
  (3, '미성년자도 시술받을 수 있나요?', '만 18세 미만은 보호자 동의서와 신분증 사본이 필요합니다. 방문 시 지참해 주세요.', 3),
  (4, '도안을 직접 가져가도 되나요?', '가능합니다. 커스텀 예약으로 진행하시고 상담 단계에서 이미지를 보내 주세요. 저작권이 있는 타 작가의 도안은 그대로 시술하지 않습니다.', 4),
  (5, '시술 시간은 얼마나 걸리나요?', '플래시 도안은 상세 페이지의 예상 시간을 참고해 주세요. 커스텀은 크기와 복잡도에 따라 1시간부터 하루 종일까지 달라집니다.', 5);

-- ── 사이트 문구 ─────────────────────────────────────
-- 영문은 프론트 정적 사전(apps/web/src/lib/i18n.ts)에 있어 아직 DB에 없습니다.
-- 관리자가 영문을 편집하려면 locale=en 행을 채워야 합니다.
INSERT INTO `site_content_tb` (`locale`, `content_key`, `content_value`) VALUES
  ('ko', 'heroTitle', '흔적이 남는 일에는
신중한 손이 필요합니다'),
  ('ko', 'heroSubtitle', '도안을 고르고 날짜를 정하면, 나머지는 아티스트가 맞춰 드립니다.'),
  ('ko', 'shopAddress', '서울 마포구 연희로 12, 3층'),
  ('ko', 'shopMapUrl', 'https://map.naver.com/'),
  ('ko', 'aftercareGuide', '시술 후 3시간 뒤 랩을 제거하고 미온수로 가볍게 세척해 주세요. 첫 2주간은 사우나·수영·과도한 음주를 피하고, 처방된 연고를 하루 2회 얇게 바릅니다. 각질이 생기면 억지로 떼지 마세요.'),
  ('ko', 'instagramUrl', 'https://instagram.com/'),
  ('ko', 'kakaoUrl', 'https://pf.kakao.com/'),
  ('ko', 'lineUrl', 'https://line.me/');

-- ── 예약금 정책 ─────────────────────────────────────
INSERT INTO `deposit_policy_tb`
  (`id`, `flash_amount`, `custom_amount`, `bank_name`, `account_number`,
   `holder_name`, `paypal_url`, `expire_after_days`) VALUES
  (1, 50000, 100000, '카카오뱅크', '3333-01-2345678', '김타투', 'https://paypal.me/', 3);

-- ── 계산기 ──────────────────────────────────────────
INSERT INTO `calculator_item_tb` (`id`, `name`, `display_order`) VALUES
  (1, '크기', 0),
  (2, '색상', 1),
  (3, '부위', 2);

INSERT INTO `calculator_option_tb` (`id`, `item_id`, `label`, `amount`, `display_order`) VALUES
  (11, 1, '3cm 이하', 0, 0),
  (12, 1, '3~5cm', 30000, 1),
  (13, 1, '5~8cm', 70000, 2),
  (21, 2, '블랙 단색', 0, 0),
  (22, 2, '블랙 + 1색', 20000, 1),
  (23, 2, '풀컬러', 50000, 2),
  (31, 3, '팔·다리', 0, 0),
  (32, 3, '손·발·목', 20000, 1),
  (33, 3, '갈비·등', 30000, 2);

-- baseAmount(50000원)와 disclaimer는 site_content_tb에 둡니다.
INSERT INTO `site_content_tb` (`locale`, `content_key`, `content_value`) VALUES
  ('ko', 'calculatorBaseAmount', '50000'),
  ('ko', 'calculatorDisclaimer', '계산 결과는 참고용 예상 금액입니다. 실제 금액은 도안 복잡도와 부위에 따라 상담 후 확정됩니다.');

-- ── 커스텀 예약 선택지 ──────────────────────────────
INSERT INTO `custom_option_tb` (`id`, `option_group`, `value`, `description`, `display_order`) VALUES
  (1, 'genre', '라인워크', NULL, 0),
  (2, 'genre', '미니멀', NULL, 1),
  (3, 'genre', '블랙워크', NULL, 2),
  (4, 'genre', '동양화', NULL, 3),
  (5, 'genre', '이레주미', NULL, 4),
  (6, 'genre', '지오메트릭', NULL, 5),
  (7, 'genre', '점묘', NULL, 6),
  (8, 'genre', '레터링', NULL, 7),
  (9, 'genre', '컬러', NULL, 8),
  (10, 'genre', '수채화', NULL, 9),
  (11, 'bodyPart', '팔 안쪽', NULL, 0),
  (12, 'bodyPart', '팔 바깥쪽', NULL, 1),
  (13, 'bodyPart', '손목', NULL, 2),
  (14, 'bodyPart', '어깨', NULL, 3),
  (15, 'bodyPart', '등', NULL, 4),
  (16, 'bodyPart', '허벅지', NULL, 5),
  (17, 'bodyPart', '발목', NULL, 6),
  (18, 'bodyPart', '갈비', NULL, 7),
  (19, 'bodyPart', '목·귀 뒤', NULL, 8),
  (20, 'size', '5cm 이하', '동전 크기 정도', 0),
  (21, 'size', '5~10cm', '손바닥 절반 정도', 1),
  (22, 'size', '10~20cm', '손바닥 전체 정도', 2),
  (23, 'size', '20cm 이상', '반나절 이상 소요', 3),
  (24, 'gender', '여성', NULL, 0),
  (25, 'gender', '남성', NULL, 1),
  (26, 'gender', '선택하지 않음', NULL, 2),
  (27, 'age', '10대', NULL, 0),
  (28, 'age', '20대', NULL, 1),
  (29, 'age', '30대', NULL, 2),
  (30, 'age', '40대 이상', NULL, 3);

-- ── 영업 일정 (휴무) ────────────────────────────────
-- 8월 광복절 연휴 휴무 (NOTICES의 공지와 같은 기간)
INSERT INTO `shop_schedule_tb` (`artist_id`, `closed_date`, `reason`) VALUES
  (NULL, '2026-08-15', '광복절 연휴 휴무'),
  (NULL, '2026-08-16', '광복절 연휴 휴무'),
  (NULL, '2026-08-17', '광복절 연휴 휴무'),
  (NULL, '2026-08-18', '광복절 연휴 휴무');

-- 월요일 정기 휴무는 날짜가 아니라 요일 규칙이라 이 테이블에 넣지 않습니다.
-- 백엔드의 예약 가능 날짜 계산에서 DAYOFWEEK(date) = 2를 제외하세요.
