package com.study.tattoo_project.controller;

import com.study.tattoo_project.dto.requestDto.StyleRequestDto;
import com.study.tattoo_project.dto.responseDto.StyleResponseDto;
import com.study.tattoo_project.service.StyleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//JSON으로 데이터 주고받는 API 만들 거면 @RestController 필수
//자바스크립트나 AI가 쓸 순수한 데이터(JSON)만 리턴하는 API 창구야!"라고 선언하는 것.
@RequestMapping("/api/styles")
//인터넷 주소창에 /styles로 시작하는 모든 요청은 일단 다 이 클래스로 들어와서 처리해!"
// 하고 대문 주소를 달아두는 것
@RequiredArgsConstructor //`final` 필드 자동 주입
public class StyleController {

    private final StyleService styleService;

    //조회
    @GetMapping
    public List<StyleResponseDto> findAll() {
        return styleService.findAll();
    }

    //등록
    @PostMapping
    public void save(@RequestBody StyleRequestDto dto) {
        styleService.save(dto);
    }

    //수정
    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody StyleRequestDto dto) {
        styleService.update(id, dto);
    }

    //삭제
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        styleService.delete(id);
    }


    //데이터 위치 정리
    //
    //  ┌────────┬────────────────────────┬──────────────────────────────┐
    //  │  방식  │      데이터 위치       │         꺼내는 방법          │
    //  ├────────┼────────────────────────┼──────────────────────────────┤
    //  │ GET    │ URL /todos/1           │ @PathVariable                │
    //  ├────────┼────────────────────────┼──────────────────────────────┤
    //  │ POST   │ body {"title":"study"} │ @RequestBody                 │
    //  ├────────┼────────────────────────┼──────────────────────────────┤
    //  │ PUT    │ URL + body 둘 다        │ @PathVariable + @RequestBody │
    //  ├────────┼────────────────────────┼──────────────────────────────┤
    //  │ DELETE │ URL /todos/1           │ @PathVariable                │
    //  └────────┴────────────────────────┴──────────────────────────────┘
}
