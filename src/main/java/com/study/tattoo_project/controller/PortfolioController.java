package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.requestDto.PortfolioRequestDto;
import com.study.tattoo_project.dto.responseDto.ApiResponse;
import com.study.tattoo_project.dto.responseDto.PortfolioResponseDto;
import com.study.tattoo_project.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/portfolios")
public class PortfolioController {
    private final PortfolioService portfolioService;

//    전체보기 부위,스타일
    @GetMapping
    public ApiResponse<List<PortfolioResponseDto>> findAll(
            @RequestParam(required = false) Long styleId,
            @RequestParam(required = false) Long bodyPartId){
        return ApiResponse.success(portfolioService.findAll(styleId,bodyPartId));
    }

//    상세조회
    @GetMapping("{id}")
    public ApiResponse<PortfolioResponseDto> findById(@PathVariable Long id){
        return ApiResponse.success(portfolioService.findById(id));
    }

//    아티스트로 조회
    @GetMapping("/artists/{artistId}")
    public ApiResponse<List<PortfolioResponseDto>> findByArtistId(@PathVariable Long artistId){
//       request 로 받아야하는지 ?
        return ApiResponse.success(portfolioService.findByArtistId(artistId));
    }

//    등록
    @PostMapping
    public ApiResponse<Void> save(@RequestBody PortfolioRequestDto dto){
        portfolioService.save(dto);
        return ApiResponse.success();
    }

//    수정
    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody PortfolioRequestDto dto){
        portfolioService.update(id,dto);
        return ApiResponse.success();
    }

//    비할서오하
    @PutMapping("/{id}/deactivate")
    public ApiResponse<Void> deactivate(@PathVariable Long id){
        portfolioService.deactivate(id);
        return ApiResponse.success();
    }
}
