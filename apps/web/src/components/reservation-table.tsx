import type { Reservation } from '@tattoo/api-client';
import { EmptyState, Table, TableWrap, Tbody, Td, Th, Thead, Tr } from '@tattoo/ui';
import { Inbox } from 'lucide-react';

import { ReservationStatusBadge } from './reservation-status-badge';

/* ---------------------------------------------------------------------------
 * 예약 목록 테이블 (관리자 · 아티스트 공용).
 *
 * 열 순서는 운영자가 실제로 스캔하는 순서를 따랐다.
 *   상태 → 예약번호 → 종류 → 아티스트 → 희망일시 → 이메일 → 접수일
 *
 * 상태를 맨 앞에 둔 이유: 관리자가 이 화면을 여는 목적은 대부분 "지금 처리할 게
 * 무엇인지" 찾는 것이다. 예약번호가 먼저 오면 상태를 찾으려고 눈이 오른쪽으로
 * 이동해야 한다.
 * ------------------------------------------------------------------------- */

export interface ReservationTableProps {
  reservations: Reservation[];
  /** 아티스트 화면에서는 아티스트 열이 항상 자기 이름이라 의미가 없다. */
  hideArtist?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ReservationTable({
  reservations,
  hideArtist = false,
  emptyTitle = '예약이 없습니다',
  emptyDescription = '조건을 바꿔 다시 검색해 보세요.',
}: ReservationTableProps) {
  if (reservations.length === 0) {
    return (
      <EmptyState icon={<Inbox size={20} />} title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <TableWrap>
      <Table>
        <Thead>
          <Tr>
            <Th>상태</Th>
            <Th>예약번호</Th>
            <Th>종류</Th>
            {!hideArtist && <Th>아티스트</Th>}
            <Th>희망 일시</Th>
            <Th>이메일</Th>
            <Th>접수</Th>
          </Tr>
        </Thead>
        <Tbody>
          {reservations.map((reservation) => (
            <Tr key={reservation.id}>
              <Td>
                <ReservationStatusBadge status={reservation.status} size="sm" />
              </Td>
              <Td primary className="font-mono whitespace-nowrap">
                {reservation.reservationNumber}
              </Td>
              <Td className="whitespace-nowrap">
                {reservation.type === 'FLASH' ? '플래시' : '커스텀'}
              </Td>
              {!hideArtist && (
                <Td className="max-w-40 truncate">
                  {reservation.artistName ?? <span className="text-fg-subtle">미배정</span>}
                </Td>
              )}
              <Td className="whitespace-nowrap">
                {reservation.preferredDate ? (
                  <>
                    {reservation.preferredDate}
                    {reservation.type === 'FLASH' && (
                      <span className="text-fg-subtle ml-1.5">{reservation.preferredTime}</span>
                    )}
                  </>
                ) : (
                  <span className="text-fg-subtle">미정</span>
                )}
              </Td>
              <Td className="max-w-52 truncate">{reservation.email}</Td>
              <Td className="text-fg-subtle whitespace-nowrap">
                {/* ISO 문자열에서 날짜만 잘라 쓴다. 표에서는 시각까지 필요 없고,
                    new Date로 파싱하면 서버/클라이언트 타임존 차이로 값이 흔들린다. */}
                {reservation.requestedAt.slice(0, 10)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableWrap>
  );
}
