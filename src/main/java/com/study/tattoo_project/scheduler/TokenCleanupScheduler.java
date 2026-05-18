package com.study.tattoo_project.scheduler;

import com.study.tattoo_project.mapper.TokenBlacklistMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final TokenBlacklistMapper tokenBlacklistMapper;

    // 매일 새벽 3시에 자동 실행
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupExpiredTokens() {
        // 만료된 토큰 전부 삭제
        tokenBlacklistMapper.deleteExpired();
    }
}