package com.study.tattoo_project.service;

import com.study.tattoo_project.dto.requestDto.FlashDesignRequestDto;
import com.study.tattoo_project.dto.responseDto.FlashDesignResponseDto;
import com.study.tattoo_project.entity.FlashDesign;
import com.study.tattoo_project.entity.Style;
import com.study.tattoo_project.mapper.FlashDesignMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FlashDesignService {

    private final FlashDesignMapper flashDesignMapper;

    public List<FlashDesignResponseDto> findAll(Long artistId, Long styleId) {
        return flashDesignMapper.findAll(artistId, styleId).stream()
                .map(FlashDesignResponseDto::from).toList();
    }

    public FlashDesignResponseDto findById(Long id) {
        FlashDesign flashDesign =flashDesignMapper.findById(id);
        //스타일 도 같이 출력
        List<Style> styles = findStyleByFlashDesignId(id);
        return FlashDesignResponseDto.from(flashDesign,styles);
    }

    public void save(FlashDesignRequestDto dto) {
        FlashDesign flashDesign = dto.toEntity();
        flashDesignMapper.save(flashDesign);
        flashDesignMapper.insertStyles(flashDesign.getId(), dto.getStyleIds());
    }

    public void update(Long id, FlashDesignRequestDto dto) {
        flashDesignMapper.update(dto.toEntity(id));
        flashDesignMapper.deleteStyles(id);
        flashDesignMapper.insertStyles(id, dto.getStyleIds());
    }

    public void deactivate(Long id) {
        flashDesignMapper.deactivate(id);
    }

    public  void  deactivateByArtistId(Long artistId){
        flashDesignMapper.deactivateByArtistId(artistId);
    }

    public List<Style> findStyleByFlashDesignId(Long flashDesignId){
        return flashDesignMapper.findStyleByFlashDesignId(flashDesignId);
    }
}
