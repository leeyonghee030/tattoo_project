package com.study.tattoo_project.service;


import com.study.tattoo_project.entity.TokenBlacklist;
import com.study.tattoo_project.mapper.TokenBlacklistMapper;
import com.study.tattoo_project.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LogoutService {

    public  final TokenBlacklistMapper tokenBlacklistMapper;
    public  final  JwtUtil jwtUtil;


    public void logout(String token){
        // 클라이언트가 "Bearer eyJhbGci..." 형태로 보내서
        // "Bearer " 앞부분 제거하고 순수 토큰만 추출
        String pureToken = token.replace("Bearer ", "");

        // 블랙리스트에 없으면 새로 저장
        // token → 순수 토큰값
        // expiresAt → 토큰 만료시간 (JwtUtil에서 꺼냄)
        TokenBlacklist exists = tokenBlacklistMapper.findByToken(pureToken);
        if(exists != null){
            return;
        }

        // 블랙리스트에 없으면 새로 저장
        // token → 순수 토큰값
        // expiresAt → 토큰 만료시간 (JwtUtil에서 꺼냄)
        TokenBlacklist blacklist = TokenBlacklist.builder()
                .token(pureToken)
                .expiresAt(jwtUtil.getExpiration(pureToken))
                .build();

        // DB에 저장
        tokenBlacklistMapper.save(blacklist);

    }
}
