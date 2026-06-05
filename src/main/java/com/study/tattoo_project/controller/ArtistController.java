package com.study.tattoo_project.controller;



import com.study.tattoo_project.dto.requestDto.ArtistRequestDto;
import com.study.tattoo_project.dto.responseDto.ArtistResponseDto;
import com.study.tattoo_project.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/artists")
public class ArtistController {
    private final ArtistService artistService;

    //목록조회 활성화만
    @GetMapping
    public List<ArtistResponseDto> findAll(){
        return artistService.findAll();
    }
    //상세조회
    @GetMapping("/{id}")
    public ArtistResponseDto findById(@PathVariable Long id){
        return artistService.findById(id);
    }

    //등록
    @PostMapping
    public void  save(@RequestBody ArtistRequestDto dto){
        artistService.save(dto);
    }

    //수정
    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody ArtistRequestDto dto){
        artistService.update(id, dto);
    }

    //비활성화
    @PatchMapping("/{id}/deactivate")
    public void deactivate(@PathVariable Long id){
        artistService.deactivate(id);
    }

    //활성화
    @PatchMapping("/{id}/reactivate")
    public void reactivate(@PathVariable Long id){
        artistService.reactivate(id);
    }


}
