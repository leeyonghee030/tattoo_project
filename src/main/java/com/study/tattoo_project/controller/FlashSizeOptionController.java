package com.study.tattoo_project.controller;



import com.study.tattoo_project.dto.requestDto.FlashDesignRequestDto;
import com.study.tattoo_project.dto.requestDto.FlashSizeOptionRequestDto;
import com.study.tattoo_project.dto.responseDto.ApiResponse;
import com.study.tattoo_project.service.FlashDesignService;
import com.study.tattoo_project.service.FlashSizeOptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/flash-size-option")
public class FlashSizeOptionController {
    private final FlashSizeOptionService flashSizeOptionService;

//    등록
    @PostMapping
    public ApiResponse<Void> save(@RequestBody FlashSizeOptionRequestDto dto){
        flashSizeOptionService.save(dto);
        return ApiResponse.success();
    }

//    수정
    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody FlashSizeOptionRequestDto dto){
        flashSizeOptionService.update(id, dto);
        return ApiResponse.success();
    }

//삭제
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id){
        flashSizeOptionService.delete(id);
        return ApiResponse.success();
    }
}
