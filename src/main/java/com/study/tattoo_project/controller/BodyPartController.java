package com.study.tattoo_project.controller;


import com.study.tattoo_project.dto.requestDto.BodyPartRequestDto;
import com.study.tattoo_project.dto.responseDto.BodyPartResponseDto;
import com.study.tattoo_project.service.BodyPartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/body-parts")
@RequiredArgsConstructor
public class BodyPartController {

    private final BodyPartService bodyPartService;

    //조회
    @GetMapping
    public List<BodyPartResponseDto> findAll(){
        return bodyPartService.findAll();
    }

    //등록
    @PostMapping
    public  void save(@RequestBody BodyPartRequestDto requestDto){
        bodyPartService.save(requestDto);
    }

    //수정
    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody BodyPartRequestDto requestDto){
        bodyPartService.update(id,requestDto);
    }

    //삭제
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        bodyPartService.delete(id);
    }



}
