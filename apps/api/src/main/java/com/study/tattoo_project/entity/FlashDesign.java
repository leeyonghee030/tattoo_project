package com.study.tattoo_project.entity;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FlashDesign {
    Long id;
    Long artistId;
    String imageUrl;
    int estimatedTime;
    String price;
}
