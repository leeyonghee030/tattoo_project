package com.study.tattoo_project.dto.requestDto;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FlashReservationRequestDto {
    @NotNull
    private Long flashDesignId;
    @NotNull
    private Long flashSizeOptionId;
    @NotNull
    private Long bodyPartId;
    @NotNull
    private LocalDate preferredDate;
}
