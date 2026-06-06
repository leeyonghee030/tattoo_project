package com.study.tattoo_project.service;


import com.study.tattoo_project.dto.requestDto.ArtistRequestDto;
import com.study.tattoo_project.dto.responseDto.ArtistResponseDto;
import com.study.tattoo_project.entity.Artist;
import com.study.tattoo_project.entity.Style;
import com.study.tattoo_project.mapper.ArtistMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtistService {
    private final ArtistMapper artistMapper;
    private final ArtistStyleService artistStyleService;
    private final FlashDesignService flashDesignService;
    private final PortfolioService portfolioService;

    //목록 조회 (활성화 아티스트만)
    public List<ArtistResponseDto> findAll(){
        return artistMapper.findAll().stream()
                .map(ArtistResponseDto::from).toList();
    }

    //아티스트 상세조회
    public ArtistResponseDto findById(Long id){
        Artist artist = artistMapper.findById(id);
        List<Style> styles = artistStyleService.findStylesByArtistId(id);

        return ArtistResponseDto.from(artist,styles);
    }

    //등록
    public void save(ArtistRequestDto dto){
        artistMapper.save(dto.toEntity());
    }

    //수정
    public void update(Long id, ArtistRequestDto dto){
        artistMapper.update(dto.toEntity(id));
    }

    //비활성화
    @Transactional //여러 테이블 동시에 변경 → 하나 실패하면 전부 롤백
    public void deactivate(Long id){
        artistMapper.deactivate(id);
        flashDesignService.deactivateByArtistId(id);
        portfolioService.deactivateByArtistId(id);
        // TODO: 9단계 - Notice 만들 때 추가
        // noticeMapper.deactivateByAuthorId(artist.getUserId());

    }

    //활성화
    public void reactivate(Long id){
        artistMapper.reactivate(id);
    }


}
