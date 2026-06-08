package com.study.tattoo_project.dto.responseDto;

import com.study.tattoo_project.entity.ArtistHoliday;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
public class ArtistHolidayResponseDto {

    private Long id;
    private String holidayType;
    private Integer dayOfWeek;
    private LocalDate holidayDate;
    private String reason;
    private LocalDateTime createdAt;

    public  static  ArtistHolidayResponseDto from(ArtistHoliday artistHoliday) {
        ArtistHolidayResponseDto dto = new ArtistHolidayResponseDto();
        dto.setId(artistHoliday.getId());
        dto.setHolidayType(artistHoliday.getHolidayType().name());
        dto.setDayOfWeek(artistHoliday.getDayOfWeek());
        dto.setHolidayDate(artistHoliday.getHolidayDate());
        dto.setReason(artistHoliday.getReason());
        dto.setCreatedAt(artistHoliday.getCreatedAt());
        return  dto;
    }
}
