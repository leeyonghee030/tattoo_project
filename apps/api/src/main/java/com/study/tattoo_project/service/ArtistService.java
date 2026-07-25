package com.study.tattoo_project.service;

import com.study.tattoo_project.dto.LoginRequestDto;
import com.study.tattoo_project.dto.LoginResponseDto;
import com.study.tattoo_project.entity.Artist;
import com.study.tattoo_project.mapper.ArtistMapper;
import com.study.tattoo_project.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArtistService {
    public final ArtistMapper artistMapper;
    private final  JwtUtil jwtUtil;


//    public ArtistService(ArtistMapper artistMapper,JwtUtil jwtUtil){
//        this.artistMapper = artistMapper;
//        this.jwtUtil = jwtUtil;
//    }



    public LoginResponseDto login(LoginRequestDto loginRequestDto){
        //일n단 email을 사용해서  db email이랑 비교
        Artist artist = artistMapper.findByEmail(loginRequestDto.getEmail());
        // 이메일 맞는지 값 있는지 확인
        if (artist == null) {
        throw new RuntimeException("이메일,비밀번호 한번더 확인 부탁드립니다.");
        }
        //이메일 맞아서 비번 맞는지 확인
        if(!loginRequestDto.getPassword().equals(artist.getPasswordHash())){
            throw new RuntimeException("이메일,비밀번호 한번더 확인 부탁드립니다.");
        }
        //둘다 맞아서 토큰 발행
        return LoginResponseDto.From(jwtUtil.generateToken(loginRequestDto.getEmail(), "Artist"));
    }

}
