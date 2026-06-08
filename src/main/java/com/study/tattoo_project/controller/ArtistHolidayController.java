package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.requestDto.ArtistHolidayRequestDto;
import com.study.tattoo_project.dto.responseDto.ApiResponse;
import com.study.tattoo_project.dto.responseDto.ArtistHolidayResponseDto;
import com.study.tattoo_project.service.ArtistHolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ArtistHolidayController {

    private final ArtistHolidayService artistHolidayService;

//    조회
    @GetMapping("/admin/artists/{artistId}/holidays")
    public ApiResponse<List<ArtistHolidayResponseDto>> findByArtistId(@PathVariable Long artistId){
        return ApiResponse.success(artistHolidayService.findByArtistId(artistId));
    }

//    등록
    @PostMapping("/admin/artists/{artistId}/holidays")
    public ApiResponse<Void> save(@PathVariable Long artistId, @RequestBody ArtistHolidayRequestDto dto){
       artistHolidayService.save(artistId,dto);
        return ApiResponse.success();
    }

//    수정
    @PutMapping("/admin/holidays/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody ArtistHolidayRequestDto dto){
        artistHolidayService.update(id,dto);
        return ApiResponse.success();
    }

//    삭제
    @DeleteMapping("/admin/holidays/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id){
        artistHolidayService.delete(id);
        return ApiResponse.success();
    }

//    가용성 캘린다
    @GetMapping("/calendar")
    public ApiResponse<List<ArtistHolidayResponseDto>> findActiveArtistHolidays(){
        return ApiResponse.success(artistHolidayService.findActiveArtistHolidays());
    }

//    타투샵 전체 휴무
    @PostMapping("/admin/holidays/bulk")
    public ApiResponse<Void> insertBulk(@RequestBody ArtistHolidayRequestDto dto){
        artistHolidayService.insertBulk(dto);
        return ApiResponse.success();
    }

}
