package com.study.tattoo_project.entity;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class NoticeImage {
    private Long id;
    private Long noticeId;
    private String imageUrl;
    private int sortOrder;
}
