package com.study.tattoo_project.mapper;

import com.study.tattoo_project.entity.FlashDesign;
import com.study.tattoo_project.entity.Portfolio;
import com.study.tattoo_project.entity.Style;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PortfolioMapper {

//   전체갤러리, 스타일, 부위별 조회
    List<Portfolio> findAll(@Param("styleId") Long styleIdId,
                            @Param("bodyPartId") Long bodyPartId);

//  상세조회
    Portfolio findById(Long id);


//    특정 아티스트 포트폴리오 조회
    Portfolio findByArtistId(Long artistId);

//    등록
    void save(Portfolio portfolio);

//    수정
    void update(Portfolio portfolio);

//    비활성화
    void deactivate(Long id);
//    아티스트 비활성화시 비활성화
    void deactivateByArtistId(Long artistId);

//    등록/수정후 스타일 저장
    void insertStyles(@Param("artistId") Long artistId,
                      @Param("styleIds") List<Long> styleIds);

//    수정전 기존 스타일 전체 삭제
    void deleteStyles(Long artistId);
//    상세 조회떄  장르 출력
    List<Style> findStyleByArtistId(Long artistId);

}
