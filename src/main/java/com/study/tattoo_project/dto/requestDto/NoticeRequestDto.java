package com.study.tattoo_project.dto.requestDto;

import com.study.tattoo_project.entity.Notice;
import lombok.Data;

import java.util.List;

@Data
public class NoticeRequestDto {
    private Long authorId;
    private String title;
    private String content;
    private List<String> imageUrls;

    public Notice toEntity(){
        Notice notice = new Notice();
        notice.setAuthorId(this.getAuthorId());
        notice.setTitle(this.getTitle());
        notice.setContent(this.getContent());
        return  notice;
    }
}

