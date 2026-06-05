package com.study.tattoo_project.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Portfolio {
    private Long id;
    private Long artistId;
    private String imageUrl;
    private String title;
    private Long bodyPartId;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
