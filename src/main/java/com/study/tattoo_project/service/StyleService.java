package com.study.tattoo_project.service;

import com.study.tattoo_project.dto.requestDto.StyleRequestDto;
import com.study.tattoo_project.dto.responseDto.StyleResponseDto;
import com.study.tattoo_project.entity.Style;
import com.study.tattoo_project.mapper.StyleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
//자바 객체 만들 때 꼭 필요한 변수들만 골라서 생성자를 자동으로 만들어줌
public class StyleService {
    private final StyleMapper styleMapper;

    //전체 조회
    public List<StyleResponseDto> findAll() {
        return styleMapper.findAll().stream()
                .map(StyleResponseDto::from).toList();
    }

    //등록
    public void save(StyleRequestDto request) {
        Style style = request.toEntity();
        styleMapper.save(style);
    }

    //수정
    public void update(Long id, StyleRequestDto requestDto) {
      Style style = requestDto.toEntity(id);
        styleMapper.update(style);
    }

    //삭제
    public void delete(Long id) {
        styleMapper.delete(id);
    }
}
