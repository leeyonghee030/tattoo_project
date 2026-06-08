package com.study.tattoo_project.dto.requestDto;


import com.study.tattoo_project.entity.ArtistHoliday;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ArtistHolidayRequestDto {
    private String holidayType;
    private Integer dayOfWeek;
    private LocalDate holidayDate;
    private String reason;

    public ArtistHoliday toEntity() {
        ArtistHoliday artistHoliday = new ArtistHoliday();
        artistHoliday.setHolidayType(ArtistHoliday.HolidayType.valueOf(this.holidayType));
        artistHoliday.setDayOfWeek(this.dayOfWeek);
        artistHoliday.setHolidayDate(this.holidayDate);
        artistHoliday.setReason(this.reason);
        return artistHoliday;
    }

    public ArtistHoliday toEntity(Long artistId) {
        ArtistHoliday artistHoliday = toEntity();
        artistHoliday.setArtistId(artistId);
        return artistHoliday;
    }
}
