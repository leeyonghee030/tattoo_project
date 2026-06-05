package com.study.tattoo_project.mapper;

import com.study.tattoo_project.entity.FlashDesign;
import com.study.tattoo_project.entity.Style;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FlashDesignMapper {
// 전체조회 및 필터의 맞는 값 조회
    List<FlashDesign> findAll(@Param("artistId") Long artistId,
                              @Param("styleId") Long styleId);
// 상세조회
    FlashDesign findById(Long id);
// 등록
    void save(FlashDesign flashDesign);
// 플래시도안 스타일 등록
    void insertStyles(@Param("flashDesignId") Long flashDesignId,
                      @Param("styleIds") List<Long> styleIds);

    void update(FlashDesign flashDesign);
// 수정전 삭제
    void deleteStyles(Long flashDesignId);
// 비활성화
    void deactivate(Long id);
    // 아티스트 비활성화 할시 도안도 비활성화
    void deactivateByArtistId(Long artistId);
    //상세조회시 스타일 목록 가져오기
    List<Style> findStyleByFlashDesignId(Long flashDesignId);
}
