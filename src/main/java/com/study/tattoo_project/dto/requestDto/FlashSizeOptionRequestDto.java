package com.study.tattoo_project.dto.requestDto;

import com.study.tattoo_project.entity.FlashSizeOption;
import lombok.Data;

@Data
public class FlashSizeOptionRequestDto {
    private Long flashDesignId;
    private String sizeLabel;
    private Integer price;
    private String durationEstimate;
    private Integer sortOrder;

    public FlashSizeOption toEntity() {
        FlashSizeOption option = new FlashSizeOption();
        option.setFlashDesignId(this.flashDesignId);
        option.setSizeLabel(this.sizeLabel);
        option.setPrice(this.price);
        option.setDurationEstimate(this.durationEstimate);
        option.setSortOrder(this.sortOrder);
        return option;
    }

    public FlashSizeOption toEntity(Long id) {
        FlashSizeOption option = toEntity();
        option.setId(id);
        return option;
    }
}
