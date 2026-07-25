package com.study.tattoo_project.entity;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TokenBlacklist {
    Long id;
    String token;
    LocalDateTime expiresAt;
    LocalDateTime createdAt;
}
