package com.study.tattoo_project.dto.requestDto;

import lombok.Data;

import java.util.List;

@Data
public class FlashDesignRequestDto {
    private Long artistId;
    private String title;
    private String description;
    private String imageUrl;
    private List<Long> styleIds;
}
