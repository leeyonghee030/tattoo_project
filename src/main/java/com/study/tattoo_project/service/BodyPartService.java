package com.study.tattoo_project.service;

import com.study.tattoo_project.dto.requestDto.BodyPartRequestDto;
import com.study.tattoo_project.dto.responseDto.BodyPartResponseDto;
import com.study.tattoo_project.entity.BodyPart;
import com.study.tattoo_project.mapper.BodyPartMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BodyPartService {
    private final BodyPartMapper bodyPartMapper;


    //조회
    public List<BodyPartResponseDto> findAll(){
        return bodyPartMapper.findAll().stream().map(BodyPartResponseDto::from).toList();
    }

    //등록
    public void save(BodyPartRequestDto requestDto){
        BodyPart bodyPart = requestDto.toEntity();
         bodyPartMapper.save(bodyPart);
    }

    //수정
    public void update(Long id, BodyPartRequestDto requestDto){
        BodyPart bodyPart = requestDto.toEntity(id);
        bodyPartMapper.update(bodyPart);
    }

    //삭제
    public void delete(Long id){
        bodyPartMapper.delete(id);
    }




}
