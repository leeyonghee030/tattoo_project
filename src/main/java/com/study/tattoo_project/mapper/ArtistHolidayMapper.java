package com.study.tattoo_project.mapper;


import com.study.tattoo_project.entity.ArtistHoliday;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ArtistHolidayMapper {
//    아티스트  CRUD

//    조회
    List<ArtistHoliday> findByArtistId(Long artistId);
//    등록(매주 어떤요일, 특정 날짜
    int save(ArtistHoliday artistHoliday);
//    수정
    int update(ArtistHoliday artistHoliday);
//    삭제
    int delete(Long id);
//    관리자 CRUD

//가용성 캘린더용 아티스트 휴무보기
    List<ArtistHoliday> findActiveArtistHolidays();
//    전체 휴무 일관 등록
    int insertBulk(List<ArtistHoliday> holidays);
}
