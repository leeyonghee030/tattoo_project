package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.LoginRequestDto;
import com.study.tattoo_project.dto.LoginResponseDto;
import com.study.tattoo_project.service.ArtistService;
import com.study.tattoo_project.service.LogoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/artist")
@RequiredArgsConstructor
public class ArtistController {
    private final ArtistService artistService;
    public  final LogoutService logoutService;

    @PostMapping("/login")
    public LoginResponseDto login(@RequestBody LoginRequestDto loginRequestDto){
        return artistService.login(loginRequestDto);
    }

    @PostMapping("/logout")
    // HTTP 응답 데이터 타입이 String이라는 뜻
    public ResponseEntity<String> logout(
            @RequestHeader("Authorization") String token) {

        logoutService.logout(token);
        return ResponseEntity.ok("로그아웃 되었습니다");
        //ok() → 상태코드 200 (성공) 으로 응답
        //ResponseEntity.ok("로그아웃 되었습니다")
        //→ 200 상태코드 + "로그아웃 되었습니다" 문자열 반환
    }

}
