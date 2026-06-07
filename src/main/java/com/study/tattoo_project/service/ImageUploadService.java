package com.study.tattoo_project.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class ImageUploadService {
    //어너테이션 + 이게먼지?
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.url-prefix}")
    private  String urlPrefix;

//    MultipartFile 이게 먼지
    public String upload(MultipartFile file){
//        확장자 추출?
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new IllegalArgumentException("유효하지 않은 파일명입니다.");
        }
        String ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
        if (!List.of(".jpg", ".jpeg", ".png", ".gif", ".webp").contains(ext)) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다. (jpg, jpeg, png, gif, webp)");
        }

//        파일명 겹치지 않게 uuid로 새 이름 생성
//         UUID 예시: "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
        String newFileName = UUID.randomUUID().toString() + ext;

//        저장할 폴더가 없으면 자동생성
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)){
            try {
                Files.createDirectories(uploadPath);
            } catch (IOException e){
                throw new RuntimeException("폴더 생성 실패");
            }
        }

//       파일 저장
    try {
        Path filePath = uploadPath.resolve(newFileName);
        file.transferTo(filePath.toFile());
    } catch (IOException e){
        throw new RuntimeException("파일 저장 실패");
    }

//    접근 url 반환
        return  urlPrefix + "/" + newFileName;

    }
}
