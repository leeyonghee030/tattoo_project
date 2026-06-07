package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.responseDto.ApiResponse;
import com.study.tattoo_project.dto.responseDto.ImageUploadResponseDto;
import com.study.tattoo_project.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/upload")
public class ImageUploadController {

    private final ImageUploadService imageUploadService;

    @PostMapping("/image")
public ApiResponse<ImageUploadResponseDto> uploadImage(
        @RequestParam("image")MultipartFile file){
        if (file.isEmpty()){
            throw new IllegalArgumentException("파일이 없습니다.");
        }
        String imageUrl = imageUploadService.upload(file);
        return ApiResponse.success(new ImageUploadResponseDto(imageUrl));

    }

}
