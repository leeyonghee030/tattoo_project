package com.study.tattoo_project.service;


import com.study.tattoo_project.dto.requestDto.ArtistHolidayRequestDto;
import com.study.tattoo_project.dto.responseDto.ArtistHolidayResponseDto;
import com.study.tattoo_project.dto.responseDto.ArtistResponseDto;
import com.study.tattoo_project.entity.ArtistHoliday;
import com.study.tattoo_project.mapper.ArtistHolidayMapper;
import com.study.tattoo_project.mapper.ArtistMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtistHolidayService {

    private final ArtistHolidayMapper artistHolidayMapper;
    private final ArtistMapper artistMapper;

//    조회
    public List<ArtistHolidayResponseDto> findByArtistId(Long artistId){
        return artistHolidayMapper.findByArtistId(artistId).stream()
                .map(ArtistHolidayResponseDto::from).toList();
    }
//    등록
    public void save(Long artistId, ArtistHolidayRequestDto dto){
       int result = artistHolidayMapper.save(dto.toEntity(artistId));
       if (result == 0){
           throw new RuntimeException("등록 실패");
       }
    }

//    수정
    public void update(Long id, ArtistHolidayRequestDto dto){
        ArtistHoliday artistHoliday = dto.toEntity();
        artistHoliday.setId(id);
        int result =artistHolidayMapper.update(artistHoliday);
        if (result == 0){
            throw new RuntimeException("수정 실패");
        }
    }

//    삭제
    public void delete(Long id){
        int result = artistHolidayMapper.delete(id);
        if (result == 0){
            throw new RuntimeException("삭제 실패");
        }
    }

//    가용성 캘린더
    public List<ArtistHolidayResponseDto> findActiveArtistHolidays(){
        return artistHolidayMapper.findActiveArtistHolidays().stream()
                .map(ArtistHolidayResponseDto::from).toList();
    }
//    타투샵 전체 휴무
    public void insertBulk(ArtistHolidayRequestDto dto){
        List<ArtistHoliday> holidays = artistMapper.findAll().stream()
                .map(a -> dto.toEntity(a.getId())).toList();
        if (holidays.isEmpty()) {
            throw new RuntimeException("활성 아티스트 없음");
        }
       int result = artistHolidayMapper.insertBulk(holidays);
       if(result == 0){
           throw new RuntimeException("전체 휴무 설정 실패");
       }
    }
}
