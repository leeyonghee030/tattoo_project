package com.study.tattoo_project.service;


import com.study.tattoo_project.dto.requestDto.PortfolioRequestDto;
import com.study.tattoo_project.dto.responseDto.PortfolioResponseDto;
import com.study.tattoo_project.entity.Portfolio;
import com.study.tattoo_project.entity.Style;
import com.study.tattoo_project.mapper.PortfolioMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioService {
    private  final PortfolioMapper portfolioMapper;

//    전체조회 ,부위파트 , 스타일
    public List<PortfolioResponseDto> findAll(Long styleId, Long bodyPart){
        return portfolioMapper.findAll(styleId,bodyPart).stream()
                .map(PortfolioResponseDto::from).toList();
    }

//    상세조회 +장르
    public PortfolioResponseDto findById(Long id){
        Portfolio portfolio = portfolioMapper.findById(id);
        List<Style> styles = portfolioMapper.findStyleByPortfolioId(id);
        return PortfolioResponseDto.from(portfolio,styles);
    }
//    특정 아티스츠 포토폴리오 조회
    public List<PortfolioResponseDto> findByArtistId(Long artistId){
        return portfolioMapper.findByArtistId(artistId).stream()
                .map(PortfolioResponseDto::from).toList();
    }

//    등록 장르 저장따로
    @Transactional
    public void save(PortfolioRequestDto dto){
        Portfolio portfolio  = dto.toEntity();
        portfolioMapper.save(portfolio);
        portfolioMapper.insertStyles(portfolio.getId(),dto.getStyleIds());
    }

//    수정 장르 삭제루 +장르 저장따로
@Transactional
    public void update(Long id,PortfolioRequestDto dto){
        //삭제 먼저해도되나 ?
        portfolioMapper.deleteStyles(id);
        portfolioMapper.update(dto.toEntity(id));
        portfolioMapper.insertStyles(id,dto.getStyleIds());
    }

//    비활성화
    public void deactivate(Long id){
        portfolioMapper.deactivate(id);
    }
//    아티스티 비활성화시 비활성화
    public  void  deactivateByArtistId(Long artistId){
        portfolioMapper.deactivateByArtistId(artistId);
    }
}
