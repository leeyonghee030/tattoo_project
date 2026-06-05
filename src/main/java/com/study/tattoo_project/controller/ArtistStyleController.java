package com.study.tattoo_project.controller;

import com.study.tattoo_project.dto.requestDto.ArtistStyleRequestDto;
import com.study.tattoo_project.service.ArtistStyleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/artists")
public class ArtistStyleController {
    private final ArtistStyleService artistStyleService;

    @PutMapping("/{id}/styles")
    public void updateStyle(@PathVariable("id") Long artistId, @RequestBody ArtistStyleRequestDto dto) {
        artistStyleService.updateStyle(artistId, dto);
    }
}
