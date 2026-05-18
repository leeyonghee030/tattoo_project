package com.study.tattoo_project.entity;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FlashReservation {
    Long id;
    Long userId;
    Long flashDesignId;
    String contactChannelUrl;
    String preferredDate;
    LocalDateTime requestedAt;
    int status;
}
