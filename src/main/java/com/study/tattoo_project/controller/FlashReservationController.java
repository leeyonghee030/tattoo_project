package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.requestDto.FlashReservationRequestDto;
import com.study.tattoo_project.dto.responseDto.ApiResponse;
import com.study.tattoo_project.dto.responseDto.FlashReservationResponseDto;
import com.study.tattoo_project.service.FlashReservationService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class FlashReservationController {

    private final FlashReservationService flashReservationService;

    @PostMapping("/api/reservations/flash")
    public ApiResponse<FlashReservationResponseDto> reserveFlash(@RequestBody @Valid FlashReservationRequestDto requestDto){
        return ApiResponse.success(flashReservationService.reserve(requestDto));
    }
}
