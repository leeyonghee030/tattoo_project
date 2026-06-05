package com.study.tattoo_project.service;

import com.study.tattoo_project.dto.requestDto.ArtistStyleRequestDto;
import com.study.tattoo_project.entity.Style;
import com.study.tattoo_project.mapper.ArtistStyleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtistStyleService {

    private final ArtistStyleMapper artistStyleMapper;

    //삭제+한번에 저장 스타일 선택기능
    public void updateStyle(Long artistId, ArtistStyleRequestDto dto) {
        //삭제 (원래있는값)
        artistStyleMapper.deleteByArtistId(artistId);
        //한번에 저장
        artistStyleMapper.save(artistId, dto.getStyleIds());
    }

    public List<Style> findStylesByArtistId(Long artistId){
        return artistStyleMapper.findStylesByArtistId(artistId);
    }
}
