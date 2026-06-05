package com.study.tattoo_project.service;


import com.study.tattoo_project.dto.requestDto.FlashSizeOptionRequestDto;
import com.study.tattoo_project.entity.FlashSizeOption;
import com.study.tattoo_project.mapper.FlashSizeOptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FlashSizeOptionService {
    private final FlashSizeOptionMapper flashSizeOptionMapper;

    //등록
    public void save(FlashSizeOptionRequestDto dto){
        FlashSizeOption flashSizeOption = new FlashSizeOption();
        flashSizeOption.setFlashDesignId(dto.getFlashDesignId());
        flashSizeOption.setSizeLabel(dto.getSizeLabel());
        flashSizeOption.setPrice(dto.getPrice());
        flashSizeOption.setDurationEstimate(dto.getDurationEstimate());
        flashSizeOption.setSortOrder(dto.getSortOrder());
        flashSizeOptionMapper.save(flashSizeOption);
    }

    //수정
    public  void update(Long id, FlashSizeOptionRequestDto dto){
        FlashSizeOption flashSizeOption = new FlashSizeOption();
        flashSizeOption.setId(id);
        flashSizeOption.setFlashDesignId(dto.getFlashDesignId());
        flashSizeOption.setSizeLabel(dto.getSizeLabel());
        flashSizeOption.setPrice(dto.getPrice());
        flashSizeOption.setDurationEstimate(dto.getDurationEstimate());
        flashSizeOption.setSortOrder(dto.getSortOrder());
        flashSizeOptionMapper.update(flashSizeOption);
    }

    //삭제
    public void delete(Long id){
        flashSizeOptionMapper.delete(id);
    }
}
