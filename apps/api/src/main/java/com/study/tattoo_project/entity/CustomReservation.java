package com.study.tattoo_project.entity;


import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomReservation {
    Long id;
    Long userId;
    String contactChannelUrl;
    String tattooGenre;
    String bodyPart;
    String tattooSize;
    String preferredDate;
    String funnel;
    String gender;
    String age;
    LocalDateTime requestedAt;
    int status;
    Long artistId;
}
