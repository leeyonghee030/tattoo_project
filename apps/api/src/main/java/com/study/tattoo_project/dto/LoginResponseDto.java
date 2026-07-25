package com.study.tattoo_project.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponseDto {
    private String token;

    public static LoginResponseDto From(String token){
        return LoginResponseDto.builder()
        .token(token)
        .build();
    }
}
