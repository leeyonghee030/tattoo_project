package com.study.tattoo_project.entity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Artist {
    Long id;
    String email;
    Boolean isVerified;
    String passwordHash;
    String artistName;
    String introduce;
    String artistImageUrl;
    String instagramFormUrl;
    String kakaoFormUrl;
    String lineFormUrl;
    String wattsFormUrl;
}
