package com.study.tattoo_project.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
//JSON으로 데이터 주고받는 API 만들 거면 @RestController 필수
public class HealthController {

    @GetMapping("/api/health")
    public String health() {
        return "서버 정상 작동 중";
    }
}