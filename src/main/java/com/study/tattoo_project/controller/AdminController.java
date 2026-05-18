package com.study.tattoo_project.controller;

import com.study.tattoo_project.dto.LoginRequestDto;
import com.study.tattoo_project.dto.LoginResponseDto;
import com.study.tattoo_project.service.AdminService;
import com.study.tattoo_project.service.LogoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    public final AdminService adminService;
    public  final  LogoutService logoutService;

    @PostMapping("/login")
    public LoginResponseDto login(@RequestBody LoginRequestDto loginRequestDto){
      return   adminService.login(loginRequestDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization")String token){
        logoutService.logout(token);
        return  ResponseEntity.ok("로그아웃 되었습니다");
    }


}
