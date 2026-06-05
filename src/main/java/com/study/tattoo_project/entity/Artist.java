package com.study.tattoo_project.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class Artist {
    private Long id;
    private Long userId;
    private String name;
    private String bio;
    private String profileImage;
    private String instagram;
    private String slackWebhookUrl;
    private String googleCalendarId;
    private Boolean isActive;
    private LocalDateTime deactivatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}
