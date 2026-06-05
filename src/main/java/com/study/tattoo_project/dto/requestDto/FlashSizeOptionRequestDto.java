package com.study.tattoo_project.dto.requestDto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FlashSizeOptionRequestDto {
    private Long flashDesignId;
    private String sizeLabel;
    private Integer price;
    private String durationEstimate;
    private Integer sortOrder;
}
