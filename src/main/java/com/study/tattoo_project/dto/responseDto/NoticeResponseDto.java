package com.study.tattoo_project.dto.responseDto;


import com.study.tattoo_project.entity.Notice;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class NoticeResponseDto {
    private Long id;
    private Long authorId;
    private String title;
    private String content;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> imageUrls;

    public static NoticeResponseDto from(Notice notice) {
        NoticeResponseDto dto = new NoticeResponseDto();
        dto.setId(notice.getId());
        dto.setAuthorId(notice.getAuthorId());
        dto.setTitle(notice.getTitle());
        dto.setContent(notice.getContent());
        dto.setIsActive(notice.getIsActive());
        dto.setCreatedAt(notice.getCreatedAt());
        dto.setUpdatedAt(notice.getUpdatedAt());
        return dto;
    }

    public static NoticeResponseDto from(Notice notice, List<String> imageUrls) {
        NoticeResponseDto dto = from(notice);
        dto.setImageUrls(imageUrls);
        return dto;
    }
}
