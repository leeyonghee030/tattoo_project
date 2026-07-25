package com.study.tattoo_project.config;

import com.study.tattoo_project.interceptor.JwtInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//// Spring MVC 설정 클래스
//// WebMvcConfigurer 구현해서 인터셉터 등록
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    //WebConfig + JwtInterceptor
    //→ 토큰 있는지 없는지만 체크 (로그인 여부)
    private final JwtInterceptor jwtInterceptor;

    // 인터셉터 등록하는 메서드
    // Spring이 자동으로 호출해줌
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)// JwtInterceptor 등록
                .addPathPatterns("/**")          // 모든 URL에 적용
                .excludePathPatterns(            // 아래 URL은 인터셉터 제외
                        "/api/admin/login",          // 관리자 로그인
                        "/api/artist/login"          // 아티스트 로그인
                );

//        addPathPatterns("/**")     → 모든 URL에 인터셉터 적용
//excludePathPatterns(...)   → 로그인 URL은 제외
    }
}