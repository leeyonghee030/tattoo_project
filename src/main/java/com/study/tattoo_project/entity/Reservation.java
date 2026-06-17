package com.study.tattoo_project.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class Reservation {

    private Long id;
    private String reservationNo;
    private ReservationType type;
    private ReservationStatus status;

    private Long userId;
    private Long artistId;
    private String artistNameSnapshot;
    private Long bodyPartId;

    private LocalDate confirmedDate;
    private Boolean channelContacted;
    private Boolean slackNotified;
    private String googleCalendarEventId;
    private String adminMemo;

    // flash 전용
    private Long flashDesignId;
    private Long flashSizeOptionId;
    private LocalDate preferredDate;

    // custom 전용
    private Long styleId;
    private String customSize;
    private Boolean isCoverup;
    private String ageGroup;   // '10대','20대','30대','40대이상' - enum 불가, String 처리
    private String gender;     // '남성','여성','기타'
    private LocalDate preferredDate1;
    private LocalDate preferredDate2;
    private LocalDate preferredDate3;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum ReservationType {
        FLASH, CUSTOM
    }

    public enum ReservationStatus {
        PENDING, CONFIRMED, COMPLETED, CANCELLED
    }
}
