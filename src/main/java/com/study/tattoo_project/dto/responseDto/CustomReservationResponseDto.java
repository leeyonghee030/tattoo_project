package com.study.tattoo_project.dto.responseDto;

import com.study.tattoo_project.entity.BodyPart;
import com.study.tattoo_project.entity.Reservation;
import com.study.tattoo_project.entity.Style;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
public class CustomReservationResponseDto {
        private String reservationNo;
        private Reservation.ReservationType type;
        private Reservation.ReservationStatus status;
        private String artistName;

        private String styleName;      // styleId → styleName
        private String bodyPartName;
        private String customSize;
        private Boolean isCoverup;
        private String ageGroup;
        private String gender;
        private LocalDate preferredDate1;
        private LocalDate preferredDate2;
        private LocalDate preferredDate3;

        private LocalDateTime createdAt;

    public static CustomReservationResponseDto of(Reservation reservation, Style style, BodyPart bodyPart) {
        CustomReservationResponseDto dto = new CustomReservationResponseDto();
        dto.setReservationNo(reservation.getReservationNo());
        dto.setType(reservation.getType());
        dto.setStatus(reservation.getStatus());
        dto.setArtistName(reservation.getArtistNameSnapshot());
        dto.setStyleName(style != null ? style.getName() : null);
        dto.setBodyPartName(bodyPart != null ? bodyPart.getName() : null);
        dto.setCustomSize(reservation.getCustomSize());
        dto.setIsCoverup(reservation.getIsCoverup());
        dto.setAgeGroup(reservation.getAgeGroup());
        dto.setGender(reservation.getGender());
        dto.setPreferredDate1(reservation.getPreferredDate1());
        dto.setPreferredDate2(reservation.getPreferredDate2());
        dto.setPreferredDate3(reservation.getPreferredDate3());
        dto.setCreatedAt(reservation.getCreatedAt());
        return dto;
    }
}
