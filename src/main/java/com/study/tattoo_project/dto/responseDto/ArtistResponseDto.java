package com.study.tattoo_project.dto.responseDto;

import com.study.tattoo_project.entity.Artist;
import com.study.tattoo_project.entity.Style;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArtistResponseDto {
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

    private List<StyleResponseDto> styles;

    // Entity → ResponseDto 변환 메서드
    public static ArtistResponseDto from(Artist artist) {
        ArtistResponseDto dto = new ArtistResponseDto();
        dto.setId(artist.getId());
        dto.setUserId(artist.getUserId());
        dto.setName(artist.getName());
        dto.setBio(artist.getBio());
        dto.setProfileImage(artist.getProfileImage());
        dto.setInstagram(artist.getInstagram());
        dto.setSlackWebhookUrl(artist.getSlackWebhookUrl());
        dto.setGoogleCalendarId(artist.getGoogleCalendarId());
        dto.setIsActive(artist.getIsActive());
        dto.setDeactivatedAt(artist.getDeactivatedAt());
        dto.setCreatedAt(artist.getCreatedAt());
        dto.setUpdatedAt(artist.getUpdatedAt());
        return dto;
    }
    public static ArtistResponseDto from(Artist artist, List<Style> styleList){
        ArtistResponseDto dto = from(artist);
        dto.setStyles(styleList.stream().map(StyleResponseDto::from).toList());
        return dto;
    }
}