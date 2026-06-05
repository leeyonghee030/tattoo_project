package com.study.tattoo_project.dto.responseDto;

import com.study.tattoo_project.entity.FlashDesign;
import com.study.tattoo_project.entity.Style;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data

public class FlashDesignResponseDto {
    private Long id;
    private Long artistId;
    private String title;
    private String description;
    private String imageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StyleResponseDto> styles;

    public static FlashDesignResponseDto from(FlashDesign flashDesign){
        FlashDesignResponseDto dto = new FlashDesignResponseDto();
        dto.setId(flashDesign.getId());
        dto.setArtistId(flashDesign.getArtistId());
        dto.setTitle(flashDesign.getTitle());
        dto.setDescription(flashDesign.getDescription());
        dto.setImageUrl(flashDesign.getImageUrl());
        dto.setIsActive(flashDesign.getIsActive());
        dto.setCreatedAt(flashDesign.getCreatedAt());
        dto.setUpdatedAt(flashDesign.getUpdatedAt());
        return dto;
    }

    public static FlashDesignResponseDto from(FlashDesign flashDesign, List<Style> styleList){
        FlashDesignResponseDto dto = from(flashDesign);
        dto.setStyles(styleList.stream().map(StyleResponseDto::from).toList());
        return dto;
    }
}
