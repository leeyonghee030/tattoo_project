package com.study.tattoo_project.mapper;


import com.study.tattoo_project.entity.FlashSizeOption;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FlashSizeOptionMapper {
    //등록
    void save(FlashSizeOption flashSizeOption);
    //수정
    void update(FlashSizeOption flashSizeOption);
    //삭제
    void delete(Long id);
}
