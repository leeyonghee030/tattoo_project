package com.study.tattoo_project.dto.requestDto;

import com.study.tattoo_project.entity.FlashDesign;
import lombok.Data;

import java.util.List;

@Data
public class FlashDesignRequestDto {
    private Long artistId;
    private String title;
    private String description;
    private String imageUrl;
    private List<Long> styleIds;

    public FlashDesign toEntity() {
        FlashDesign flashDesign = new FlashDesign();
        flashDesign.setArtistId(this.artistId);
        flashDesign.setTitle(this.title);
        flashDesign.setDescription(this.description);
        flashDesign.setImageUrl(this.imageUrl);
        return flashDesign;
    }

    public FlashDesign toEntity(Long id) {
        FlashDesign flashDesign = toEntity();
        flashDesign.setId(id);
        return flashDesign;
    }
}
