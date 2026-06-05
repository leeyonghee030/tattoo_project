package com.study.tattoo_project.dto.responseDto;

import com.study.tattoo_project.entity.Style;
import lombok.Data;

@Data
public class StyleResponseDto {
    private Long id;
    private String name;
    private Integer sortOrder;

    public static StyleResponseDto from(Style style) {
        StyleResponseDto dto = new StyleResponseDto();
        dto.setId(style.getId());
        dto.setName(style.getName());
        dto.setSortOrder(style.getSortOrder());
        return dto;
    }
}
