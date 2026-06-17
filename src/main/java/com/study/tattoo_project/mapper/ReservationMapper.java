package com.study.tattoo_project.mapper;


import com.study.tattoo_project.entity.Reservation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ReservationMapper {
//  등록
    int insert(Reservation reservation);
//예약번호 조회
    Optional<Reservation> findByReservationNo(String reservationNo);
// 상세조회
    Optional<Reservation> findById(Long id);
// 목록조회
    List<Reservation> findAll(); // 필터 조건은 Day4에서 추가
// 상태 변경 수정
    int updateStatus(@Param("id") Long id, @Param("status") Reservation.ReservationStatus status);
// 중복 확인
    boolean existsByReservationNo(String reservationNo);

}
