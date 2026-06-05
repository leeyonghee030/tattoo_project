package com.study.tattoo_project.entity;


import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class FlashSizeOption {
    private Long id;
    private Long flashDesignId;
    private String sizeLabel;
    private Integer price;
    private String durationEstimate;
    private Integer sortOrder;
    private LocalDateTime updatedAt;
}
