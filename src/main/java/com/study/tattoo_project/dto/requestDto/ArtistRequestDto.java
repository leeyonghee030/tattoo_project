package com.study.tattoo_project.dto.requestDto;

import lombok.Data;

@Data
public class ArtistRequestDto {
    private Long userId;
    private String name;
    private String bio;
    private String profileImage;
    private String instagram;
    private String slackWebhookUrl;
    private String googleCalendarId;
}
