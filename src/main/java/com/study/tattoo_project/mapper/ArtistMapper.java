package com.study.tattoo_project.mapper;


import com.study.tattoo_project.entity.Artist;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ArtistMapper {
    //목록조회(활성화 아티스트만)
    List<Artist> findAll();
    //상세조회
    Artist findById(Long id);
    //등록
    void save(Artist artist);
    //수정
    void update(Artist artist);
    //비활성화
    void deactivate(Long id);
    //활성화
    void reactivate(Long id);


}
