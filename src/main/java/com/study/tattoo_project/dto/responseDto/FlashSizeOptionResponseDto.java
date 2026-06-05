package com.study.tattoo_project.dto.responseDto;

import com.study.tattoo_project.entity.FlashSizeOption;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FlashSizeOptionResponseDto {
    private Long id;
    private Long flashDesignId;
    private String sizeLabel;
    private Integer price;
    private String durationEstimate;
    private Integer sortOrder;
    private LocalDateTime updatedAt;

    public static FlashSizeOptionResponseDto from(FlashSizeOption flashSizeOption){
        FlashSizeOptionResponseDto dto = new FlashSizeOptionResponseDto();
        dto.setId(flashSizeOption.getId());
        dto.setFlashDesignId(flashSizeOption.getFlashDesignId());
        dto.setSizeLabel(flashSizeOption.getSizeLabel());
        dto.setPrice(flashSizeOption.getPrice());
        dto.setDurationEstimate(flashSizeOption.getDurationEstimate());
        dto.setSortOrder(flashSizeOption.getSortOrder());
        dto.setUpdatedAt(flashSizeOption.getUpdatedAt());
        return  dto;
    }
}
