package com.study.tattoo_project.dto.requestDto;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CustomReservationRequestDto {
    @NotNull
    private Long artistId;
    private Long styleId;        // 선택
    private Long bodyPartId;     // 선택
    @NotNull
    private String customSize;
    @NotNull
    private Boolean isCoverup;
    @NotNull
    private String ageGroup;
    @NotNull
    private String gender;
    @NotNull
    private LocalDate preferredDate1;
    private LocalDate preferredDate2;  // 선택
    private LocalDate preferredDate3;  // 선택
}
