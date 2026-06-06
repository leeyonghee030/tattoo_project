package com.study.tattoo_project.dto.requestDto;

import com.study.tattoo_project.entity.Artist;
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

    public Artist toEntity() {
        Artist artist = new Artist();
        artist.setUserId(this.userId);
        artist.setName(this.name);
        artist.setBio(this.bio);
        artist.setProfileImage(this.profileImage);
        artist.setInstagram(this.instagram);
        artist.setSlackWebhookUrl(this.slackWebhookUrl);
        artist.setGoogleCalendarId(this.googleCalendarId);
        return artist;
    }

    public Artist toEntity(Long id) {
        Artist artist = toEntity();
        artist.setId(id);
        return artist;
    }
}
