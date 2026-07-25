package com.study.tattoo_project.service;

import com.study.tattoo_project.dto.LoginRequestDto;
import com.study.tattoo_project.dto.LoginResponseDto;
import com.study.tattoo_project.entity.Admin;
import com.study.tattoo_project.mapper.AdminMapper;
import com.study.tattoo_project.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    public final AdminMapper adminMapper;
    public final JwtUtil jwtUtil;

    public LoginResponseDto login(LoginRequestDto loginRequestDto){
        Admin admin = adminMapper.findByEmail(loginRequestDto.getEmail());

        if(admin == null){
            throw new RuntimeException("이메일,비밀번호 한번더 확인 부탁드립니다.");
        }

        if (!loginRequestDto.getPassword().equals(admin.getPasswordHash())){
            throw new RuntimeException("이메일,비밀번호 한번더 확인 부탁드립니다.");
        }
        String token = jwtUtil.generateToken(loginRequestDto.getEmail(),"Admin");
        return LoginResponseDto.From(token);
    }


}
