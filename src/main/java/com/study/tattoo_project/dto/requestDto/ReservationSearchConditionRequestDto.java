package com.study.tattoo_project.dto.requestDto;


import com.study.tattoo_project.entity.Reservation;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservationSearchConditionRequestDto {
    private Reservation.ReservationStatus status;
    private Long artistId;
    private LocalDate startDate;
    private LocalDate endDate;
}
