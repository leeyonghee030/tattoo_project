package com.study.tattoo_project.dto.requestDto;


import com.study.tattoo_project.entity.Portfolio;
import lombok.Data;

import java.util.List;

@Data
public class PortfolioRequestDto {
    private Long artistId;
    private String imageUrl;
    private String title;
    private Long bodyPartId;
    private String description;
    private List<Long> styleIds;


    public Portfolio toEntity(){
        Portfolio portfolio = new Portfolio();
        portfolio.setArtistId(this.getArtistId());
        portfolio.setImageUrl(this.getImageUrl());
        portfolio.setTitle(this.getTitle());
        portfolio.setBodyPartId(this.getBodyPartId());
        portfolio.setDescription(this.getDescription());
        return  portfolio;
    }

    public Portfolio toEntity(Long id){
        Portfolio portfolio = toEntity();
        portfolio.setId(id);
        return portfolio;
    }
}
