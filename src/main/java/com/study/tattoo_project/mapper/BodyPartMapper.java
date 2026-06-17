package com.study.tattoo_project.mapper;

import com.study.tattoo_project.entity.BodyPart;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BodyPartMapper {
    //전체조회
    List<BodyPart> findAll();
//
    BodyPart findById(Long id);
    //등록
    void save(BodyPart bodyPart);
    //수정
    void update(BodyPart bodyPart);
    //삭제
    void delete(Long id);
}
