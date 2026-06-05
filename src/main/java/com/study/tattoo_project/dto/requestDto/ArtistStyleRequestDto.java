package com.study.tattoo_project.dto.requestDto;

import lombok.Data;

import java.util.List;

@Data
public class ArtistStyleRequestDto {
    private List<Long> styleIds;
}
