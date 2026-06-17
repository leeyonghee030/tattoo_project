package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.requestDto.CustomReservationRequestDto;
import com.study.tattoo_project.dto.responseDto.ApiResponse;
import com.study.tattoo_project.dto.responseDto.CustomReservationResponseDto;
import com.study.tattoo_project.service.CustomReservationService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CustomReservationController {

    private final CustomReservationService customReservationService;


    @PostMapping("/api/reservations/custom")
    public ApiResponse<CustomReservationResponseDto> reserveCustom(@RequestBody @Valid CustomReservationRequestDto dto){
        return ApiResponse.success(customReservationService.reserve(dto));
    }
}
