package com.study.tattoo_project.dto.requestDto;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ConfirmRequestDto {
    @NotNull
    private LocalDate confirmedDate;
}
