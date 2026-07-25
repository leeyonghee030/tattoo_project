package com.study.tattoo_project.mapper;

import com.study.tattoo_project.entity.TokenBlacklist;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TokenBlacklistMapper {
//    생성
    void save(TokenBlacklist tokenBlacklist);
//    조회
    TokenBlacklist findByToken(String token);
//    삭제
    void deleteExpired();

    }
