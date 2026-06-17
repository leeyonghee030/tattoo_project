package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.responseDto.ApiResponse;
import com.study.tattoo_project.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping("/api/reservations/{reservationNo}")
    public ApiResponse<Object> findByReservationNo(@PathVariable String reservationNo){
        return ApiResponse.success(reservationService.findByReservationNo(reservationNo));
    }
}
