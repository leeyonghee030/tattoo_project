package com.study.tattoo_project.entity;


import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ArtistHoliday {

    private Long id;
    private Long artistId;
    private HolidayType holidayType;
    private Integer dayOfWeek;
    private LocalDate holidayDate;
    private String reason;
    private LocalDateTime createdAt;

    public enum HolidayType {
        FIXED, VARIABLE
    }
}
