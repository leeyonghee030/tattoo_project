package com.study.tattoo_project.interceptor;

import com.study.tattoo_project.entity.TokenBlacklist;
import com.study.tattoo_project.mapper.TokenBlacklistMapper;
import com.study.tattoo_project.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {
    public final JwtUtil jwtUtil;
    public final TokenBlacklistMapper tokenBlacklistMapper;

    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        // a. 헤더에서 토큰 꺼내기
        String token = request.getHeader("Authorization");


//        request  → 클라이언트가 보낸 것 꺼내기
//response → 클라이언트에게 보낼 것 설정하기

        // 토큰 없으면 차단
        if (token == null) {
            response.setStatus(401);
            return false;
        }

        // "Bearer " 제거
        String pureToken = token.replace("Bearer ", "");

        // b. 토큰 유효한지 체크
        if (!jwtUtil.isValid(pureToken)) {
            response.setStatus(401);
            return false;
        }

        // c. 블랙리스트 체크
        TokenBlacklist blacklist = tokenBlacklistMapper.findByToken(pureToken);
        if (blacklist != null) {
            response.setStatus(401);
            return false;
        }

        // d. 통과
        return true;
    }
    }
