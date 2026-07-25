package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.requestDto.NoticeRequestDto;
import com.study.tattoo_project.dto.responseDto.ApiResponse;
import com.study.tattoo_project.dto.responseDto.NoticeResponseDto;
import com.study.tattoo_project.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    //    전체조회
    @GetMapping("/api/notices")
    public ApiResponse<List<NoticeResponseDto>> findAll() {
        return ApiResponse.success(noticeService.findAll());
    }

    //  상세조회+이미지
    @GetMapping("/api/notices/{id}")
    public ApiResponse<NoticeResponseDto> findById(@PathVariable Long id) {
        return ApiResponse.success(noticeService.findById(id));
    }

    //    등록
    @PostMapping("/api/admin/notices")
    public ApiResponse<Void> save(@RequestBody NoticeRequestDto dto) {
        noticeService.save(dto);
        return ApiResponse.success();
    }

//    수정
    @PutMapping("/api/admin/notices/{id}")
    public ApiResponse<Void> update(@PathVariable Long id,@RequestBody NoticeRequestDto dto){
        noticeService.update(id, dto);
        return ApiResponse.success();
    }

//    비활성화
    @PutMapping("/api/admin/notices/{id}/deactivate")
    public ApiResponse<Void> deactivate(@PathVariable Long id){
        noticeService.deactivate(id);
        return ApiResponse.success();
    }


}
