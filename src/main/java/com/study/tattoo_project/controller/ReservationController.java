package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.requestDto.ConfirmRequestDto;
import com.study.tattoo_project.dto.requestDto.ReservationSearchConditionRequestDto;
import com.study.tattoo_project.dto.responseDto.ApiResponse;
import com.study.tattoo_project.entity.Reservation;
import com.study.tattoo_project.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping("/api/reservations/{reservationNo}")
    public ApiResponse<Object> findByReservationNo(@PathVariable String reservationNo){
        return ApiResponse.success(reservationService.findByReservationNo(reservationNo));
    }
// 목록필터 조회
    @GetMapping("/api/admin/reservations")
    public ApiResponse<List<Reservation>> findAll(@ModelAttribute ReservationSearchConditionRequestDto dto){
        return ApiResponse.success(reservationService.findAll(dto));
    }
//상세 조회
    @GetMapping("/api/admin/reservation/{id}")
    public ApiResponse<Reservation> findById(@PathVariable Long id){
        return  ApiResponse.success(reservationService.findById(id));
    }
//    확정
    @PutMapping("/api/admin/reservations/{id}/confirm")
    public ApiResponse<Void> confirm(@PathVariable Long id, @RequestBody ConfirmRequestDto dto){
          reservationService.confirm(id,dto);
          return ApiResponse.success(null);
    }
//    완료
    @PutMapping("/api/admin/reservations/{id}/complete")
    public ApiResponse<Void> complete(@PathVariable Long id){
        reservationService.complete(id);
        return ApiResponse.success(null);
    }
//    취소
    @PutMapping("/api/admin/reservations/{id}/channel")
    public ApiResponse<Void> cancel(@PathVariable Long id){
        reservationService.cancel(id);
        return  ApiResponse.success(null);
    }
}
