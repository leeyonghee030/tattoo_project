package com.study.tattoo_project.dto.responseDto;

import com.study.tattoo_project.entity.BodyPart;
import com.study.tattoo_project.entity.FlashDesign;
import com.study.tattoo_project.entity.FlashSizeOption;
import com.study.tattoo_project.entity.Reservation;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FlashReservationResponseDto {
    private String reservationNo;
    private Reservation.ReservationType type;
    private Reservation.ReservationStatus status;
    private String artistName;

    private String flashDesignTitle;
    private String flashDesignImageUrl;
    private String sizeLabel;
    private Integer price;
    private String bodyPartName;

    private LocalDate preferredDate;
    private LocalDateTime createdAt;

    public static FlashReservationResponseDto from(Reservation reservation,
                                                 FlashDesign flashDesign,
                                                 FlashSizeOption sizeOption,
                                                 BodyPart bodyPart) {
        FlashReservationResponseDto dto = new FlashReservationResponseDto();
        dto.setReservationNo(reservation.getReservationNo());
        dto.setType(reservation.getType());
        dto.setStatus(reservation.getStatus());
        dto.setArtistName(reservation.getArtistNameSnapshot());
        dto.setFlashDesignTitle(flashDesign.getTitle());
        dto.setFlashDesignImageUrl(flashDesign.getImageUrl());
        dto.setSizeLabel(sizeOption.getSizeLabel());
        dto.setPrice(sizeOption.getPrice());
        dto.setBodyPartName(bodyPart.getName());
        dto.setPreferredDate(reservation.getPreferredDate());
        dto.setCreatedAt(reservation.getCreatedAt());
        return dto;


    }
}