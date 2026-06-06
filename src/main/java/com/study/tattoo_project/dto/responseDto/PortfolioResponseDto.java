package com.study.tattoo_project.dto.responseDto;


import com.study.tattoo_project.entity.Portfolio;
import com.study.tattoo_project.entity.Style;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PortfolioResponseDto {
    private Long id;
    private Long artistId;
    private String imageUrl;
    private String title;
    private Long bodyPartId;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StyleResponseDto> styles;

    public static PortfolioResponseDto from(Portfolio portfolio) {
        PortfolioResponseDto dto = new PortfolioResponseDto();
        dto.setId(portfolio.getId());
        dto.setArtistId(portfolio.getArtistId());
        dto.setImageUrl(portfolio.getImageUrl());
        dto.setTitle(portfolio.getTitle());
        dto.setBodyPartId(portfolio.getBodyPartId());
        dto.setDescription(portfolio.getDescription());
        dto.setIsActive(portfolio.getIsActive());
        dto.setCreatedAt(portfolio.getCreatedAt());
        dto.setUpdatedAt(portfolio.getUpdatedAt());
        return dto;
    }

    public static PortfolioResponseDto from(Portfolio portfolio, List<Style> styles){
        PortfolioResponseDto dto = from(portfolio);
        dto.setStyles(styles.stream().map(StyleResponseDto::from).toList());
        return dto;
    }

}
