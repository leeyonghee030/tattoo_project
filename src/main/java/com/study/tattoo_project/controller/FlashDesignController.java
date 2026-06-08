package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.requestDto.FlashDesignRequestDto;
import com.study.tattoo_project.dto.responseDto.ApiResponse;
import com.study.tattoo_project.dto.responseDto.FlashDesignResponseDto;
import com.study.tattoo_project.service.FlashDesignService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/flash-designs")
public class FlashDesignController {

    private  final FlashDesignService flashDesignService;
    // 전체조회, 아티스트,장르목록조회
    @GetMapping
    public List<FlashDesignResponseDto> findAll(
            @RequestParam(required = false) Long artistId,
            @RequestParam(required = false) Long styleId) {
        return flashDesignService.findAll(artistId, styleId);
    }

    //디자인 상세조회
    @GetMapping("/{id}")
    public FlashDesignResponseDto findById(@PathVariable Long id){
        return flashDesignService.findById(id);
    }

    //등록
    @PostMapping
    public void save(@RequestBody FlashDesignRequestDto dto){
        flashDesignService.save(dto);
    }

    //수정
    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody FlashDesignRequestDto dto){
        flashDesignService.update(id,dto);
    }

    //비활성화
    @PatchMapping("/{id}/deactivate")
    public void deactivate(@PathVariable Long id){
        flashDesignService.deactivate(id);
    }





}