package com.study.tattoo_project.mapper;

import com.study.tattoo_project.entity.Style;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface StyleMapper {
//    전체조화
    List<Style> findAll();

    Style findById(Long id);
//    등록
    void save(Style style);
//    수정
    void update(Style style);
    //삭제
    void delete(Long id);
}
