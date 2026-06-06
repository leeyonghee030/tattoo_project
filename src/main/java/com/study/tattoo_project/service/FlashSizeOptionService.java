package com.study.tattoo_project.service;


import com.study.tattoo_project.dto.requestDto.FlashSizeOptionRequestDto;
import com.study.tattoo_project.mapper.FlashSizeOptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FlashSizeOptionService {
    private final FlashSizeOptionMapper flashSizeOptionMapper;

    //등록
    public void save(FlashSizeOptionRequestDto dto){
        flashSizeOptionMapper.save(dto.toEntity());
    }

    //수정
    public void update(Long id, FlashSizeOptionRequestDto dto){
        flashSizeOptionMapper.update(dto.toEntity(id));
    }

    //삭제
    public void delete(Long id){
        flashSizeOptionMapper.delete(id);
    }
}
